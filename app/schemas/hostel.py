from pydantic import BaseModel

from app.models.hostel import HostelType


class HostelCreate(BaseModel):
    name: str
    location: str | None = None
    type: HostelType


class HostelResponse(BaseModel):
    id: int
    name: str
    location: str | None
    type: HostelType

    model_config = {
        "from_attributes": True
    }