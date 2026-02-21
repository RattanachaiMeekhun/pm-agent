from typing import TypedDict, Annotated, List, Optional
from langchain_core.messages import BaseMessage

def add_messages(left: list, right: list):
    return left + right

class QAState(TypedDict):
    """
    Represents the state of the QA Agent.
    """
    messages: Annotated[List[BaseMessage], add_messages]
    sow_content: dict
