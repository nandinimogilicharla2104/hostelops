from pydantic import BaseModel


class BlockCreate(BaseModel):
    name: str
    hostel_id: int


class BlockResponse(BaseModel):
    id: int
    name: str
    hostel_id: int

    model_config = {
        "from_attributes": True
    }