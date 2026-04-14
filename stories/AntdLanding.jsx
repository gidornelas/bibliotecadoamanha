import React from 'react';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  LineChartOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { Button, Card, Col, ConfigProvider, Divider, Flex, Input, Row, Space, Statistic, Tag, Typography } from 'antd';

const { Paragraph, Text, Title } = Typography;

const featureItems = [
  {
    icon: <RadarChartOutlined />,
    title: 'Síntese multimodal',
    description:
      'Unifica sinais de produto, mercado e operação em blocos de contexto claros para squads de decisão.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Governança adaptativa',
    description:
      'Políticas de risco, compliance e privacidade versionadas sem desacelerar experimentação.',
  },
  {
    icon: <ThunderboltFilled />,
    title: 'Memória operacional',
    description:
      'Cada decisão relevante retroalimenta a plataforma e melhora a recomendação do próximo ciclo.',
  },
  {
    icon: <LineChartOutlined />,
    title: 'Execução orientada por impacto',
    description:
      'A plataforma prioriza o que mover primeiro com base em urgência, valor financeiro e custo político.',
  },
];

const statCards = [
  { label: 'Decisões automatizadas', value: '31.482' },
  { label: 'Acurácia preditiva', value: '97,4%' },
  { label: 'Tempo de resposta', value: '220ms' },
  { label: 'Eventos mitigados', value: '8.916' },
];

const resultCards = [
  { value: '42%', label: 'redução média no tempo de decisão em operações críticas' },
  { value: '3,8x', label: 'mais hipóteses testadas por trimestre com o mesmo time' },
  { value: '91%', label: 'retenção de clientes enterprise após 12 meses' },
];

export const AntdLanding = ({
  brandName = 'Orion Neural',
  headline = 'A IA que transforma sinais dispersos em decisões com vantagem competitiva.',
  ctaPrimary = 'Solicitar demo privada',
  ctaSecondary = 'Ver arquitetura de produto',
}) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0f172a',
          colorInfo: '#0f172a',
          colorSuccess: '#22c55e',
          colorText: '#eef2ff',
          colorTextSecondary: '#bcc5dd',
          colorBgBase: '#070b14',
          borderRadius: 22,
          fontFamily: 'Bricolage Grotesque, Segoe UI, sans-serif',
        },
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap');`}</style>
      <div
        style={{
          minHeight: '100vh',
          color: '#eef2ff',
          background:
            'radial-gradient(circle at 12% 8%, rgba(34,211,238,0.18), transparent 24%), radial-gradient(circle at 88% 80%, rgba(168,85,247,0.18), transparent 26%), linear-gradient(155deg, #05070d, #0e1321 52%, #131a2f)',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
          }}
        >
          <Card
            variant="borderless"
            styles={{ body: { padding: 0 } }}
            style={{
              background: 'rgba(8, 12, 22, 0.72)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.34)',
              overflow: 'hidden',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
                <Space size={14}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#041015',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #3cf2d6, #d9ff58)',
                    }}
                  >
                    O
                  </div>
                  <Text style={{ color: '#e8ecfb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {brandName}
                  </Text>
                </Space>
                <Space size={10} wrap>
                  <Tag color="cyan">Orquestração cognitiva</Tag>
                  <Tag color="geekblue">Enterprise AI</Tag>
                  <Tag color="lime">Go-live em 28 dias</Tag>
                </Space>
              </Flex>
            </div>

            <div style={{ padding: '32px 24px 28px' }}>
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} lg={14}>
                  <Space size={12} wrap style={{ marginBottom: 18 }}>
                    <Tag color="default" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 6 }}>
                      Orion Neural para times de estratégia, dados e operação
                    </Tag>
                  </Space>
                  <Title
                    level={1}
                    style={{
                      margin: 0,
                      color: '#f8fbff',
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontSize: 'clamp(2.6rem, 6vw, 5rem)',
                      lineHeight: 1.02,
                      letterSpacing: '-0.03em',
                      maxWidth: '11ch',
                    }}
                  >
                    {headline}
                  </Title>
                  <Paragraph
                    style={{
                      margin: '18px 0 24px',
                      color: '#bcc5dd',
                      fontSize: '1.05rem',
                      maxWidth: 620,
                      lineHeight: 1.65,
                    }}
                  >
                    A plataforma conecta sinais de operação, mercado e comportamento em uma malha única
                    de contexto. Em vez de mais dashboards, sua equipe recebe respostas priorizadas para
                    agir na hora certa.
                  </Paragraph>
                  <Space size={12} wrap>
                    <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
                      {ctaPrimary}
                    </Button>
                    <Button size="large" ghost>
                      {ctaSecondary}
                    </Button>
                  </Space>
                  <Space size={[10, 10]} wrap style={{ marginTop: 22 }}>
                    <Tag color="default">+120 empresas em piloto</Tag>
                    <Tag color="default">ROI médio em 67 dias</Tag>
                    <Tag color="default">SLA de inferência de 220ms</Tag>
                  </Space>
                </Col>

                <Col xs={24} lg={10}>
                  <Card
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 26,
                      boxShadow: '0 24px 60px rgba(5, 9, 20, 0.35)',
                    }}
                  >
                    <Flex vertical gap={18} style={{ width: '100%' }}>
                      <div>
                        <Text style={{ color: '#e4ebff', fontSize: 18, fontWeight: 700 }}>Pulse Board</Text>
                        <Paragraph style={{ margin: '8px 0 0', color: '#b8c3de' }}>
                          Diagnóstico contínuo da operação com priorização de anomalias por impacto
                          financeiro e risco reputacional.
                        </Paragraph>
                      </div>
                      <Row gutter={[14, 14]}>
                        {statCards.map((item) => (
                          <Col xs={12} key={item.label}>
                            <Card
                              size="small"
                              style={{
                                height: '100%',
                                background: 'rgba(4, 8, 18, 0.45)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }}
                            >
                              <Text style={{ color: '#aeb8d5', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {item.label}
                              </Text>
                              <div style={{ marginTop: 10, fontSize: 26, fontWeight: 800, color: '#f7fbff' }}>
                                {item.value}
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Flex>
                  </Card>
                </Col>
              </Row>

              <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '30px 0' }} />

              <div style={{ marginBottom: 18 }}>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: '#f6f8ff',
                    fontFamily: 'Fraunces, Georgia, serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Uma stack de IA desenhada para escala real.
                </Title>
                <Paragraph style={{ margin: '10px 0 0', color: '#bcc5dd', maxWidth: 700 }}>
                  Linguagem executiva, clareza visual e densidade técnica suficiente para mostrar valor sem
                  cair em estética genérica de produto.
                </Paragraph>
              </div>

              <Row gutter={[16, 16]}>
                {featureItems.map((item) => (
                  <Col xs={24} md={12} key={item.title}>
                    <Card
                      style={{
                        height: '100%',
                        background: 'rgba(9, 13, 25, 0.62)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: 22,
                      }}
                    >
                      <Space direction="vertical" size={12}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 14,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 20,
                            color: '#061016',
                            background: 'linear-gradient(145deg, #36f0d4, #d9ff58)',
                          }}
                        >
                          {item.icon}
                        </div>
                        <Title level={4} style={{ margin: 0, color: '#f5f8ff' }}>
                          {item.title}
                        </Title>
                        <Paragraph style={{ margin: 0, color: '#b8c3de' }}>{item.description}</Paragraph>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '30px 0' }} />

              <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
                {resultCards.map((item) => (
                  <Col xs={24} md={8} key={item.label}>
                    <Card
                      style={{
                        height: '100%',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Statistic
                        value={item.value}
                        styles={{
                          content: {
                            color: '#f8fbff',
                            fontFamily: 'Fraunces, Georgia, serif',
                            letterSpacing: '-0.03em',
                          },
                        }}
                      />
                      <Paragraph style={{ margin: '12px 0 0', color: '#bcc5dd' }}>{item.label}</Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Card
                style={{
                  background:
                    'linear-gradient(135deg, rgba(54,240,212,0.14), rgba(217,255,88,0.08), rgba(255,111,145,0.12))',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 28,
                }}
              >
                <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} lg={15}>
                    <Flex vertical gap={10}>
                      <Title
                        level={3}
                        style={{ margin: 0, color: '#f8fbff', fontFamily: 'Fraunces, Georgia, serif' }}
                      >
                        Entre no programa de design partners da Orion Neural.
                      </Title>
                      <Paragraph style={{ margin: 0, color: '#d2daf0', maxWidth: 620 }}>
                        Receba acesso antecipado ao roadmap, suporte de implantação e arquitetura dedicada
                        para seu domínio de negócio.
                      </Paragraph>
                      <Space size={8} wrap>
                        <Text style={{ color: '#d7def4' }}>
                          <CheckCircleFilled style={{ color: '#3cf2d6', marginRight: 8 }} />
                          Arquitetura dedicada
                        </Text>
                        <Text style={{ color: '#d7def4' }}>
                          <CheckCircleFilled style={{ color: '#3cf2d6', marginRight: 8 }} />
                          Onboarding executivo
                        </Text>
                      </Space>
                    </Flex>
                  </Col>
                  <Col xs={24} lg={9}>
                    <Space.Compact block size="large">
                      <Input placeholder="Seu e-mail corporativo" />
                      <Button type="primary">Agendar conversa</Button>
                    </Space.Compact>
                  </Col>
                </Row>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
};