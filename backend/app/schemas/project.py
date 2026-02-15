from pydantic import BaseModel, Field, model_validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"

class ProjectBase(BaseModel):
    is_active: Optional[bool] = True
    status: Optional[ProjectStatus] = ProjectStatus.NOT_STARTED
    sow_structured: Optional[Any] = None

class ProjectCreate(ProjectBase):
    thread_id: str

class ProjectUpdate(BaseModel):
    """Schema for partial project updates (e.g., editing SOW)."""
    sow_structured: Optional[Any] = None
    status: Optional[ProjectStatus] = None
    is_active: Optional[bool] = None

class Project(ProjectBase):
    id: int
    thread_id: str
    name: Optional[str] = None
    client: Optional[str] = "Undisclosed"
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: Optional[int] = None

    @model_validator(mode='after')
    def extract_from_sow(self):
        if isinstance(self.sow_structured, dict):
            info = self.sow_structured.get("project_info", {})
            if not self.name and info.get("title"):
                self.name = info["title"]
            if self.client == "Undisclosed" and info.get("client"):
                self.client = info["client"]
        return self

    class Config:
        from_attributes = True

class ProjectListItem(Project):
    """Schema for project list responses — excludes sow_structured."""
    sow_structured: Optional[Any] = Field(default=None, exclude=True)

    class Config:
        from_attributes = True
