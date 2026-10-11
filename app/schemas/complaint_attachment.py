
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ComplaintAttachmentResponse(BaseModel):
    id: int
    complaint_id: int
    uploaded_by: int
    resource_type: str
    file_url: str
    original_filename: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
