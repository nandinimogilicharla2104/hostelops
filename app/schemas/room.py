from pydantic import BaseModel


class RoomCreate(BaseModel):
    room_number: str
    block_id: int


class RoomResponse(BaseModel):
    id: int
    room_number: str
    block_id: int

    model_config = {
        "from_attributes": True
    }