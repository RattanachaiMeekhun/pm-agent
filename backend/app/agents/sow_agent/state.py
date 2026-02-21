from typing import TypedDict, Annotated, List, Optional
from langchain_core.messages import BaseMessage

def add_messages(left: list, right: list):
    return left + right

class AgentState(TypedDict):
    """
    Represents the state of the Project Manager Agent.
    """
    messages: Annotated[List[BaseMessage], add_messages]
    requirements: dict
    missing_info: List[str]
    sow_content: Optional[str]
    stage: str
    tsd_content: Optional[str]
    revision_count: int
