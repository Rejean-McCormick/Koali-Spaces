'use client';

import { Alert, Button, Space } from 'antd';

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section style={{ padding: 24 }}>
      <Space direction="vertical" size="middle">
        <Alert
          type="error"
          showIcon
          message="Interface error"
          description="The active presentation surface failed. Koali authority and subsystem data are not changed by this UI failure."
        />
        <Button onClick={reset}>Retry interface</Button>
      </Space>
    </section>
  );
}
