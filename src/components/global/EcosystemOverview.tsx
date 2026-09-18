'use client';

import { useEffect, useState } from 'react';
import { Alert, Card, Descriptions, List, Space, Spin, Tag, Typography } from 'antd';
import type { PublicEcosystemStatus } from '@/lib/ecosystem-status.server';

function statusColor(state: string | undefined) {
  if (state === 'ready' || state === 'external-or-already-running') return 'success';
  if (state === 'degraded' || state === 'starting') return 'warning';
  if (state === 'failed' || state === 'missing' || state === 'unreachable') return 'error';
  return 'default';
}

export default function EcosystemOverview() {
  const [status, setStatus] = useState<PublicEcosystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/ecosystem/status', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const next = await response.json() as PublicEcosystemStatus;
        if (!cancelled) {
          setStatus(next);
          setError(null);
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Status unavailable');
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (!status && !error) return <Spin />;
  if (error) return <Alert type="error" showIcon message="État de l’écosystème indisponible" description={error} />;
  if (!status || status.state !== 'available') {
    return <Alert type="warning" showIcon message="Bootstrap écosystème inactif" description={status?.reason ?? 'Aucun état généré.'} />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="Repos liés, pas copiés"
        description="Koali compose les produits liés sans connaître leur stack interne. Chaque repo propriétaire fournit son contrat koali.integration.json; le launcher générique supervise uniquement ces contrats."
      />
      <div>
        <Typography.Title level={4}>Applications</Typography.Title>
        <List
          grid={{ gutter: 16, xs: 1, md: 2 }}
          dataSource={status.products}
          renderItem={(product) => (
            <List.Item>
              <Card
                title={product.publicName}
                extra={<Tag color={statusColor(product.runtime?.state)}>{product.runtime?.state ?? 'unknown'}</Tag>}
              >
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Repo">{product.repoFound ? 'lié' : product.externallyManaged ? 'runtime externe' : 'introuvable'}</Descriptions.Item>
                  <Descriptions.Item label="Contrat">{product.integrationReady ? `propriétaire (${product.integrationOwner ?? product.publicName})` : 'absent/invalide'}</Descriptions.Item>
                  <Descriptions.Item label="Source">{product.selectedVariant ?? '—'}</Descriptions.Item>
                  <Descriptions.Item label="Variantes">{product.availableVariants.length ? product.availableVariants.join(', ') : '—'}</Descriptions.Item>
                  <Descriptions.Item label="Runtime">{product.embedBase || '—'}</Descriptions.Item>
                  <Descriptions.Item label="Processus">{product.process ? `${product.process.state} (${product.process.processCount})` : 'non géré'}</Descriptions.Item>
                </Descriptions>
                {product.runtime?.reason ? <Typography.Text type="secondary">{product.runtime.reason}</Typography.Text> : null}
                {product.runtime?.probes?.length ? (
                  <Space wrap style={{ marginTop: 8 }}>
                    {product.runtime.probes.map((probe) => (
                      <Tag key={probe.id} color={statusColor(probe.state)}>{probe.id}: {probe.state}</Tag>
                    ))}
                  </Space>
                ) : null}
              </Card>
            </List.Item>
          )}
        />
      </div>
      <div>
        <Typography.Title level={4}>Sources et infrastructure liées</Typography.Title>
        <List
          bordered
          dataSource={status.sources}
          renderItem={(source) => (
            <List.Item extra={<Tag color={source.found ? 'success' : 'default'}>{source.found ? 'lié' : 'absent'}</Tag>}>
              <List.Item.Meta title={source.publicName} description={source.id} />
            </List.Item>
          )}
        />
      </div>
    </Space>
  );
}
