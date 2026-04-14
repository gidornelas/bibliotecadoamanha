import { AntdLanding } from './AntdLanding';

export default {
  title: 'Ant Design/Landing',
  component: AntdLanding,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    brandName: 'Orion Neural',
    headline: 'A IA que transforma sinais dispersos em decisões com vantagem competitiva.',
    ctaPrimary: 'Solicitar demo privada',
    ctaSecondary: 'Ver arquitetura de produto',
  },
};

export const Default = {};

export const FintechVariant = {
  args: {
    brandName: 'Vectra Signal',
    headline: 'Infraestrutura cognitiva para operações financeiras que precisam decidir antes do mercado.',
    ctaPrimary: 'Agendar benchmark',
    ctaSecondary: 'Explorar stack',
  },
};