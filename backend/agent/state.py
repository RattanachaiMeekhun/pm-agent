from typing import TypedDict, List, Optional

class AgentState(TypedDict):
    messages: List[str]
    raw_brief: str
    analysis: str
    missing_info: List[str]
    sow_content: str