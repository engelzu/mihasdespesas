---
name: Nu-Finance Ethos
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4f4253'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#817284'
  outline-variant: '#d3c1d5'
  surface-tint: '#941cc7'
  primary: '#670090'
  on-primary: '#ffffff'
  primary-container: '#8a05be'
  on-primary-container: '#edb9ff'
  inverse-primary: '#eab2ff'
  secondary: '#006e2c'
  on-secondary: '#ffffff'
  secondary-container: '#66fc88'
  on-secondary-container: '#00722f'
  tertiary: '#003e7e'
  on-tertiary: '#ffffff'
  tertiary-container: '#0055a8'
  on-tertiary-container: '#b2cdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f7d8ff'
  primary-fixed-dim: '#eab2ff'
  on-primary-fixed: '#320047'
  on-primary-fixed-variant: '#7400a0'
  secondary-fixed: '#69ff8b'
  secondary-fixed-dim: '#48e171'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#d6e3ff'
  tertiary-fixed-dim: '#a9c7ff'
  on-tertiary-fixed: '#001b3d'
  on-tertiary-fixed-variant: '#00468c'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
O design foca na simplicidade radical e na transparência financeira. A personalidade é amigável, mas extremamente profissional, removendo qualquer fricção visual para que o usuário foque no que importa: seu dinheiro. 

A estética adota um **Minimalismo Moderno** com toques de **Glassmorphism** sutil em elementos de destaque. O objetivo é evocar uma sensação de leveza e controle, utilizando espaços em branco generosos e uma hierarquia visual clara que prioriza a legibilidade de dados numéricos. O design é otimizado para uma experiência mobile-first, garantindo que as interações sejam rápidas e intuitivas.

## Colors
A paleta é ancorada no roxo vibrante, utilizado exclusivamente para ações primárias e identificação de marca. 

- **Primária (#8A05BE):** Usada para botões principais, estados ativos e elementos de destaque da marca.
- **Background (#F5F5F5):** Um cinza quase branco que reduz o cansaço visual e diferencia o plano de fundo das superfícies de conteúdo.
- **Surface (#FFFFFF):** Reservada para cards, containers de transações e modais, criando uma camada de profundidade clara.
- **Suporte:** O verde (#20C65A) representa entradas e saldos positivos, enquanto o azul (#1163BE) é utilizado para informações informativas ou investimentos.

## Typography
A tipografia utiliza uma combinação de fontes geométricas e humanistas para equilibrar modernidade e legibilidade técnica. 

**Plus Jakarta Sans** é utilizada para títulos e valores monetários de grande escala, trazendo um ar contemporâneo e amigável. **Inter** é a escolha para o corpo do texto e dados densos, devido à sua clareza excepcional em tamanhos pequenos e telas de baixa densidade. Para valores negativos ou alertas, manter o peso da fonte em 600 (Semi-bold) para garantir visibilidade imediata.

## Layout & Spacing
O sistema utiliza uma grade base de 4px para garantir alinhamento matemático rigoroso. 

- **Mobile:** Grade de 4 colunas com margens laterais de 20px e gutters de 16px.
- **Ritmo Vertical:** O espaçamento de 16px (md) é o padrão entre elementos relacionados, enquanto 24px (lg) separa seções distintas de conteúdo.
- **Cards:** Devem ocupar a largura total da margem interna, com preenchimento interno (padding) variando entre 16px e 24px dependendo da densidade da informação.

## Elevation & Depth
A profundidade é comunicada através de sombras ambientais e camadas tonais. Evitamos sombras pesadas ou pretas.

- **Nível 1 (Cards):** Sombra suave com 10% de opacidade, cor baseada em um tom de cinza azulado profundo. Blur de 12px com offset Y de 4px.
- **Nível 2 (Modais/Menus):** Sombra mais dispersa, 15% de opacidade, blur de 24px com offset Y de 8px.
- **Contornos:** Cards no estado de repouso utilizam uma borda fina de 1px com a cor neutral (#E0E0E0) para definição extra sem sacrificar o minimalismo.

## Shapes
As formas são arredondadas para transmitir acessibilidade e conforto. 

- **Cards e Containers:** Utilizam o raio padrão `rounded-lg` (16px).
- **Botões:** Devem seguir o estilo Pill-shaped (totalmente arredondados nas laterais) para botões de ação principal, enquanto botões secundários utilizam o raio de 8px.
- **Inputs:** Seguem o padrão de 8px para manter a seriedade funcional.

## Components
- **Buttons:** O botão primário é roxo com texto branco, sempre com cantos arredondados (8px ou Pill). O estado 'pressed' escurece a cor em 10%.
- **Cards de Gasto:** Superfície branca, sombra nível 1. Devem conter um ícone à esquerda dentro de um círculo cinza claro e o valor à direita em negrito.
- **Input Fields:** Sem bordas laterais ou superiores quando em foco; preferencialmente o estilo "Material" com uma linha inferior de 2px ou container com borda sutil de 1px.
- **Chips:** Utilizados para categorias (ex: Lazer, Alimentação). Devem ser pequenos, com fundo cinza muito claro e texto cinza escuro.
- **Progress Bars:** Usadas para orçamentos. Fundo cinza claro com a barra de progresso em roxo ou verde.
- **Bottom Navigation:** Fundo branco puro, sem sombra superior, apenas uma linha de divisão sutil de 1px. Ícones ativos em roxo, inativos em cinza médio.