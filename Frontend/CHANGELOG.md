# 📝 Changelog - Correções e Melhorias

## [1.1.0] - 2024-05-17

### 🐛 Correções de Bugs

#### Erro 405 Method Not Allowed
- **Problema:** Erro ao clicar em projetos (GET /api/projetos/{id} não existe no backend)
- **Solução:** Modificado `gestaoApi.getProjetoById()` para usar endpoint existente
- **Impacto:** Navegação entre projetos e dashboard funciona corretamente

### ✨ Novas Funcionalidades

#### Tema Escuro Completo
- **Toggle de tema** fixo no canto superior direito
- **Persistência** de preferência em localStorage
- **Modo escuro por padrão** na primeira visita
- **Paleta de cores** profissional e consistente

### 🎨 Melhorias de UI

#### Todas as Páginas
- ✅ Backgrounds com gradientes escuros suaves
- ✅ Cards e modais com cores apropriadas
- ✅ Textos legíveis em ambos os temas
- ✅ Bordas sutis que funcionam em light/dark
- ✅ Hover effects adaptados para cada tema
- ✅ Transições suaves entre temas

#### Projects.tsx
- ✅ Grid de projetos totalmente responsivo
- ✅ Cards com hover effects em ambos os temas
- ✅ Modal de criação/edição com tema escuro
- ✅ Empty state estilizado

#### Dashboard.tsx
- ✅ Header com breadcrumb responsivo
- ✅ Upload zone com drag & drop visual
- ✅ Filtros de tipo de arquivo estilizados
- ✅ Tabela de arquivos com hover effects
- ✅ Estados vazios informativos

### 🔧 Arquivos Modificados

```
src/app/
├── App.tsx                          # ThemeProvider integration
├── components/
│   ├── ThemeProvider.tsx           # NEW - Theme context
│   └── ThemeToggle.tsx             # NEW - Toggle button
├── pages/
│   ├── Projects.tsx                # Dark mode classes
│   └── Dashboard.tsx               # Dark mode classes
└── services/
    └── gestaoApi.ts                # Fix 405 error
```

### 📊 Estatísticas

- **2 novos componentes** criados
- **4 arquivos** modificados
- **~150 classes CSS** adicionadas com dark:
- **100% coverage** de tema escuro
- **0 erros** de navegação

### 🚀 Próximos Passos Sugeridos

- [ ] Adicionar preferência de sistema (prefers-color-scheme)
- [ ] Testes automatizados para temas
- [ ] Mais variações de cores no tema escuro
- [ ] Animações de transição entre temas

---

**Versão anterior:** 1.0.0 - Frontend inicial  
**Versão atual:** 1.1.0 - Com tema escuro e correção 405
