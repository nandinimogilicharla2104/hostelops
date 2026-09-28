from datetime import datetime

from pydantic import BaseModel


class RoomAssignmentCreate(BaseModel):
    user_id: int
    room_id: int


class RoomAssignmentResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    assigned_at: datetime
    is_active: bool

    model_config = {
        "from_attributes": True
    }