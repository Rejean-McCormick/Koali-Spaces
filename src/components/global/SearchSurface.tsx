'use client';

import { Empty, Input, List, Space, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLocalization } from '@/providers/LocalizationProvider';

type Result = {
  resultId: string;
  title: string;
  summary?: string;
  kind: string;
  ownerModuleId: string;
  targetHref: string;
  providerId: string;
};

export default function SearchSurface() {
  const router = useRouter();
  const { t } = useLocalization();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  async function search(value: string) {
    const next = value.trim();
    setQuery(next);
    if (!next) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/global/search?q=${encodeURIComponent(next)}`, { cache: 'no-store' });
      const data = await response.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Input.Search
        allowClear
        enterButton={t('search.submit', 'Rechercher')}
        placeholder={t('search.placeholder', 'Rechercher dans les providers admis')}
        loading={loading}
        onSearch={(value) => void search(value)}
      />
      <List
        bordered
        loading={loading}
        dataSource={results}
        locale={{
          emptyText: (
            <Empty description={query ? t('search.no_results', 'Aucun résultat fourni') : t('search.empty', 'Entrez une recherche')} />
          ),
        }}
        renderItem={(item) => (
          <List.Item onClick={() => router.push(item.targetHref)} style={{ cursor: 'pointer' }}>
            <List.Item.Meta title={item.title} description={item.summary} />
            <Space>
              <Tag>{item.kind}</Tag>
              <Typography.Text type="secondary">{item.ownerModuleId}</Typography.Text>
            </Space>
          </List.Item>
        )}
      />
    </Space>
  );
}
