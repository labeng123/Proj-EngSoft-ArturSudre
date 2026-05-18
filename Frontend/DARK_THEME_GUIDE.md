# 🌙 Guia do Tema Escuro

## 🎯 Como Usar

### Alternar entre Temas

**Botão no canto superior direito:**
```
┌─────────────────────────────────────────────┐
│                                    [☀️/🌙]  │ ← Botão fixo
│                                             │
│  Meus Projetos                              │
│  ══════════════                             │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐                  │
│  │     │ │     │ │     │                  │
│  └─────┘ └─────┘ └─────┘                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Clique uma vez:**
- 🌙 Modo Escuro → ☀️ Modo Claro
- ☀️ Modo Claro → 🌙 Modo Escuro

**Preferência salva automaticamente!**

---

## 🎨 Comparação Visual

### Modo Claro (Light)
```
┌────────────────────────────────────────┐
│  Meus Projetos                         │ ← Texto: #1a1a1a
│  ──────────────                        │
│                                        │
│  ┌──────────────────┐                 │
│  │ Projeto Demo 1   │ ← Fundo: #ffffff │
│  │ ──────────────   │                 │
│  │ Descrição aqui   │ ← Texto: #666666 │
│  └──────────────────┘                 │
│                                        │
│  Fundo: #f8fafc → #f1f5f9             │
└────────────────────────────────────────┘
   Gradiente suave cinza claro
```

### Modo Escuro (Dark)
```
┌────────────────────────────────────────┐
│  Meus Projetos                         │ ← Texto: #ffffff
│  ──────────────                        │
│                                        │
│  ┌──────────────────┐                 │
│  │ Projeto Demo 1   │ ← Fundo: #1f2937 │
│  │ ──────────────   │                 │
│  │ Descrição aqui   │ ← Texto: #d1d5db │
│  └──────────────────┘                 │
│                                        │
│  Fundo: #111827 → #1f2937             │
└────────────────────────────────────────┘
   Gradiente suave cinza escuro
```

---

## 🔍 Elementos por Tema

### Backgrounds

| Elemento | Light | Dark |
|----------|-------|------|
| Página | `from-slate-50 to-slate-100` | `from-gray-900 to-gray-800` |
| Cards | `bg-white` | `bg-gray-800` |
| Modais | `bg-white` | `bg-gray-800` |
| Tabela Header | `bg-gray-50` | `bg-gray-700/50` |
| Input | `bg-white` | `bg-gray-700` |

### Textos

| Tipo | Light | Dark |
|------|-------|------|
| Título | `text-gray-900` | `text-white` |
| Subtítulo | `text-gray-600` | `text-gray-300` |
| Descrição | `text-gray-500` | `text-gray-400` |
| Placeholder | `text-gray-400` | `text-gray-500` |

### Bordas

| Elemento | Light | Dark |
|----------|-------|------|
| Cards | `border-gray-100` | `border-gray-700` |
| Inputs | `border-gray-300` | `border-gray-600` |
| Divisores | `border-gray-200` | `border-gray-600` |

### Botões

| Tipo | Light | Dark |
|------|-------|------|
| Primary | `bg-blue-600` | `bg-blue-500` |
| Primary Hover | `hover:bg-blue-700` | `hover:bg-blue-600` |
| Secondary | `bg-white border` | `bg-gray-700 border` |
| Secondary Hover | `hover:bg-gray-50` | `hover:bg-gray-600` |

---

## 💡 Destaques do Tema Escuro

### Upload Zone
```
MODO CLARO:
┌─────────────────────────────┐
│         📁                  │ ← Ícone cinza
│  Arraste arquivos aqui      │
│                             │
│  [ Selecionar Arquivos ]    │ ← Botão azul
└─────────────────────────────┘
Fundo branco, borda cinza clara

MODO ESCURO:
┌─────────────────────────────┐
│         📁                  │ ← Ícone cinza escuro
│  Arraste arquivos aqui      │
│                             │
│  [ Selecionar Arquivos ]    │ ← Botão azul vibrante
└─────────────────────────────┘
Fundo cinza escuro, borda cinza média
```

### Tabela de Arquivos
```
MODO CLARO:
┌──────────────────────────────────────┐
│ Arquivo   │ Tipo │ Tamanho │ Data   │
├──────────────────────────────────────┤
│ 📄 doc.pdf│ PDF  │ 2.4 MB  │ Hoje   │ ← Hover: cinza bem claro
│ 📊 data.csv│ CSV │ 512 KB  │ Ontem  │
└──────────────────────────────────────┘

MODO ESCURO:
┌──────────────────────────────────────┐
│ Arquivo   │ Tipo │ Tamanho │ Data   │
├──────────────────────────────────────┤
│ 📄 doc.pdf│ PDF  │ 2.4 MB  │ Hoje   │ ← Hover: cinza escuro suave
│ 📊 data.csv│ CSV │ 512 KB  │ Ontem  │
└──────────────────────────────────────┘
```

### Filtros de Arquivo
```
MODO CLARO:
[ Todos (5) ] [ PDF (2) ] [ CSV (1) ] [ DOCX (2) ]
   Azul         Branco      Branco      Branco
   ────         ─────       ─────       ─────
   Ativo

MODO ESCURO:
[ Todos (5) ] [ PDF (2) ] [ CSV (1) ] [ DOCX (2) ]
 Azul claro   Cinza       Cinza       Cinza
   ────       escuro      escuro      escuro
   Ativo
```

---

## 🎭 Animações e Transições

### Todas as mudanças são suaves:
- ✨ Fade in/out de cores (300ms)
- ✨ Transição de backgrounds
- ✨ Hover effects progressivos
- ✨ Mudança de tema sem "flash"

### Efeito Hover no Dark Mode
```
Card Normal:       Card Hover:
┌─────────┐       ┌─────────┐
│         │  →    │         │ ← Ligeiramente mais claro
│ Projeto │       │ Projeto │    + Sombra mais forte
│         │       │         │
└─────────┘       └─────────┘
```

---

## 🔧 Detalhes Técnicos

### Como Funciona

1. **Inicialização:**
   ```typescript
   // App carrega ThemeProvider
   const [theme, setTheme] = useState(() => {
     const stored = localStorage.getItem('theme');
     return stored || 'dark'; // Padrão: escuro
   });
   ```

2. **Aplicação:**
   ```typescript
   useEffect(() => {
     document.documentElement.classList.remove('light', 'dark');
     document.documentElement.classList.add(theme);
     localStorage.setItem('theme', theme);
   }, [theme]);
   ```

3. **CSS Tailwind:**
   ```css
   /* Automaticamente ativa quando .dark existe */
   .dark .dark\:bg-gray-800 {
     background-color: #1f2937;
   }
   ```

### Classes Dark Mode

**Exemplo de componente:**
```tsx
<div className="
  bg-white           ← Modo claro
  dark:bg-gray-800   ← Modo escuro
  text-gray-900      ← Texto claro
  dark:text-white    ← Texto escuro
  border-gray-100    ← Borda clara
  dark:border-gray-700 ← Borda escura
">
  Conteúdo
</div>
```

---

## 📱 Responsividade

O tema escuro funciona em **todos os tamanhos de tela:**

```
Mobile (< 768px):
┌──────────┐
│  [🌙]    │
│          │
│ Projeto  │
│ ──────   │
│          │
└──────────┘

Tablet (768-1024px):
┌─────────────────────┐
│              [🌙]   │
│  ┌───┐  ┌───┐      │
│  │   │  │   │      │
│  └───┘  └───┘      │
└─────────────────────┘

Desktop (> 1024px):
┌──────────────────────────────────┐
│                         [🌙]     │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐    │
│  │   │  │   │  │   │  │   │    │
│  └───┘  └───┘  └───┘  └───┘    │
└──────────────────────────────────┘
```

---

## ✅ Checklist de Teste

Teste você mesmo:

- [ ] Clicar no botão Sun/Moon alterna o tema
- [ ] Recarregar a página mantém o tema escolhido
- [ ] Todos os textos são legíveis em ambos os temas
- [ ] Hover effects funcionam em cards
- [ ] Upload zone muda de cor ao arrastar arquivos
- [ ] Modais têm fundo escuro no dark mode
- [ ] Tabela tem hover effect suave
- [ ] Filtros mudam de cor quando ativos

---

## 🎨 Paleta Completa

### Modo Claro
```
Backgrounds:
  slate-50:  #f8fafc
  slate-100: #f1f5f9
  white:     #ffffff

Textos:
  gray-900:  #111827
  gray-600:  #4b5563
  gray-500:  #6b7280

Bordas:
  gray-100:  #f3f4f6
  gray-200:  #e5e7eb
  gray-300:  #d1d5db

Ações:
  blue-600:  #2563eb
  blue-700:  #1d4ed8
```

### Modo Escuro
```
Backgrounds:
  gray-900:  #111827
  gray-800:  #1f2937
  gray-700:  #374151

Textos:
  white:     #ffffff
  gray-300:  #d1d5db
  gray-400:  #9ca3af

Bordas:
  gray-700:  #374151
  gray-600:  #4b5563

Ações:
  blue-500:  #3b82f6
  blue-600:  #2563eb
```

---

**🌙 Aproveite o tema escuro! 🌙**

**Dica:** O tema escuro é ideal para trabalhar à noite e reduz fadiga visual! ✨
