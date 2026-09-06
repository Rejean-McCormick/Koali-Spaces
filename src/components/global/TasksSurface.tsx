'use client';

import { Empty, List, Space, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocalization } from '@/providers/LocalizationProvider';

type Task = {
  taskId: string;
  title: string;
  summary?: string;
  ownerModuleId: string;
  status: 'pending' | 'attention' | 'done';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueAt?: string;
  targetHref: string;
  providerId: string;
};

export default function TasksSurface() {
  const router = useRouter();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/global/tasks', { cache: 'no-store' })
      .then((response) => response.json())
      .then((value) => { if (!cancelled) setTasks(Array.isArray(value.tasks) ? value.tasks : []); })
      .catch(() => { if (!cancelled) setTasks([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <List
      bordered
      loading={loading}
      dataSource={tasks}
      locale={{ emptyText: <Empty description={t('tasks.empty', 'Aucune tâche projetée par les propriétaires admis')} /> }}
      renderItem={(task) => (
        <List.Item onClick={() => router.push(task.targetHref)} style={{ cursor: 'pointer' }}>
          <List.Item.Meta title={task.title} description={task.summary} />
          <Space wrap>
            <Tag>{task.status}</Tag>
            <Tag>{task.priority}</Tag>
            <Typography.Text type="secondary">{task.ownerModuleId}</Typography.Text>
          </Space>
        </List.Item>
      )}
    />
  );
}
