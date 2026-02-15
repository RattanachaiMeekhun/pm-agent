import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; 
import { setSowLocal } from "../../slice/project.slice";
import { updateProjectSow } from "../../slice/project.thunks";
import { SowData, SowTableData, SowBlock } from "../../slice/project.types";

/**
 * Custom hook that encapsulates all SOW editing logic.
 * Purely manages data transformations — no UI dependencies.
 * Easy to unit test with a mock Redux store.
 */
export function useProjectSow() {
    const dispatch = useAppDispatch();
    const project = useAppSelector((s) => s.project.projectItem);
    const saving = useAppSelector((s) => s.project.saving);
    const loading = useAppSelector((s) => s.project.loading);

    const sow: SowData | null = useMemo(() => {
        if (!project?.sow_structured) return null;
        return project.sow_structured;
    }, [project]);

    // --- Helpers ---

    const _dispatchLocal = useCallback(
        (updatedSow: SowData) => {
            dispatch(setSowLocal(updatedSow));
        },
        [dispatch],
    );

    // --- Mutation Functions ---

    /** Update project_info fields (title, client, version) */
    const updateProjectInfo = useCallback(
        (field: keyof SowData["project_info"], value: string) => {
            if (!sow) return;
            const updated: SowData = {
                ...sow,
                project_info: { ...sow.project_info, [field]: value },
            };
            _dispatchLocal(updated);
        },
        [sow, _dispatchLocal],
    );

    /** Update a single block's title */
    const updateBlockTitle = useCallback(
        (blockIndex: number, title: string) => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            blocks[blockIndex] = { ...blocks[blockIndex], title };
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Update text-type block data */
    const updateBlockText = useCallback(
        (blockIndex: number, text: string) => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            blocks[blockIndex] = { ...blocks[blockIndex], data: text };
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Update a single item in a list-type block */
    const updateListItem = useCallback(
        (blockIndex: number, itemIndex: number, value: string) => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            const oldData = blocks[blockIndex].data as string[];
            const newData = [...oldData];
            newData[itemIndex] = value;
            blocks[blockIndex] = { ...blocks[blockIndex], data: newData };
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Add item to a list-type block */
    const addListItem = useCallback(
        (blockIndex: number) => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            const oldData = blocks[blockIndex].data as string[];
            blocks[blockIndex] = { ...blocks[blockIndex], data: [...oldData, ""] };
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Remove item from a list-type block */
    const removeListItem = useCallback(
        (blockIndex: number, itemIndex: number) => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            const oldData = blocks[blockIndex].data as string[];
            blocks[blockIndex] = {
                ...blocks[blockIndex],
                data: oldData.filter((_, i) => i !== itemIndex),
            };
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Update a single cell in a table-type block */
    const updateTableCell = useCallback(
        (blockIndex: number, rowIndex: number, colIndex: number, value: string) => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            const table = blocks[blockIndex].data as SowTableData;
            const newRows = table.rows.map((row, ri) =>
                ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : [...row],
            );
            blocks[blockIndex] = {
                ...blocks[blockIndex],
                data: { ...table, rows: newRows },
            };
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Add a new row to a table-type block */
    const addTableRow = useCallback(
        (blockIndex: number) => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            const table = blocks[blockIndex].data as SowTableData;
            const emptyRow = table.headers.map(() => "");
            blocks[blockIndex] = {
                ...blocks[blockIndex],
                data: { ...table, rows: [...table.rows, emptyRow] },
            };
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Remove a row from a table-type block */
    const removeTableRow = useCallback(
        (blockIndex: number, rowIndex: number) => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            const table = blocks[blockIndex].data as SowTableData;
            blocks[blockIndex] = {
                ...blocks[blockIndex],
                data: { ...table, rows: table.rows.filter((_, i) => i !== rowIndex) },
            };
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Add a new block */
    const addBlock = useCallback(
        (block: SowBlock) => {
            if (!sow) return;
            _dispatchLocal({ ...sow, sow_blocks: [...sow.sow_blocks, block] });
        },
        [sow, _dispatchLocal],
    );

    /** Remove a block by index */
    const removeBlock = useCallback(
        (blockIndex: number) => {
            if (!sow) return;
            const blocks = sow.sow_blocks.filter((_, i) => i !== blockIndex);
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Move a block up or down */
    const moveBlock = useCallback(
        (blockIndex: number, direction: "up" | "down") => {
            if (!sow) return;
            const blocks = [...sow.sow_blocks];
            const targetIndex = direction === "up" ? blockIndex - 1 : blockIndex + 1;
            if (targetIndex < 0 || targetIndex >= blocks.length) return;
            [blocks[blockIndex], blocks[targetIndex]] = [blocks[targetIndex], blocks[blockIndex]];
            _dispatchLocal({ ...sow, sow_blocks: blocks });
        },
        [sow, _dispatchLocal],
    );

    /** Persist current SOW to the API */
    const save = useCallback(async () => {
        if (!project || !sow) return;
        await dispatch(updateProjectSow({ id: project.id, sow_structured: sow }));
    }, [dispatch, project, sow]);

    return {
        sow,
        project,
        loading,
        saving,
        // Project info
        updateProjectInfo,
        // Block-level
        updateBlockTitle,
        addBlock,
        removeBlock,
        moveBlock,
        // Block data by type
        updateBlockText,
        updateListItem,
        addListItem,
        removeListItem,
        updateTableCell,
        addTableRow,
        removeTableRow,
        // Persistence
        save,
    };
}
