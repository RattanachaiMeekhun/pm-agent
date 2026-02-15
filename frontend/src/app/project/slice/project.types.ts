// --- SOW Block Types ---
export interface SowTableData {
    headers: string[];
    rows: string[][];
}

export interface SowBlock {
    section: string;
    title: string;
    content_type: "text" | "list" | "table";
    data: string | string[] | SowTableData;
}

export interface SowProjectInfo {
    title: string;
    client: string;
    version: string;
}

export interface SowData {
    project_info: SowProjectInfo;
    sow_blocks: SowBlock[];
}

// --- Project Types ---
export type Project = {
    id: number;
    name: string;
    client: string;
    created_at: string;
    updated_at: string;
    owner_id: number;
}

export type ProjectItem = Project & {
    sow_structured: SowData | null;
}

// --- Update Payload ---
export interface ProjectUpdatePayload {
    id: number;
    sow_structured: SowData;
}