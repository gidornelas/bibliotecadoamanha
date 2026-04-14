import { AntdShowcase } from './AntdShowcase';

export default {
  title: 'Ant Design/Showcase',
  component: AntdShowcase,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Ant Design pronto para uso',
    metricValue: 94.8,
    status: 'online',
    ctaLabel: 'Testar interface',
  },
  argTypes: {
    status: {
      control: 'radio',
      options: ['online', 'standby'],
    },
  },
};

export const Default = {};

export const Standby = {
  args: {
    status: 'standby',
    metricValue: 76.2,
    ctaLabel: 'Entrar na fila',
  },
};