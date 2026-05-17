# Sistema de Ingestão de Arquivos - Frontend

Frontend moderno em React + TypeScript para o sistema de ingestão de arquivos, integrado com os microserviços backend de gestão de projetos e ingestão de arquivos.

## 🏗️ Arquitetura

Este frontend conecta-se a dois microserviços backend:

- **Serviço de Gestão (porta 8001)**: Gerenciamento de projetos (CRUD)
- **Serviço de Ingestão (porta 8002)**: Upload, listagem e download de arquivos

### Estrutura do Projeto

```
src/app/
├── types/          # TypeScript interfaces matching backend entities
│   └── index.ts
├── services/       # API service layers
│   ├── gestaoApi.ts    # Project management API
│   └── ingestaoApi.ts  # File ingestion API
├── pages/          # Main application pages
│   ├── Projects.tsx    # Project list and CRUD
│   └── Dashboard.tsx   # File management dashboard
├── utils/          # Utility functions
│   └── format.ts       # File size, date formatting
└── App.tsx         # Main app with routing
```

## 🚀 Funcionalidades

### Gestão de Projetos
- ✅ Listar todos os projetos
- ✅ Criar novo projeto
- ✅ Editar projeto existente
- ✅ Excluir projeto
- ✅ Visualizar detalhes do projeto

### Gestão de Arquivos
- ✅ Upload de arquivos (drag & drop ou seleção)
- ✅ Upload múltiplo
- ✅ Listar arquivos por projeto
- ✅ Filtrar arquivos por tipo (PDF, DOCX, CSV, TXT)
- ✅ Download de arquivos
- ✅ Visualização de metadados (tamanho, data, tipo)

## 🔌 Integração com Backend

### API de Gestão (http://localhost:8001)

```typescript
// Endpoints implementados
GET    /api/projetos/              // Listar projetos
POST   /api/projetos/              // Criar projeto
PUT    /api/projetos/{id}          // Atualizar projeto
DELETE /api/projetos/{id}          // Excluir projeto
```

### API de Ingestão (http://localhost:8002)

```typescript
// Endpoints implementados
POST   /api/arquivos/                          // Upload arquivo
GET    /api/arquivos/projeto/{projeto_id}      // Listar arquivos
GET    /api/arquivos/download/{projeto_id}/{arquivo_id}  // Download
```

## 📦 Dependências Principais

- **React 18.3.1** - Framework UI
- **TypeScript** - Type safety
- **React Router 7** - Navegação
- **Axios** - HTTP client
- **Tailwind CSS 4** - Styling
- **Lucide React** - Ícones
- **Sonner** - Toast notifications

## 🎨 Design System

O projeto utiliza Tailwind CSS v4 com um design system moderno:

- **Cores**: Gradientes azul/cinza
- **Componentes**: Cards, modals, tables responsivas
- **Animações**: Hover effects, loading states
- **Responsividade**: Mobile-first grid system

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
VITE_GESTAO_API_URL=http://localhost:8001
VITE_INGESTAO_API_URL=http://localhost:8002
```

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar em modo desenvolvimento
# (O servidor já está rodando no Figma Make)
```

## 🔄 Fallback Mode

Os serviços API incluem modo de fallback com mock data quando o backend não está disponível:

- Dados são armazenados em `localStorage`
- Permite desenvolvimento e preview sem backend
- Útil para demonstrações e testes de UI

## 📱 Fluxo de Uso

1. **Página Inicial**: Lista de projetos
   - Criar novo projeto
   - Editar/excluir projetos existentes
   - Clicar em projeto para ver arquivos

2. **Dashboard do Projeto**: Gestão de arquivos
   - Upload de arquivos via drag & drop
   - Filtrar por tipo de arquivo
   - Download de arquivos
   - Voltar para lista de projetos

## 🎯 TypeScript Types

As interfaces TypeScript mapeiam exatamente as entidades do backend:

```typescript
interface Projeto {
  id?: number;
  nome: string;
  descricao?: string;
  data_criacao?: string;
  ultima_alteracao?: string;
}

interface Arquivo {
  id?: number;
  nome_original: string;
  projeto_id: number;
  tipo?: string;
  tamanho_bytes: number;
  data_ingestao?: string;
}
```

## 🐛 Error Handling

- Toast notifications para sucesso/erro
- Loading states em todas operações async
- Fallback para mock data quando API falha
- Validação de formulários
- Navegação segura (redirect se projeto não existe)

## 🔐 Validações

### Frontend
- Nome do projeto obrigatório (mínimo 3 caracteres no backend)
- Descrição opcional (máximo 1000 caracteres no backend)
- Tipos de arquivo aceitos: PDF, TXT, DOCX, CSV

### Backend
As validações do backend são refletidas no frontend para melhor UX.

## 📊 Features Avançadas

- **Ordenação**: Arquivos ordenados por data (mais recente primeiro)
- **Formatação**: Tamanhos de arquivo humanizados (KB, MB, GB)
- **Datas Relativas**: "Hoje", "Ontem", "X dias atrás"
- **Ícones por Tipo**: Emojis representando cada tipo de arquivo
- **Drag & Drop**: Upload intuitivo de arquivos
- **Multi-upload**: Envio de múltiplos arquivos simultaneamente

## 🚦 Status da Aplicação

✅ **Completo e Funcional**

- Todos os endpoints do backend implementados
- UI responsiva e moderna
- TypeScript em todo o código
- Error handling robusto
- Mock mode para desenvolvimento

---

**Desenvolvido com React + TypeScript + Tailwind CSS**
**Integrado com Backend FastAPI (Hexagonal Architecture)**
