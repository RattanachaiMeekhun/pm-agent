"use client";

import { use, useEffect, useState } from "react";
import {
    App,
    Button,
    Typography,
    Space,
    Skeleton,
    FloatButton,
    Result,
    Affix,
    Tag,
    theme,
} from "antd";
import {
    ArrowLeftOutlined,
    SaveOutlined,
    CloudSyncOutlined,
    FileTextOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useTheme } from "@/providers/ThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import { getProjectById } from "../../slice/project.thunks";
import { useProjectSow } from "./useProjectSow";
import SowHeader from "../../components/SowHeader";
import SowBlockCard from "../../components/SowBlockCard";
import AddBlockModal from "../../components/AddBlockModal";

const { Title, Text } = Typography;

export default function ProjectViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isDarkMode } = useTheme();
    const { token } = theme.useToken();
    const { message } = App.useApp();

    const {
        sow,
        project,
        loading,
        saving,
        updateProjectInfo,
        updateBlockTitle,
        updateBlockText,
        updateListItem,
        addListItem,
        removeListItem,
        updateTableCell,
        addTableRow,
        removeTableRow,
        addBlock,
        removeBlock,
        moveBlock,
        save,
    } = useProjectSow();

    const [hasChanges, setHasChanges] = useState(false);
    const [initialHash, setInitialHash] = useState<string>("");

    // Fetch project on mount
    useEffect(() => {
        dispatch(getProjectById(Number(id)));
    }, [dispatch, id]);

    // Track initial SOW hash to detect changes
    useEffect(() => {
        if (sow && !initialHash) {
            setInitialHash(JSON.stringify(sow));
        }
    }, [sow, initialHash]);

    // Detect changes
    useEffect(() => {
        if (sow && initialHash) {
            setHasChanges(JSON.stringify(sow) !== initialHash);
        }
    }, [sow, initialHash]);

    const handleSave = async () => {
        try {
            await save();
            setInitialHash(JSON.stringify(sow));
            setHasChanges(false);
            message.success("SOW saved successfully!");
        } catch {
            message.error("Failed to save SOW. Please try again.");
        }
    };

    // --- Loading State ---
    if (loading || !project) {
        return (
            <MainLayout>
                <div
                    style={{
                        maxWidth: 900,
                        margin: "0 auto",
                        padding: "48px 24px",
                    }}
                >
                    <Skeleton active paragraph={{ rows: 2 }} />
                    <div style={{ marginTop: 32 }}>
                        <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                    <div style={{ marginTop: 24 }}>
                        <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                    <div style={{ marginTop: 24 }}>
                        <Skeleton active paragraph={{ rows: 5 }} />
                    </div>
                </div>
            </MainLayout>
        );
    }

    // --- No SOW State ---
    if (!sow) {
        return (
            <MainLayout>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        padding: 48,
                    }}
                >
                    <Result
                        icon={
                            <FileTextOutlined
                                style={{ color: token.colorPrimary, fontSize: 64 }}
                            />
                        }
                        title="No SOW Data Available"
                        subTitle="This project doesn't have a Scope of Work yet. Go back to the consultation to generate one."
                        extra={[
                            <Button
                                key="back"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => router.push("/dashboard")}
                            >
                                Back to Dashboard
                            </Button>,
                        ]}
                    />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: isDarkMode ? "#131314" : "#fff",
                    borderRadius: 24,
                    overflow: "hidden",
                }}
            >
                {/* --- Top Bar --- */}
                <Affix offsetTop={0}>
                    <div
                        id="sow-topbar"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 24px",
                            background: isDarkMode
                                ? "rgba(30,30,30,0.95)"
                                : "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(12px)",
                            borderBottom: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
                            zIndex: 10,
                        }}
                    >
                        <Space>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                type="text"
                                onClick={() => router.push("/dashboard")}
                            >
                                Back
                            </Button>
                            <div
                                style={{
                                    width: 1,
                                    height: 24,
                                    background: isDarkMode ? "#444" : "#ddd",
                                }}
                            />
                            <Title
                                level={5}
                                style={{
                                    margin: 0,
                                    fontWeight: 600,
                                }}
                            >
                                Scope of Work
                            </Title>
                            {hasChanges && (
                                <Tag
                                    color="warning"
                                    style={{
                                        borderRadius: 20,
                                        fontSize: 11,
                                    }}
                                >
                                    Unsaved Changes
                                </Tag>
                            )}
                            {saving && (
                                <Tag
                                    icon={<CloudSyncOutlined spin />}
                                    color="processing"
                                    style={{ borderRadius: 20, fontSize: 11 }}
                                >
                                    Saving...
                                </Tag>
                            )}
                        </Space>

                        <Space>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => {
                                    // Future: Export to PDF/Docx
                                    message.info("Export feature coming soon!");
                                }}
                            >
                                Export
                            </Button>
                            <Button
                                id="save-sow-btn"
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={saving}
                                disabled={!hasChanges}
                                onClick={handleSave}
                                style={{
                                    borderRadius: 8,
                                    fontWeight: 500,
                                    boxShadow: hasChanges
                                        ? "0 2px 8px rgba(25, 110, 230, 0.3)"
                                        : "none",
                                }}
                            >
                                Save
                            </Button>
                        </Space>
                    </div>
                </Affix>

                {/* --- Scrollable Document Area --- */}
                <div
                    id="sow-document-area"
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "32px 24px 100px",
                    }}
                >
                    <div
                        style={{
                            maxWidth: 860,
                            margin: "0 auto",
                            background: isDarkMode ? "#1e1e1e" : "#fff",
                            borderRadius: 16,
                            boxShadow: isDarkMode
                                ? "0 4px 24px rgba(0,0,0,0.4)"
                                : "0 4px 24px rgba(0,0,0,0.06)",
                            padding: "0 0 40px",
                            overflow: "hidden",
                        }}
                    >
                        {/* SOW Header */}
                        <SowHeader
                            projectInfo={sow.project_info}
                            onUpdateField={updateProjectInfo}
                        />

                        {/* SOW Blocks */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 20,
                                padding: "24px 32px",
                            }}
                        >
                            {sow.sow_blocks.map((block, index) => (
                                <SowBlockCard
                                    key={`${block.section}-${index}`}
                                    block={block}
                                    blockIndex={index}
                                    isFirst={index === 0}
                                    isLast={index === sow.sow_blocks.length - 1}
                                    onUpdateTitle={(title) =>
                                        updateBlockTitle(index, title)
                                    }
                                    onUpdateText={(text) =>
                                        updateBlockText(index, text)
                                    }
                                    onUpdateListItem={(itemIndex, value) =>
                                        updateListItem(index, itemIndex, value)
                                    }
                                    onAddListItem={() => addListItem(index)}
                                    onRemoveListItem={(itemIndex) =>
                                        removeListItem(index, itemIndex)
                                    }
                                    onUpdateTableCell={(rowIdx, colIdx, val) =>
                                        updateTableCell(index, rowIdx, colIdx, val)
                                    }
                                    onAddTableRow={() => addTableRow(index)}
                                    onRemoveTableRow={(rowIdx) =>
                                        removeTableRow(index, rowIdx)
                                    }
                                    onRemoveBlock={() => removeBlock(index)}
                                    onMoveBlock={(dir) => moveBlock(index, dir)}
                                />
                            ))}

                            {/* Add Block Button */}
                            <AddBlockModal onAdd={addBlock} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Save Button for mobile / quick access */}
            {hasChanges && (
                <FloatButton
                    icon={<SaveOutlined />}
                    type="primary"
                    onClick={handleSave}
                    tooltip="Save changes"
                    style={{
                        right: 32,
                        bottom: 32,
                        width: 56,
                        height: 56,
                    }}
                />
            )}
        </MainLayout>
    );
}