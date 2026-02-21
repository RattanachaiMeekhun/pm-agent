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
import { useAppDispatch } from "@/store/hooks";
import { getProjectById } from "../../slice/project.thunks";
import { useProjectSow } from "./useProjectSow";
import SowHeader from "../../components/SowHeader";
import SowBlockCard from "../../components/SowBlockCard";
import AddBlockModal from "../../components/AddBlockModal";
import styles from "./viewproject.module.css";

const { Title } = Typography;

export default function ProjectViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const dispatch = useAppDispatch();
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

    useEffect(() => {
        dispatch(getProjectById(Number(id)));
    }, [dispatch, id]);

    useEffect(() => {
        if (sow && !initialHash) {
            setInitialHash(JSON.stringify(sow));
        }
    }, [sow, initialHash]);

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

    if (loading || !project) {
        return (
            <MainLayout>
                <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
                    <Skeleton active paragraph={{ rows: 2 }} />
                    <div style={{ marginTop: 32 }}>
                        <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!sow) {
        return (
            <MainLayout>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 48 }}>
                    <Result
                        icon={<FileTextOutlined style={{ color: '#6366f1', fontSize: 64 }} />}
                        title="No SOW Data Available"
                        subTitle="This project doesn't have a Scope of Work yet. Go back to the consultation to generate one."
                        extra={[
                            <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.push("/dashboard")}>
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
            <div className={styles.viewLayout}>
                <Affix offsetTop={0}>
                    <div className={styles.topbar}>
                        <div className={styles.titleGroup}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                type="text"
                                onClick={() => router.push("/dashboard")}
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Back
                            </Button>
                            <div className={styles.titleDivider} />
                            <h2 className={styles.viewTitle}>Scope of Work</h2>
                            {hasChanges && (
                                <Tag color="warning" style={{ borderRadius: 20, fontSize: 11, border: 'none' }}>
                                    Unsaved Changes
                                </Tag>
                            )}
                            {saving && (
                                <Tag icon={<CloudSyncOutlined spin />} color="processing" style={{ borderRadius: 20, fontSize: 11, border: 'none' }}>
                                    Saving...
                                </Tag>
                            )}
                        </div>

                        <Space size={16}>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => message.info("Export feature coming soon!")}
                                style={{ borderRadius: 8 }}
                            >
                                Export
                            </Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={saving}
                                disabled={!hasChanges}
                                onClick={handleSave}
                                style={{
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    background: hasChanges ? '#111827' : undefined,
                                    color: hasChanges ? '#fff' : undefined,
                                }}
                            >
                                Save Changes
                            </Button>
                        </Space>
                    </div>
                </Affix>

                <div className={styles.documentArea}>
                    <div className={styles.documentPaper}>
                        <SowHeader
                            projectInfo={sow.project_info}
                            onUpdateField={updateProjectInfo}
                        />
                        <div className={styles.blocksContainer}>
                            {sow.sow_blocks.map((block, index) => (
                                <SowBlockCard
                                    key={`${block.section}-${index}`}
                                    block={block}
                                    blockIndex={index}
                                    isFirst={index === 0}
                                    isLast={index === sow.sow_blocks.length - 1}
                                    onUpdateTitle={(title) => updateBlockTitle(index, title)}
                                    onUpdateText={(text) => updateBlockText(index, text)}
                                    onUpdateListItem={(itemIndex, value) => updateListItem(index, itemIndex, value)}
                                    onAddListItem={() => addListItem(index)}
                                    onRemoveListItem={(itemIndex) => removeListItem(index, itemIndex)}
                                    onUpdateTableCell={(rowIdx, colIdx, val) => updateTableCell(index, rowIdx, colIdx, val)}
                                    onAddTableRow={() => addTableRow(index)}
                                    onRemoveTableRow={(rowIdx) => removeTableRow(index, rowIdx)}
                                    onRemoveBlock={() => removeBlock(index)}
                                    onMoveBlock={(dir) => moveBlock(index, dir)}
                                />
                            ))}

                            <AddBlockModal onAdd={addBlock} />
                        </div>
                    </div>
                </div>
            </div>

            {hasChanges && (
                <FloatButton
                    icon={<SaveOutlined />}
                    type="primary"
                    onClick={handleSave}
                    tooltip="Save changes"
                    style={{ right: 32, bottom: 32, width: 56, height: 56 }}
                />
            )}
        </MainLayout>
    );
}