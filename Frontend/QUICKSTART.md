# 🚀 Quick Start Guide

## Início Rápido

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente (Opcional)

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar se necessário (valores padrão já funcionam)
VITE_GESTAO_API_URL=http://localhost:8001
VITE_INGESTAO_API_URL=http://localhost:8002
```

### 3. Executar a Aplicação

**No Figma Make, o servidor já está rodando automaticamente!**

Se estiver usando Vite standalone:
```bash
pnpm dev
```

## 🔧 Testando com Backend

### Opção 1: Backend Rodando (Recomendado)

1. Inicie o serviço de gestão:
```bash
cd Nova_Arquitetura_Ingestao/servico_gestao
python main.py
```

2. Inicie o serviço de ingestão:
```bash
cd Nova_Arquitetura_Ingestao/servico_ingestao
python main.py
```

3. O frontend conectará automaticamente aos backends

### Opção 2: Modo Mock (Sem Backend)

O frontend funciona perfeitamente sem backend usando mock data:
- ✅ Dados salvos em localStorage
- ✅ Todas funcionalidades disponíveis
- ✅ Ideal para desenvolvimento de UI

## 📱 Uso da Aplicação

### Criar Projeto

1. Acesse a página inicial
2. Clique em "Novo Projeto"
3. Preencha nome (obrigatório) e descrição (opcional)
4. Clique em "Criar"

### Upload de Arquivos

1. Clique em um projeto
2. Arraste arquivos para a zona de upload, ou
3. Clique em "Selecionar Arquivos"
4. Selecione múltiplos arquivos (PDF, TXT, DOCX, CSV)
5. Arquivos aparecem automaticamente na lista

### Gerenciar Arquivos

- **Filtrar**: Clique nos botões de tipo (PDF, DOCX, etc.)
- **Download**: Clique em "Baixar" em qualquer arquivo
- **Visualizar**: Veja tamanho, tipo e data de upload

### Editar/Excluir Projeto

1. Na lista de projetos, passe o mouse sobre um card
2. Aparecem ícones de editar (✏️) e excluir (🗑️)
3. Use os botões conforme necessário

## 🐛 Troubleshooting

### Erro: "Network Error"
**Causa**: Backend não está rodando  
**Solução**: 
- Verifique se os backends estão ativos nas portas 8001 e 8002
- Ou use o modo mock (automático)

### Erro: "CORS Policy"
**Causa**: Backend não permite origem do frontend  
**Solução**: Backend já configurado com `allow_origins=["*"]`

### Upload não funciona
**Causa**: Tipo de arquivo não permitido  
**Solução**: Use apenas PDF, TXT, DOCX, CSV

### Projeto não carrega
**Causa**: ID inválido na URL  
**Solução**: Aplicação redireciona automaticamente para home

## 📚 Próximos Passos

1. **Explorar o código**:
   - `src/app/types/` - Entenda os tipos TypeScript
   - `src/app/services/` - Veja como APIs são chamadas
   - `src/app/pages/` - Explore os componentes principais

2. **Customizar**:
   - Edite `src/styles/theme.css` para mudar cores
   - Modifique `src/app/utils/format.ts` para outros formatos

3. **Adicionar features**:
   - Busca de projetos
   - Ordenação de arquivos
   - Preview de arquivos
   - Estatísticas de uso

## 🎯 Atalhos Úteis

- **Home**: `/` - Lista de projetos
- **Dashboard**: `/dashboard/:id` - Arquivos do projeto
- **Criar Projeto**: Botão "Novo Projeto" na home
- **Upload**: Drag & drop no dashboard

## 📞 Suporte

- Veja `README.md` para documentação completa
- Veja `ARCHITECTURE.md` para detalhes técnicos
- Consulte o código - está bem comentado!

---

**Pronto para usar! 🎉**
