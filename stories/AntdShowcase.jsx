import React from 'react';
import { ArrowUpRight, Sparkles } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Flex, Input, Space, Statistic, Tag, Typography } from 'antd';

const { Paragraph, Title, Text } = Typography;

export const AntdShowcase = ({ title, metricValue, status, ctaLabel }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#111827',
          colorInfo: '#111827',
          colorSuccess: '#16a34a',
          borderRadius: 18,
          fontFamily: 'Bricolage Grotesque, Segoe UI, sans-serif',
        },
      }}
    >
      <div
        style={{
          minHeight: '100vh',
          padding: '32px',
          background:
            'radial-gradient(circle at top left, rgba(54,240,212,0.16), transparent 30%), linear-gradient(145deg, #f5f7fb, #eef2ff 55%, #f8fafc)',
        }}
      >
        <Card
          style={{
            maxWidth: 760,
            margin: '0 auto',
            borderRadius: 28,
            boxShadow: '0 28px 70px rgba(15, 23, 42, 0.12)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
          }}
        >
          <Flex vertical gap={24}>
            <Space size={10} wrap>
              <Tag color="cyan">Ant Design</Tag>
              <Tag color="geekblue">Storybook</Tag>
              <Tag color="green">Instalação validada</Tag>
            </Space>

            <div>
              <Title level={2} style={{ margin: 0 }}>
                {title}
              </Title>
              <Paragraph style={{ margin: '10px 0 0', maxWidth: 560 }}>
                Este card comprova que o Ant Design está carregando no projeto, com tema customizado,
                ícones, tipografia, formulário e componentes interativos dentro do Storybook.
              </Paragraph>
            </div>

            <Flex gap={16} wrap="wrap" align="stretch">
              <Card size="small" style={{ flex: '1 1 220px' }}>
                <Statistic title="Pipeline score" value={metricValue} precision={1} suffix="%" />
              </Card>
              <Card size="small" style={{ flex: '1 1 220px' }}>
                <Text type="secondary">Status atual</Text>
                <div style={{ marginTop: 10 }}>
                  <Tag color={status === 'online' ? 'success' : 'default'}>
                    <Sparkles /> {status}
                  </Tag>
                </div>
              </Card>
            </Flex>

            <Space.Compact block size="large">
              <Input placeholder="Digite o e-mail para teste" />
              <Button type="primary" icon={<ArrowUpRight />}>
                {ctaLabel}
              </Button>
            </Space.Compact>
          </Flex>
        </Card>
      </div>
    </ConfigProvider>
  );
};