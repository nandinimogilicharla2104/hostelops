from sqlalchemy.orm import Session

from app.models.complaint import Complaint

from app.models.room import Room
from app.models.block import Block


def get_technician_dashboard(
    db: Session,
    technician_user_id: int
) -> dict:

    complaints = (
        db.query(Complaint)
        .filter(
            Complaint.assigned_technician_id == technician_user_id
        )
        .all()
    )

    total_assigned = len(complaints)

    pending = sum(
        1 for complaint in complaints
        if complaint.status in {"ASSIGNED", "ACKNOWLEDGED"}
    )

    in_progress = sum(
        1 for complaint in complaints
        if complaint.status == "IN_PROGRESS"
    )

    resolved = sum(
        1 for complaint in complaints
        if complaint.status in {"RESOLVED", "CLOSED"}
    )

    return {
        "total_assigned": total_assigned,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved
    }

def get_warden_dashboard(
    db: Session,
    hostel_id: int
) -> dict:

    complaints = (
        db.query(Complaint)
        .join(
            Room,
            Complaint.room_id == Room.id
        )
        .join(
            Block,
            Room.block_id == Block.id
        )
        .filter(
            Block.hostel_id == hostel_id
        )
        .all()
    )

    total_complaints = len(complaints)

    submitted = sum(
        1 for complaint in complaints
        if complaint.status == "SUBMITTED"
    )

    assigned = sum(
        1 for complaint in complaints
        if complaint.status == "ASSIGNED"
    )

    in_progress = sum(
        1 for complaint in complaints
        if complaint.status == "IN_PROGRESS"
    )

    resolved = sum(
        1 for complaint in complaints
        if complaint.status in {"RESOLVED", "CLOSED"}
    )

    return {
        "total_complaints": total_complaints,
        "submitted": submitted,
        "assigned": assigned,
        "in_progress": in_progress,
        "resolved": resolved
    }

