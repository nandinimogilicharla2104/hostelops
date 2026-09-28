from pydantic import BaseModel
from enum import Enum


class TechnicianCreate(BaseModel):
    user_id: int
    employee_id: str
    hostel_id: int

class TechnicianStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"

class TechnicianStatusUpdate(BaseModel):
    availability_status: TechnicianStatus
    

class TechnicianResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    availability_status: str
    current_workload: int
    hostel_id: int

    model_config = {"from_attributes": True}
    