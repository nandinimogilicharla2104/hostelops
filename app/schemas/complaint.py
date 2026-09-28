from pydantic import BaseModel

from datetime import datetime

from pydantic import BaseModel

from enum import Enum


class ComplaintStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REOPENED = "REOPENED"


class ComplaintCreate(BaseModel):
    room_id: int
    category_id: int
    title: str
    description: str
    priority: str = "MEDIUM"

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus

class ComplaintResponse(BaseModel):
    id: int
    student_id: int
    room_id: int
    category_id: int
    title: str
    description: str
    priority: str
    status: str
    assigned_technician_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class ComplaintHistoryResponse(BaseModel):
    id: int
    complaint_id: int
    changed_by: int
    old_status: str | None
    new_status: str
    note: str | None
    changed_at: datetime

    model_config = {"from_attributes": True}