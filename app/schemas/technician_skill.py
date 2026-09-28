from pydantic import BaseModel, Field


class TechnicianSkillCreate(BaseModel):
    technician_id: int
    category_id: int
    skill_level: int = Field(default=1, ge=1, le=5)


class TechnicianSkillResponse(BaseModel):
    id: int
    technician_id: int
    category_id: int
    skill_level: int

    model_config = {"from_attributes": True}