import os
from uuid import uuid4

import cloudinary
import cloudinary.uploader

from fastapi import File, UploadFile
from app.core.cloudinary_config import configure_cloudinary
from app.models.complaint import Complaint
from app.models.complaint_attachment import ComplaintAttachment
from app.schemas.complaint_attachment import ComplaintAttachmentResponse


from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from cloudinary.utils import cloudinary_url

from app.core.dependencies import (
    get_current_user,
    require_role,
)

from app.database.connection import get_db
from app.models.user import User
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate,
    ComplaintHistoryResponse,
)

from app.services.complaint_service import (
    create_complaint,
    get_all_complaints,
    get_complaint_by_id,
    update_complaint_status,
    assign_complaint,
    get_complaint_history
)
from app.services.complaint_service import get_assigned_complaints
from app.core.exceptions import HostelOpsException

from app.models.room import Room
from app.models.block import Block



router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


@router.post(
    "",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_complaint(
    complaint_data: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_complaint(
            db=db,
            student_id=current_user.id,
            complaint_data=complaint_data
        )


@router.get(
    "",
    response_model=list[ComplaintResponse]
)
def get_complaints(
    status: str | None = None,
    priority: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "student":
        return get_all_complaints(
            db=db,
            student_id=current_user.id,
            status=status,
            priority=priority,
            page=page,
            limit=limit
        )

    if current_user.role == "technician":
        return get_assigned_complaints(
            db=db,
            technician_user_id=current_user.id,
            status=status,
            priority=priority,
        )

    if current_user.role == "warden":
        return get_all_complaints(
            db=db,
            hostel_id=current_user.hostel_id,
            status=status,
            priority=priority,
            page=page,
            limit=limit
        )

    if current_user.role == "admin":
        return get_all_complaints(db=db)

    
    raise HTTPException(
        status_code=403,
        detail="You do not have permission to view complaints"
    )


@router.get("/assigned-to-me", response_model=list[ComplaintResponse])
def get_my_assigned_complaints(
    status: str | None = None,
    priority: str | None = None,
    current_user: User = Depends(require_role("technician")),
    db: Session = Depends(get_db)

):
    return get_assigned_complaints(
        db=db,
        technician_user_id=current_user.id,
        status=status,
        priority=priority
    )


@router.get(
    "/{complaint_id}",
    response_model=ComplaintResponse
)
def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = get_complaint_by_id(
        db=db,
        complaint_id=complaint_id
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if current_user.role == "student":
        if complaint.student_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to view this complaint"
            )

    elif current_user.role == "technician":
        if complaint.assigned_technician_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view complaints assigned to you"
            )

    elif current_user.role == "warden":
        room = db.query(Room).filter(
            Room.id == complaint.room_id
        ).first()

        if room is None:
            raise HTTPException(
                status_code=404,
                detail="Room not found"
            )

        block = db.query(Block).filter(
            Block.id == room.block_id
        ).first()

        if block is None:
            raise HTTPException(
                status_code=404,
                detail="Block not found"
            )

        if block.hostel_id != current_user.hostel_id:
            raise HTTPException(
                status_code=403,
                detail="You can only view complaints from your hostel"
            )

    elif current_user.role == "admin":
        pass

    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view complaints"
        )

    technician_name = None

    if complaint.assigned_technician_id is not None:
        technician_user = db.query(User).filter(
            User.id == complaint.assigned_technician_id
        ).first()

        if technician_user:
            technician_name = technician_user.name

    return ComplaintResponse(
        id=complaint.id,
        student_id=complaint.student_id,
        room_id=complaint.room_id,
        category_id=complaint.category_id,
        title=complaint.title,
        description=complaint.description,
        priority=complaint.priority,
        status=complaint.status,
        assigned_technician_id=complaint.assigned_technician_id,
        assigned_technician_name=technician_name,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at
    )



ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_VIDEO_SIZE = 50 * 1024 * 1024


@router.post(
    "/{complaint_id}/attachments",
    response_model=ComplaintAttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_complaint_attachment(
    complaint_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    complaint = get_complaint_by_id(db=db, complaint_id=complaint_id)

    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Apply the same complaint-access rules as the detail endpoint.
    if current_user.role == "student":
        allowed = complaint.student_id == current_user.id
    elif current_user.role == "technician":
        allowed = complaint.assigned_technician_id == current_user.id
    elif current_user.role == "warden":
        room = db.query(Room).filter(Room.id == complaint.room_id).first()
        block = (
            db.query(Block).filter(Block.id == room.block_id).first()
            if room else None
        )
        allowed = block is not None and block.hostel_id == current_user.hostel_id
    elif current_user.role == "admin":
        allowed = True
    else:
        allowed = False

    if not allowed:
        raise HTTPException(status_code=403, detail="You cannot access this complaint")

    content_type = (file.content_type or "").lower()
    if content_type in ALLOWED_IMAGE_TYPES:
        resource_type = "image"
        max_size = MAX_IMAGE_SIZE
    elif content_type in ALLOWED_VIDEO_TYPES:
        resource_type = "video"
        max_size = MAX_VIDEO_SIZE
    else:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Upload a JPEG, PNG, WebP, MP4, WebM, or QuickTime video.",
        )

    contents = await file.read(max_size + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    if len(contents) > max_size:
        raise HTTPException(status_code=413, detail="The file exceeds the allowed size")

    public_id = f"complaint_{complaint_id}_{uuid4().hex}"

    try:
        configure_cloudinary()
        result = cloudinary.uploader.upload(
            contents,
            resource_type=resource_type,
            folder=f"hostelops/complaints/{complaint_id}",
            public_id=public_id,
            type="authenticated",
            overwrite=False,
        )

        attachment = ComplaintAttachment(
            complaint_id=complaint_id,
            uploaded_by=current_user.id,
            resource_type=resource_type,
            storage_public_id=result["public_id"],
            file_url=result["secure_url"],
            original_filename=os.path.basename(file.filename or "upload"),
        )
        db.add(attachment)
        db.commit()
        db.refresh(attachment)
        return attachment

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print(
            f"Attachment upload failed: "
            f"{type(exc).__name__}: {exc}"
        )
        raise HTTPException(
            status_code=502,
            detail="The attachment could not be uploaded. Please try again.",
        ) from exc
    finally:
        await file.close()


@router.get(
    "/{complaint_id}/attachments",
    response_model=list[ComplaintAttachmentResponse],
)
def list_complaint_attachments(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Reuse the existing complaint endpoint's authorization checks.
    complaint = get_complaint_by_id(
        db=db,
        complaint_id=complaint_id,
    )

    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if current_user.role == "student":
        allowed = complaint.student_id == current_user.id
    elif current_user.role == "technician":
        allowed = complaint.assigned_technician_id == current_user.id
    elif current_user.role == "warden":
        room = db.query(Room).filter(Room.id == complaint.room_id).first()
        block = (
            db.query(Block).filter(Block.id == room.block_id).first()
            if room else None
        )
        allowed = block is not None and block.hostel_id == current_user.hostel_id
    elif current_user.role == "admin":
        allowed = True
    else:
        allowed = False

    if not allowed:
        raise HTTPException(
            status_code=403,
            detail="You cannot access this complaint",
        )

    return (
        db.query(ComplaintAttachment)
        .filter(ComplaintAttachment.complaint_id == complaint_id)
        .order_by(ComplaintAttachment.created_at.desc())
        .all()
    )


@router.get(
    "/{complaint_id}/attachments/{attachment_id}/url",
)
def get_complaint_attachment_url(
    complaint_id: int,
    attachment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    complaint = get_complaint_by_id(
        db=db,
        complaint_id=complaint_id,
    )

    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Enforce the same access rules used by the complaint detail endpoint.
    if current_user.role == "student":
        allowed = complaint.student_id == current_user.id
    elif current_user.role == "technician":
        allowed = complaint.assigned_technician_id == current_user.id
    elif current_user.role == "warden":
        room = db.query(Room).filter(Room.id == complaint.room_id).first()
        block = (
            db.query(Block).filter(Block.id == room.block_id).first()
            if room else None
        )
        allowed = block is not None and block.hostel_id == current_user.hostel_id
    elif current_user.role == "admin":
        allowed = True
    else:
        allowed = False

    if not allowed:
        raise HTTPException(status_code=403, detail="You cannot access this complaint")

    attachment = (
        db.query(ComplaintAttachment)
        .filter(
            ComplaintAttachment.id == attachment_id,
            ComplaintAttachment.complaint_id == complaint_id,
        )
        .first()
    )

    if attachment is None:
        raise HTTPException(status_code=404, detail="Attachment not found")

    try:
        configure_cloudinary()

        url, _ = cloudinary_url(
            attachment.storage_public_id,
            resource_type=attachment.resource_type,
            type="authenticated",
            sign_url=True,
            secure=True,
            version=None,
        )

        return {"url": url}
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not generate the attachment URL",
        ) from exc


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
def update_status(
    complaint_id: int,
    status_data: ComplaintStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = get_complaint_by_id(
        db=db,
        complaint_id=complaint_id
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if current_user.role == "technician":
        if complaint.assigned_technician_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update complaints assigned to you"
            )

        if status_data.status not in {"IN_PROGRESS", "RESOLVED"}:
            raise HTTPException(
                status_code=403,
                detail="Technicians can only change complaints to IN_PROGRESS or RESOLVED"
            )

    elif current_user.role == "warden":
        room = db.query(Room).filter(
            Room.id == complaint.room_id
        ).first()

        if room is None:
            raise HTTPException(
                status_code=404,
                detail="Room not found"
            )

        block = db.query(Block).filter(
            Block.id == room.block_id
        ).first()

        if block is None:
            raise HTTPException(
                status_code=404,
                detail="Block not found"
            )

        if block.hostel_id != current_user.hostel_id:
            raise HTTPException(
                status_code=403,
                detail="You can only update complaints from your hostel"
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update complaint status"
        )
    return update_complaint_status(
        db=db,
        complaint=complaint,
        new_status=status_data.status,
        changed_by=current_user.id
    )

@router.get(
    "/{complaint_id}/history",
    response_model=list[ComplaintHistoryResponse]
)
def get_history(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = get_complaint_by_id(
        db=db,
        complaint_id=complaint_id
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if current_user.role == "student":
        if complaint.student_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to view this complaint"
            )

    elif current_user.role == "technician":
        if complaint.assigned_technician_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view history of complaints assigned to you"
            )

    elif current_user.role == "warden":
        room = db.query(Room).filter(
            Room.id == complaint.room_id
        ).first()

        if room is None:
            raise HTTPException(
                status_code=404,
                detail="Room not found"
            )

        block = db.query(Block).filter(
            Block.id == room.block_id
        ).first()

        if block is None:
            raise HTTPException(
                status_code=404,
                detail="Block not found"
            )

        if block.hostel_id != current_user.hostel_id:
            raise HTTPException(
                status_code=403,
                detail="You can only view complaint history from your hostel"
            )

    elif current_user.role == "admin":
        pass

    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view complaint history"
        )

    return get_complaint_history(
        db=db,
        complaint_id=complaint_id
    )


@router.post("/{complaint_id}/assign", response_model=ComplaintResponse)
def assign_complaint_to_technician(
    complaint_id: int,
    current_user: User = Depends(require_role("warden")),
    db: Session = Depends(get_db)
):
    complaint = get_complaint_by_id(
        db=db,
        complaint_id=complaint_id
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    room = db.query(Room).filter(
        Room.id == complaint.room_id
    ).first()

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    block = db.query(Block).filter(
        Block.id == room.block_id
    ).first()

    if block is None:
        raise HTTPException(
            status_code=404,
            detail="Block not found"
        )

    if block.hostel_id != current_user.hostel_id:
        raise HTTPException(
            status_code=403,
            detail="You can only assign complaints from your hostel"
        )

    return assign_complaint(
        db=db,
        complaint=complaint,
        assigned_by=current_user.id
    )