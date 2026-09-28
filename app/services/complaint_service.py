
from sqlalchemy.orm import Session

from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate
from app.models.complaint_history import ComplaintHistory
from app.models.room import Room
from app.models.block import Block
from app.models.technician import Technician
from app.models.technician_skill import TechnicianSkill
from app.models.room_assignment import RoomAssignment
from app.services.notification_service import create_notification
from sqlalchemy import case

from app.core.exceptions import HostelOpsException

import logging


logger = logging.getLogger(__name__)


def create_complaint(
    db: Session,
    student_id: int,
    complaint_data: ComplaintCreate
) -> Complaint:


    active_assignment = (
        db.query(RoomAssignment)
        .filter(
            RoomAssignment.user_id == student_id,
            RoomAssignment.is_active == True
        )
        .first()
    )

    if active_assignment is None:
        raise HostelOpsException(
            "Student does not have an active room assignment"
        )
    if active_assignment.room_id != complaint_data.room_id:
        raise HostelOpsException(
            "Students can only create complaints for their assigned room"
        )

    complaint = Complaint(
        student_id=student_id,
        room_id=complaint_data.room_id,
        category_id=complaint_data.category_id,
        title=complaint_data.title,
        description=complaint_data.description,
        priority=complaint_data.priority,
        status="SUBMITTED"
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    create_notification(
        db=db,
        user_id=complaint.student_id,
        title="Complaint Status Updated",
        message=f"Complaint #{complaint.id} status changed to {complaint.status}."
    )
    return complaint

def get_all_complaints(
    db: Session,
    student_id: int | None = None,
    hostel_id: int | None = None,
    status: str | None = None,
    priority: str | None = None,
    page: int = 1,
    limit: int = 10
) -> list[Complaint]:

    query = db.query(Complaint)

    if student_id is not None:
        query = query.filter(
            Complaint.student_id == student_id
        )

    if hostel_id is not None:
        query = (
            query
            .join(Room, Complaint.room_id == Room.id)
            .join(Block, Room.block_id == Block.id)
            .filter(Block.hostel_id == hostel_id)
        )

    if status is not None:
        query = query.filter(
            Complaint.status == status.upper()
        )

    if priority is not None:
        query = query.filter(
            Complaint.priority == priority.upper()
        )
    

    query = query.order_by(
        case(
            (Complaint.priority == "HIGH", 1),
            (Complaint.priority == "MEDIUM", 2),
            (Complaint.priority == "LOW", 3),
            else_=4
        ),
        Complaint.created_at.desc()
    )

    offset = (page - 1) * limit

    return query.offset(offset).limit(limit).all()


def get_complaint_by_id(
    db: Session,
    complaint_id: int
) -> Complaint | None:
    return db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()


def update_complaint_status(
    db: Session,
    complaint: Complaint,
    new_status: str,
    changed_by: int
) -> Complaint:

    allowed_transitions = {
        "SUBMITTED": {"ACKNOWLEDGED"},
        "ACKNOWLEDGED": {"ASSIGNED"},
        "ASSIGNED": {"IN_PROGRESS"},
        "IN_PROGRESS": {"RESOLVED"},
        "RESOLVED": {"CLOSED", "REOPENED"},
        "CLOSED": {"REOPENED"},
        "REOPENED": {"ACKNOWLEDGED"},
    }

    if new_status not in allowed_transitions.get(complaint.status, set()):
        raise HostelOpsException(
            f"Cannot change status from {complaint.status} to {new_status.value}"
        )

    history = ComplaintHistory(
        complaint_id=complaint.id,
        changed_by=changed_by,
        old_status=complaint.status,
        new_status=new_status
    )

    complaint.status = new_status

    logger.info(
        "Complaint %s status changed from %s to %s by user %s",
        complaint.id,
        history.old_status,
        new_status.value,
        changed_by
    )

    if new_status == "CLOSED" and complaint.assigned_technician_id is not None:
        technician = db.query(Technician).filter(
            Technician.user_id == complaint.assigned_technician_id
        ).first()

        if technician is not None and technician.current_workload > 0:
            technician.current_workload -= 1

    db.add(history)
    db.commit()
    db.refresh(complaint)
    create_notification(
        db=db,
        user_id=complaint.student_id,
        title="Complaint Status Updated",
        message=f"Complaint #{complaint.id} status changed to {complaint.status}."
    )
    return complaint

def get_complaint_history(
    db: Session,
    complaint_id: int
) -> list[ComplaintHistory]:

    return db.query(ComplaintHistory).filter(
        ComplaintHistory.complaint_id == complaint_id
    ).order_by(
        ComplaintHistory.changed_at.asc()
    ).all()


def assign_complaint(
    db: Session,
    complaint: Complaint,
    assigned_by: int
) -> Complaint:
    allowed_statuses = {
        "SUBMITTED",
        "ACKNOWLEDGED",
        "REOPENED"
    }

    if complaint.status not in allowed_statuses:
        raise HostelOpsException(
            f"Complaint cannot be assigned when status is {complaint.status}"
        )

    room = db.query(Room).filter(
        Room.id == complaint.room_id
    ).first()

    if room is None:
        raise HostelOpsException("Room not found")

    block = db.query(Block).filter(
        Block.id == room.block_id
    ).first()

    if block is None:
        raise HostelOpsException("Block not found")

    technician = (
        db.query(Technician)
        .join(
            TechnicianSkill,
            Technician.id == TechnicianSkill.technician_id
        )
        .filter(
            TechnicianSkill.category_id == complaint.category_id,
            Technician.availability_status == "AVAILABLE"
        )
        .order_by(
            (Technician.hostel_id != block.hostel_id).asc(),
            TechnicianSkill.skill_level.desc(),
            Technician.current_workload.asc()
        )
        .first()
    )

    if technician is None:
        raise HostelOpsException(
            "No qualified technician available"
        )

    old_status = complaint.status
    old_technician_id = complaint.assigned_technician_id

    if old_technician_id is not None:
        old_technician = db.query(Technician).filter(
            Technician.user_id == old_technician_id
        ).first()

        if old_technician is not None and old_technician.id != technician.id:
            if old_technician.current_workload > 0:
                old_technician.current_workload -= 1

    complaint.assigned_technician_id = technician.user_id
    complaint.status = "ASSIGNED"

    technician.current_workload += 1

    history = ComplaintHistory(
        complaint_id=complaint.id,
        changed_by=assigned_by,
        old_status=old_status,
        new_status="ASSIGNED",
        note=f"Assigned to technician {technician.employee_id}"
    )

    db.add(history)

    try:
        db.commit()
        db.refresh(complaint)
    except Exception:
        db.rollback()
        raise

    create_notification(
        db=db,
        user_id=technician.user_id,
        title="Complaint Assigned",
        message=f"Complaint #{complaint.id} has been assigned to you."
    )

    return complaint


def get_assigned_complaints(
    db: Session,
    technician_user_id: int,
    status: str | None = None,
    priority: str | None = None
) -> list[Complaint]:


    query = db.query(Complaint).filter(
        Complaint.assigned_technician_id == technician_user_id
    )

    if status is not None:
        query = query.filter(
            Complaint.status == status.upper()
        )

    if priority is not None:
        query = query.filter(
            Complaint.priority == priority.upper()
        )

    return query.all()


def get_complaint_history(
    db: Session,
    complaint_id: int
) -> list[ComplaintHistory]:

    return (
        db.query(ComplaintHistory)
        .filter(
            ComplaintHistory.complaint_id == complaint_id
        )
        .order_by(
            ComplaintHistory.changed_at.asc()
        )
        .all()
    )





