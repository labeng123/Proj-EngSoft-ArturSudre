# Mapeamento Arquitetura Backend ↔ Frontend

## 📐 Visão Geral

O frontend foi reconstruído do zero em TypeScript para mapear perfeitamente a arquitetura hexagonal do backend.

## 🔄 Mapeamento de Entidades

### Backend → Frontend

#### Serviço de Gestão (Projeto)

**Backend (`servico_gestao/domain/entidades.py`)**
```python
@dataclass
class Projeto:
    nome: str
    descricao: Optional[str] = None
    id: Optional[int] = None
    data_criacao: datetime = field(default_factory=datetime.now)
    ultima_alteracao: datetime = field(default_factory=datetime.now)
```

**Frontend (`src/app/types/index.ts`)**
```typescript
interface Projeto {
  id?: number;
  nome: string;
  descricao?: string;
  data_criacao?: string;
  ultima_alteracao?: string;
}
```

#### Serviço de Ingestão (Arquivo)

**Backend (`servico_ingestao/domain/entidades.py`)**
```python
@dataclass
class Arquivo:
    nome_original: str
    projeto_id: int
    conteudo_binario: bytes
    tipo: Optional[str] = None
    tamanho_bytes: int = 0
    id: Optional[int] = None
    data_ingestao: datetime = field(default_factory=datetime.now)
```

**Frontend (`src/app/types/index.ts`)**
```typescript
interface Arquivo {
  id?: number;
  nome_original: string;
  projeto_id: number;
  tipo?: string;
  tamanho_bytes: number;
  data_ingestao?: string;
}
```

## 🔌 Mapeamento de APIs

### Serviço de Gestão (Port 8001)

| Backend Endpoint | Frontend Service | Método | Descrição |
|-----------------|------------------|--------|-----------|
| `GET /api/projetos/` | `gestaoApi.getProjetos()` | Lista | Buscar todos projetos |
| `GET /api/projetos/{id}` | `gestaoApi.getProjetoById(id)` | Buscar | Buscar projeto específico |
| `POST /api/projetos/` | `gestaoApi.createProjeto(data)` | Criar | Criar novo projeto |
| `PUT /api/projetos/{id}` | `gestaoApi.updateProjeto(id, data)` | Atualizar | Atualizar projeto |
| `DELETE /api/projetos/{id}` | `gestaoApi.deleteProjeto(id)` | Excluir | Excluir projeto |

### Serviço de Ingestão (Port 8002)

| Backend Endpoint | Frontend Service | Método | Descrição |
|-----------------|------------------|--------|-----------|
| `POST /api/arquivos/` | `ingestaoApi.uploadArquivo(projetoId, file)` | Upload | Enviar arquivo |
| `GET /api/arquivos/projeto/{id}` | `ingestaoApi.getArquivosPorProjeto(id)` | Lista | Buscar arquivos do projeto |
| `GET /api/arquivos/download/{pid}/{aid}` | `ingestaoApi.downloadArquivo(pid, aid, name)` | Download | Baixar arquivo |

## 🎯 Camadas da Aplicação

### Backend (Hexagonal Architecture)

```
servico_gestao/
├── domain/
│   └── entidades.py          # Projeto
├── ports/
│   └── repositories.py       # ProjetoRepository (interface)
├── adapters/
│   └── sqlite_repository.py  # SQLiteProjetoRepository
├── use_cases/
│   └── gerenciar_projetos.py # GerenciarProjetosUseCase
└── main.py                   # FastAPI routes
```

### Frontend (Service-Based Architecture)

```
src/app/
├── types/
│   └── index.ts              # TypeScript interfaces
├── services/
│   ├── gestaoApi.ts          # API client para gestão
│   └── ingestaoApi.ts        # API client para ingestão
├── utils/
│   └── format.ts             # Formatação de dados
├── pages/
│   ├── Projects.tsx          # CRUD de projetos
│   └── Dashboard.tsx         # Gestão de arquivos
└── App.tsx                   # Routing
```

## 🔐 Validações Espelhadas

### Backend Validations → Frontend UX

**Projeto**
- Backend: `nome` mínimo 3 caracteres → Frontend: campo obrigatório
- Backend: `descricao` máximo 1000 caracteres → Frontend: textarea
- Backend: validação na entidade → Frontend: feedback imediato

**Arquivo**
- Backend: tipos permitidos (PDF, TXT, DOCX, CSV) → Frontend: accept attribute
- Backend: validação de tamanho → Frontend: feedback visual
- Backend: validação de nome → Frontend: exibição original

## 📊 Fluxo de Dados

### Criar Projeto
```
User Input (Projects.tsx)
    ↓
gestaoApi.createProjeto({ nome, descricao })
    ↓
POST http://localhost:8001/api/projetos/
    ↓
GerenciarProjetosUseCase.criar_projeto()
    ↓
SQLiteProjetoRepository.save()
    ↓
Response → Frontend update → Toast notification
```

### Upload de Arquivo
```
User Drag & Drop (Dashboard.tsx)
    ↓
ingestaoApi.uploadArquivo(projetoId, file)
    ↓
FormData → POST http://localhost:8002/api/arquivos/
    ↓
UploadArquivoUseCase.execute()
    ↓
LocalStorageAdapter + SQLiteArquivoRepository
    ↓
Response → Refresh file list → Toast notification
```

## 🛠️ Tecnologias por Camada

### Backend
- **Framework**: FastAPI
- **Arquitetura**: Hexagonal (Ports & Adapters)
- **ORM**: SQLite direto
- **Validação**: Pydantic + Domain validation
- **Storage**: Local filesystem + SQLite

### Frontend
- **Framework**: React 18.3
- **Language**: TypeScript
- **Routing**: React Router 7
- **HTTP**: Axios
- **State**: React Hooks
- **Styling**: Tailwind CSS 4
- **Notifications**: Sonner

## 🔄 Modo Mock (Fallback)

Ambos os serviços API incluem fallback para mock data:

```typescript
// gestaoApi.ts
try {
  const response = await api.get('/api/projetos/');
  return response.data;
} catch (error) {
  console.error('Error fetching projects:', error);
  return this.getMockProjetos(); // ← Fallback para localStorage
}
```

Isso permite:
- ✅ Desenvolvimento sem backend
- ✅ Preview/demo sem dependências
- ✅ Testes de UI isolados

## 📈 Evolução da Arquitetura

### Antes (Old Frontend)
- ❌ Mistura de .jsx e .tsx
- ❌ URLs hardcoded
- ❌ Tipos fracos
- ❌ Componentes Material UI sem padrão

### Depois (Novo Frontend)
- ✅ 100% TypeScript
- ✅ Configuração via env vars
- ✅ Types matching backend
- ✅ UI moderna e consistente
- ✅ Error handling robusto
- ✅ Arquitetura escalável

## 🎨 Design Decisions

1. **TypeScript em tudo**: Type safety end-to-end
2. **Service Layer**: APIs encapsuladas, fácil mock
3. **Utility Functions**: Formatação centralizada
4. **Tailwind CSS**: Styling consistente, sem CSS custom
5. **React Router**: Navegação declarativa
6. **Axios**: HTTP client com interceptors prontos

## 🚀 Deploy Considerations

### Environment Variables
```bash
# Development
VITE_GESTAO_API_URL=http://localhost:8001
VITE_INGESTAO_API_URL=http://localhost:8002

# Production
VITE_GESTAO_API_URL=https://api.example.com/gestao
VITE_INGESTAO_API_URL=https://api.example.com/ingestao
```

### CORS Configuration
Backend já configurado:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configurar para domínio específico em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## ✅ Compliance Matrix

| Backend Feature | Frontend Implementation | Status |
|----------------|------------------------|--------|
| Criar Projeto | ✅ Modal + Form | ✅ |
| Editar Projeto | ✅ Modal + Form | ✅ |
| Excluir Projeto | ✅ Confirmation dialog | ✅ |
| Listar Projetos | ✅ Grid responsivo | ✅ |
| Upload Arquivo | ✅ Drag & drop + select | ✅ |
| Listar Arquivos | ✅ Table com filtros | ✅ |
| Download Arquivo | ✅ Browser download | ✅ |
| Validação de tipos | ✅ File type filter | ✅ |
| Mock mode | ✅ localStorage fallback | ✅ |

---

**Frontend completamente alinhado com a arquitetura hexagonal do backend!**
