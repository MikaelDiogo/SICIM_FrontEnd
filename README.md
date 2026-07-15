# SICIM App — Sistema de Controle de Imóveis Municipais de Crateús

SPA (Single Page Application) do SICIM, sistema institucional desenvolvido para a Prefeitura Municipal de Crateús/CE, que centraliza o cadastro, a geolocalização e o controle contábil-patrimonial dos imóveis sob gestão do município.

Este repositório contém apenas o frontend. A API consumida por esta aplicação está no repositório [SICIM_BackEnd](https://github.com/MikaelDiogo/SICIM_BackEnd).

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Telas do sistema](#2-telas-do-sistema)
3. [Arquitetura](#3-arquitetura)
4. [Tecnologias utilizadas](#4-tecnologias-utilizadas)
5. [Como rodar o projeto](#5-como-rodar-o-projeto)
6. [Variáveis de ambiente](#6-variáveis-de-ambiente)

---

## 1. Visão geral

Esta aplicação é a interface utilizada pelos servidores da prefeitura para cadastrar, consultar, aprovar e gerar relatórios sobre os imóveis municipais. É uma SPA autenticada, consumida apenas internamente (sem necessidade de SEO ou renderização no servidor).

Perfis de acesso (RBAC) refletidos na interface:

| Perfil | Permissões |
|---|---|
| Cadastro | Criar e editar imóveis (ficam pendentes de aprovação); não aprova nem exclui |
| Consulta | Somente leitura — dashboard, mapa e relatórios |
| Aprovação | Tudo o que Cadastro faz, mais aprovar/reprovar imóveis pendentes |
| Administração | Acesso total, incluindo gestão de usuários e unidades gestoras |

---

## 2. Telas do sistema

| Tela | Função |
|---|---|
| Painel Geral (Dashboard) | Indicadores (KPIs), mapa-resumo, tabela filtrável de imóveis e ficha lateral de detalhe |
| Cadastro de Imóvel | Formulário de cadastro/edição em duas colunas, com mini-mapa para captura de coordenada e cálculo automático do valor líquido; seção condicional para imóveis não-próprios |
| Mapa Territorial | Visualização geográfica ampliada dos imóveis, com tooltips por pin e filtros multi-dimensionais |
| Relatórios | Filtros por período/unidade/status, gráficos de distribuição e exportação em PDF/Excel/impressão |
| Login | Autenticação do usuário via credenciais institucionais |

---

## 3. Arquitetura

O frontend segue uma organização por fatias de funcionalidade (feature-based, inspirada em Feature-Sliced Design):

| Camada | Pasta | Responsabilidade |
|---|---|---|
| App | `src/app/` | Bootstrap da aplicação: rotas, providers, cliente do TanStack Query, tema, rota protegida |
| Pages | `src/pages/` | Páginas roteáveis (Dashboard, Mapa, Cadastro de Imóvel, Relatórios, Login) |
| Features | `src/features/` | Funcionalidades autocontidas por caso de uso (formulário de imóvel, mapa, filtros de relatório, autenticação) |
| Entities | `src/entities/` | Modelos de domínio do frontend, chamadas de API e hooks de dados por entidade (`property`, `managing-unit`, `auth`) |
| Shared | `src/shared/` | Componentes de UI, cliente HTTP, utilitários (formatação, exportação, mapas) reutilizados entre features |

A regra geral é que camadas mais internas (`shared`, `entities`) não conhecem camadas mais externas (`features`, `pages`, `app`); a dependência flui sempre de fora para dentro.

---

## 4. Tecnologias utilizadas

| Camada | Tecnologia | Motivo da escolha |
|---|---|---|
| Build/Dev server | Vite + TypeScript | SPA interno autenticado; sem necessidade de SSR/SEO |
| Biblioteca de UI | React 19 | Componentização e ecossistema maduro |
| Kit de componentes | Mantine | Componentes acessíveis (WCAG 2.1 AA), tema customizável com a paleta institucional |
| Ícones | Tabler Icons | Conjunto de ícones consistente com o Mantine |
| Estado de servidor | TanStack Query | Cache e revalidação de dados vindos da API |
| Formulários | React Hook Form + Zod | Validação no cliente espelhando as regras do backend |
| Roteamento | React Router | Navegação entre páginas da SPA |
| Cliente HTTP | Axios | Consumo da API REST |
| Mapas | MapLibre GL JS | Renderização vetorial WebGL, estilo 2D flat, sem prédios 3D |
| Exportação de relatórios | jsPDF + jspdf-autotable | Geração de relatórios em PDF no navegador |
| Datas | Day.js | Manipulação de datas leve |
| Lint | oxlint | Linter rápido baseado em Oxc |

---

## 5. Como rodar o projeto

### 5.1 Pré-requisitos

| Ferramenta | Uso |
|---|---|
| Node.js 20+ | Executar a aplicação |
| npm | Gerenciador de pacotes |
| API do SICIM em execução | Ver o repositório [SICIM_BackEnd](https://github.com/MikaelDiogo/SICIM_BackEnd) para subir a API e o banco de dados via Docker |

### 5.2 Passo a passo

```bash
# instalar dependências
npm install

# subir o servidor de desenvolvimento
npm run dev
```

A aplicação sobe por padrão em `http://localhost:5173` e consome a API através da variável `VITE_API_BASE_URL` (ver seção 6).

### 5.3 Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento do Vite |
| `npm run build` | Gera o build de produção (`tsc -b && vite build`) |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Executa o oxlint |

---

## 6. Variáveis de ambiente

Arquivo `.env.development` na raiz do projeto:

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base da API do SICIM consumida pela SPA | `http://localhost:3000` |

Em produção, esta variável deve apontar para a URL pública da API implantada.
