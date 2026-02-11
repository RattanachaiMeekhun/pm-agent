from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"

class ProjectBase(BaseModel):
    name: str
    client: Optional[str] = None
    budget: Optional[int] = 0
    description: Optional[str] = None
    is_active: Optional[bool] = True
    status: Optional[ProjectStatus] = ProjectStatus.NOT_STARTED
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: Optional[int] = None

    class Config:
        from_attributes = True