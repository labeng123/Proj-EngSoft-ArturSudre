# 📐 Diagrama de Arquitetura - Sistema Completo

## 🏗️ Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    React + TypeScript                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │   React Router   │
                    └─────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌───────────────┐                         ┌───────────────┐
│  Projects.tsx │                         │ Dashboard.tsx │
│               │                         │               │
│ - List        │                         │ - File Upload │
│ - Create      │                         │ - List Files  │
│ - Edit        │                         │ - Download    │
│ - Delete      │                         │ - Filter      │
└───────┬───────┘                         └───────┬───────┘
        ↓                                         ↓
┌───────────────┐                         ┌───────────────┐
│  gestaoApi.ts │                         │ingestaoApi.ts │
│               │                         │               │
│ TypeScript    │                         │ TypeScript    │
│ Service Layer │                         │ Service Layer │
└───────┬───────┘                         └───────┬───────┘
        ↓                                         ↓
        │                                         │
        ↓                                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                         NETWORK (HTTP)                          │
│                    Axios Client Library                         │
└─────────────────────────────────────────────────────────────────┘
        ↓                                         ↓
        │                                         │
┌───────────────────┐                   ┌───────────────────┐
│   Port: 8001      │                   │   Port: 8002      │
│ Serviço Gestão    │                   │ Serviço Ingestão  │
└───────────────────┘                   └───────────────────┘
        ↓                                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                             │
│                  FastAPI + Python                               │
│             Hexagonal Architecture                              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados - Criar Projeto

```
USER INTERFACE
      ↓
[Projects.tsx]
  - User clicks "Novo Projeto"
  - Opens modal
  - Fills form { nome, descricao }
  - Clicks "Criar"
      ↓
[handleSubmit()]
  - Validates input
  - Calls API service
      ↓
[gestaoApi.createProjeto(data)]
  - Prepares request
  - POST to backend
      ↓
═══════════════════════════════════════
NETWORK: HTTP POST
URL: http://localhost:8001/api/projetos/
Body: { "nome": "...", "descricao": "..." }
═══════════════════════════════════════
      ↓
[FastAPI Router]
  - Receives request
  - Validates with Pydantic
      ↓
[GerenciarProjetosUseCase]
  - Business logic
  - Domain validation
      ↓
[Projeto Entity]
  - Creates domain object
  - Validates rules
      ↓
[SQLiteProjetoRepository]
  - Persists to database
  - Returns saved entity
      ↓
[FastAPI Response]
  - Serializes to JSON
  - Returns ProjetoResponse
      ↓
═══════════════════════════════════════
NETWORK: HTTP 200 OK
Response: {
  "id": 1,
  "nome": "...",
  "descricao": "...",
  "data_criacao": "2024-...",
  "ultima_alteracao": "2024-..."
}
═══════════════════════════════════════
      ↓
[gestaoApi.createProjeto() - Response]
  - Parses JSON
  - Returns typed Projeto object
      ↓
[Projects.tsx - Success Handler]
  - Shows success toast
  - Closes modal
  - Reloads project list
      ↓
USER INTERFACE UPDATED
```

## 📤 Fluxo de Dados - Upload de Arquivo

```
USER INTERFACE
      ↓
[Dashboard.tsx]
  - User drags files or clicks to select
  - Files: FileList
      ↓
[handleFileUpload(files)]
  - Iterates over files
  - Calls API for each
      ↓
[ingestaoApi.uploadArquivo(projetoId, file)]
  - Creates FormData
  - Appends projeto_id
  - Appends file binary
      ↓
═══════════════════════════════════════
NETWORK: HTTP POST (multipart/form-data)
URL: http://localhost:8002/api/arquivos/
Body: FormData {
  projeto_id: 1,
  file: [Binary Data]
}
═══════════════════════════════════════
      ↓
[FastAPI Router]
  - Receives multipart data
  - Extracts fields
      ↓
[UploadArquivoUseCase]
  - Business logic
  - File validation
      ↓
[Arquivo Entity]
  - Creates domain object
  - Extracts tipo from filename
  - Calculates tamanho_bytes
  - Validates business rules
      ↓
[LocalStorageAdapter]
  - Saves file to filesystem
      ↓
[SQLiteArquivoRepository]
  - Saves metadata to database
      ↓
[FastAPI Response]
  - Returns ArquivoResponse
      ↓
═══════════════════════════════════════
NETWORK: HTTP 200 OK
Response: {
  "id": 1,
  "nome_original": "documento.pdf",
  "projeto_id": 1,
  "tipo": "pdf",
  "tamanho_bytes": 245760,
  "data_ingestao": "2024-..."
}
═══════════════════════════════════════
      ↓
[ingestaoApi.uploadArquivo() - Response]
  - Parses JSON
  - Returns typed ArquivoUploadResponse
      ↓
[Dashboard.tsx - Success Handler]
  - Shows success toast
  - Reloads file list
      ↓
USER INTERFACE UPDATED
```

## 🗂️ Estrutura de Pastas Completa

```
Sistema de Ingestão de Arquivos/
│
├── Nova_Arquitetura_Ingestao/
│   │
│   ├── servico_gestao/              # BACKEND - Gestão de Projetos
│   │   ├── domain/
│   │   │   └── entidades.py         # Projeto entity
│   │   ├── ports/
│   │   │   └── repositories.py      # Repository interface
│   │   ├── adapters/
│   │   │   └── sqlite_repository.py # SQLite implementation
│   │   ├── use_cases/
│   │   │   └── gerenciar_projetos.py # Business logic
│   │   └── main.py                   # FastAPI app (port 8001)
│   │
│   ├── servico_ingestao/            # BACKEND - Ingestão de Arquivos
│   │   ├── domain/
│   │   │   └── entidades.py         # Arquivo entity
│   │   ├── ports/
│   │   │   ├── repositories.py      # Repository interface
│   │   │   └── storage.py           # Storage interface
│   │   ├── adapters/
│   │   │   ├── sqlite_repository.py # SQLite implementation
│   │   │   └── local_storage.py     # Filesystem storage
│   │   ├── use_cases/
│   │   │   ├── upload_arquivo.py
│   │   │   ├── listar_arquivos.py
│   │   │   └── download_arquivo.py
│   │   └── main.py                   # FastAPI app (port 8002)
│   │
│   └── Frontend/                     # FRONTEND (OLD - substituído)
│       └── [deprecated files]
│
└── code/                             # NOVO FRONTEND ✨
    │
    ├── src/
    │   └── app/
    │       ├── types/
    │       │   └── index.ts          # TypeScript interfaces
    │       │
    │       ├── services/
    │       │   ├── gestaoApi.ts      # API client for gestão
    │       │   └── ingestaoApi.ts    # API client for ingestão
    │       │
    │       ├── utils/
    │       │   └── format.ts         # Formatters
    │       │
    │       ├── pages/
    │       │   ├── Projects.tsx      # Project CRUD
    │       │   └── Dashboard.tsx     # File management
    │       │
    │       └── App.tsx               # Main app + routing
    │
    ├── .env.example                  # Environment config
    ├── package.json                  # Dependencies
    ├── README.md                     # Documentation
    ├── ARCHITECTURE.md               # Architecture guide
    ├── QUICKSTART.md                 # Quick start
    └── REBUILD_SUMMARY.md            # Rebuild summary
```

## 🔀 Mapeamento de Tipos

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python)                             │
├─────────────────────────────────────────────────────────────────┤
│ @dataclass                                                      │
│ class Projeto:                                                  │
│     nome: str                                                   │
│     descricao: Optional[str] = None                            │
│     id: Optional[int] = None                                   │
│     data_criacao: datetime = field(default_factory=...)        │
│     ultima_alteracao: datetime = field(default_factory=...)    │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                        Type Mapping
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND (TypeScript)                          │
├─────────────────────────────────────────────────────────────────┤
│ interface Projeto {                                             │
│   id?: number;                                                  │
│   nome: string;                                                 │
│   descricao?: string;                                          │
│   data_criacao?: string;                                       │
│   ultima_alteracao?: string;                                   │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Endpoints Mapeados

### Serviço de Gestão

```
FRONTEND                           BACKEND
─────────────────────────────────────────────────────────────
gestaoApi.getProjetos()       →   GET  /api/projetos/
gestaoApi.getProjetoById(id)  →   GET  /api/projetos/{id}
gestaoApi.createProjeto(data) →   POST /api/projetos/
gestaoApi.updateProjeto(...)  →   PUT  /api/projetos/{id}
gestaoApi.deleteProjeto(id)   →   DELETE /api/projetos/{id}
```

### Serviço de Ingestão

```
FRONTEND                                  BACKEND
──────────────────────────────────────────────────────────────────
ingestaoApi.uploadArquivo(pid, file) →   POST /api/arquivos/
ingestaoApi.getArquivosPorProjeto(pid) → GET  /api/arquivos/projeto/{pid}
ingestaoApi.downloadArquivo(pid, aid) →  GET  /api/arquivos/download/{pid}/{aid}
ingestaoApi.getDownloadUrl(pid, aid)  →  [URL Helper]
```

## 💾 Fluxo de Persistência

```
USER ACTION
    ↓
FRONTEND (React State)
    ↓
API SERVICE (Axios)
    ↓
HTTP REQUEST
    ↓
BACKEND (FastAPI Route)
    ↓
USE CASE (Business Logic)
    ↓
DOMAIN ENTITY (Validation)
    ↓
REPOSITORY PORT (Interface)
    ↓
ADAPTER (Implementation)
    ↓
┌─────────────────────┐
│   SQLite Database   │  ← Metadata
│   projetos.db       │
│   arquivos.db       │
└─────────────────────┘

┌─────────────────────┐
│  Local Filesystem   │  ← Binary Files
│  /uploads/          │
└─────────────────────┘
```

## 🔄 Fluxo Completo de Caso de Uso

### Exemplo: Criar Projeto e Upload de Arquivo

```
1. USER: Acessa aplicação
   ↓
2. FRONTEND: Carrega Projects.tsx
   ↓
3. FRONTEND: Chama gestaoApi.getProjetos()
   ↓
4. HTTP: GET http://localhost:8001/api/projetos/
   ↓
5. BACKEND: GerenciarProjetosUseCase.listar_projetos()
   ↓
6. DATABASE: SELECT * FROM projetos
   ↓
7. BACKEND: Retorna JSON
   ↓
8. FRONTEND: Atualiza UI com lista de projetos
   ↓
9. USER: Clica "Novo Projeto"
   ↓
10. FRONTEND: Abre modal
   ↓
11. USER: Preenche { nome: "Projeto X", descricao: "..." }
   ↓
12. USER: Clica "Criar"
   ↓
13. FRONTEND: gestaoApi.createProjeto(data)
   ↓
14. HTTP: POST http://localhost:8001/api/projetos/
   ↓
15. BACKEND: GerenciarProjetosUseCase.criar_projeto()
   ↓
16. DOMAIN: Projeto.validar() - nome >= 3 chars
   ↓
17. DATABASE: INSERT INTO projetos
   ↓
18. BACKEND: Retorna Projeto com ID
   ↓
19. FRONTEND: Toast "Projeto criado!"
   ↓
20. FRONTEND: Recarrega lista
   ↓
21. USER: Clica no projeto criado
   ↓
22. FRONTEND: Navega para /dashboard/1
   ↓
23. FRONTEND: Dashboard.tsx carrega
   ↓
24. FRONTEND: ingestaoApi.getArquivosPorProjeto(1)
   ↓
25. HTTP: GET http://localhost:8002/api/arquivos/projeto/1
   ↓
26. BACKEND: ListarArquivosUseCase.execute(1)
   ↓
27. DATABASE: SELECT * FROM arquivos WHERE projeto_id = 1
   ↓
28. BACKEND: Retorna [] (vazio)
   ↓
29. FRONTEND: Mostra empty state
   ↓
30. USER: Arrasta arquivo.pdf
   ↓
31. FRONTEND: handleFileUpload([file])
   ↓
32. FRONTEND: ingestaoApi.uploadArquivo(1, file)
   ↓
33. HTTP: POST http://localhost:8002/api/arquivos/ (FormData)
   ↓
34. BACKEND: UploadArquivoUseCase.execute()
   ↓
35. DOMAIN: Arquivo.validar() - tipo permitido?
   ↓
36. STORAGE: LocalStorageAdapter.save_file() → /uploads/
   ↓
37. DATABASE: INSERT INTO arquivos
   ↓
38. BACKEND: Retorna Arquivo com ID
   ↓
39. FRONTEND: Toast "Arquivo enviado!"
   ↓
40. FRONTEND: Recarrega lista de arquivos
   ↓
41. FRONTEND: Mostra arquivo.pdf na tabela
   ↓
42. USER: Vê arquivo listado
```

---

**🎉 Arquitetura Completa e Funcional! 🎉**
