import { Alert, Space } from 'antd';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import type { ReactNode } from 'react';

export default function ModulePageShell({
  title,
  description,
  state = 'ready',
  primaryAction,
  secondaryActions,
  children,
}: {
  title: string;
  description?: ReactNode;
  state?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="koali-page-shell">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="koali-page-header">
          <div className="koali-page-heading-copy">
            <Title level={2} className="koali-page-title">{title}</Title>
            {description ? <Paragraph type="secondary" className="koali-page-description">{description}</Paragraph> : null}
          </div>

          <Space wrap>
            {secondaryActions}
            {primaryAction}
          </Space>
        </div>

        {state !== 'ready' ? (
          <Alert
            type={state === 'error' ? 'error' : 'warning'}
            showIcon
            message={`Interface state: ${state}`}
          />
        ) : null}

        <div>{children}</div>
      </Space>
    </section>
  );
}
