from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

# Shared properties
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: str | None = None
    is_active: bool = True

class ProjectBase(SQLModel):
    name: str = Field(index=True)
    description: str | None = None

class TaskBase(SQLModel):
    title: str
    status: str = "todo" # todo, in_progress, done
    priority: int = 1

# Database Models
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    
    # Relationships
    owned_projects: List["Project"] = Relationship(back_populates="owner")
    assigned_tasks: List["Task"] = Relationship(back_populates="assignee")

class Project(ProjectBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int | None = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    owner: Optional[User] = Relationship(back_populates="owned_projects")
    tasks: List["Task"] = Relationship(back_populates="project")

class Task(TaskBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    project_id: int | None = Field(default=None, foreign_key="project.id")
    assignee_id: int | None = Field(default=None, foreign_key="user.id")
    
    # Relationships
    project: Optional[Project] = Relationship(back_populates="tasks")
    assignee: Optional[User] = Relationship(back_populates="assigned_tasks")
