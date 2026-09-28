from pydantic import BaseModel


class ComplaintCategoryCreate(BaseModel):
    name: str
    description: str | None = None


class ComplaintCategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None
    is_active: bool

    model_config = {"from_attributes": True}