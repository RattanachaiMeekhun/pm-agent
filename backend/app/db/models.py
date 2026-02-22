from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
import enum

class ProjectStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"

from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    items = relationship("Item", back_populates="owner")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="items")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(String, unique=True, index=True, nullable=False)
    sow_structured= Column(JSONB, default=False)
    is_active = Column(Boolean, default=True)

    # New fields
    status = Column(String, default=ProjectStatus.NOT_STARTED.value)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", backref="managed_projects")
    messages = relationship("ChatMessage", back_populates="project")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(String, index=True)
    role = Column(String)  # user, assistant, system
    content = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("Project", back_populates="messages")
