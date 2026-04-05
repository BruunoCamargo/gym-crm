# 💪 Gym CRM - Sistema de Gestão para Academia

Um sistema completo de gestão para academias com **versão web** e **app desktop** para Windows.

## 🎯 Características Principais

### ✨ Versão Web
- 🌐 Acesso via navegador (Chrome, Firefox, Edge, Safari)
- 📱 Responsivo para desktop e tablet
- 💾 Dados armazenados localmente no navegador
- 🔒 Sem necessidade de login
- ⚡ Funciona online e offline

### 🪟 Versão Desktop (Windows)
- 📦 Aplicativo standalone para Windows 10/11
- 💾 Banco de dados SQLite local
- 🔓 Funciona completamente offline
- 📊 Mesmas funcionalidades da versão web
- ⚙️ Instalador automático

---

## 📋 Funcionalidades

### Dashboard
- 📊 Estatísticas em tempo real
- 📈 Gráficos de receita por plano
- 🎯 Taxa de adimplência
- ⚠️ Alertas de vencimentos próximos

### Gestão de Alunos
- ➕ Adicionar novo aluno
- ✏️ Editar informações
- 🗑️ Deletar aluno
- 🔍 Buscar e filtrar
- 📋 Listar todos os alunos

### Controle de Vencimentos
- 🚨 Alertas de mensalidades vencidas
- 📅 Visualizar vencimentos próximos
- ✅ Marcar como pago
- 📊 Histórico de pagamentos

### Relatórios
- 💰 Receita por plano
- 📊 Status de pagamento
- 📈 Inscrições (últimos 30 dias)
- 👥 Distribuição de idade

---

## 🚀 Quick Start

### Versão Web
```
1. Acesse: [seu-link-aqui]
2. Pronto! O sistema carrega com dados de demonstração
3. Comece a adicionar alunos
```

### Versão Desktop
```
1. Baixe: Gym-CRM-Setup-1.0.0.exe
2. Execute o instalador
3. O app abre automaticamente
4. Pronto para usar!
```

---

## 📦 Planos Disponíveis

| Plano | Valor | Duração |
|-------|-------|---------|
| Mensal | R$ 89,90 | 1 mês |
| Trimestral | R$ 239,90 | 3 meses |
| Semestral | R$ 429,90 | 6 meses |
| Anual | R$ 799,90 | 12 meses |

---

## 💻 Tecnologia

### Frontend
- **React 19** — UI moderna e responsiva
- **TypeScript** — Código seguro e tipado
- **Tailwind CSS 4** — Estilização profissional
- **Recharts** — Gráficos interativos
- **shadcn/ui** — Componentes de alta qualidade

### Backend (Desktop)
- **Electron** — Aplicativo desktop
- **SQLite 3** — Banco de dados local
- **better-sqlite3** — Driver rápido

### Design
- **Slate & Emerald Professional** — Design system próprio
- **Dark Mode** — Tema escuro profissional
- **Responsive** — Funciona em qualquer tamanho de tela

---

## 📚 Documentação

- **[GUIA_INSTALACAO.md](./GUIA_INSTALACAO.md)** — Guia completo de instalação e uso
- **[WINDOWS_BUILD.md](./WINDOWS_BUILD.md)** — Build para Windows (técnico)
- **[BUILD_WINDOWS_PASSO_A_PASSO.md](./BUILD_WINDOWS_PASSO_A_PASSO.md)** — Passo a passo detalhado
- **[GUIA_COMPLETO.md](./GUIA_COMPLETO.md)** — Documentação técnica completa

---

## 🔧 Desenvolvimento

### Requisitos
- Node.js 18+
- pnpm (gerenciador de pacotes)
- Python 3.x (para build do Electron)
- Visual Studio Build Tools (para Windows)

### Instalação Local

```bash
# Clonar o repositório
git clone https://github.com/BruunoCamargo/gym-crm.git
cd gym-crm

# Instalar dependências
pnpm install

# Desenvolvimento (web)
pnpm run dev

# Desenvolvimento (Electron)
pnpm run electron:dev

# Build para produção
pnpm run build

# Build do instalador Windows
pnpm run electron:build:win
```

---

## 📁 Estrutura do Projeto

```
gym-crm/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Dashboard, Alunos, etc)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Context API (CRM, Theme)
│   │   └── lib/           # Utilitários
│   └── index.html
├── electron/              # Aplicativo Electron
│   ├── main.ts           # Arquivo principal
│   ├── main-standalone.ts # Versão standalone com SQLite
│   └── preload.ts        # Preload script
├── drizzle/              # Configuração do banco (não usado na versão standalone)
├── public/               # Assets estáticos
└── dist/                 # Build compilado
```

---

## 🎨 Design System

### Cores
- **Primária:** Emerald Green (#10B981)
- **Fundo:** Slate Dark (#0F172A)
- **Cards:** Slate Médio (#1E293B)
- **Texto:** Branco/Cinza claro

### Tipografia
- **Headings:** Sora (Bold, Semibold)
- **Body:** Inter (Regular, Medium)
- **Dados:** JetBrains Mono (números)

### Componentes
- Botões com hover suave
- Cards com sombra elegante
- Tabelas com alternância de cores
- Modais com backdrop blur
- Gráficos coloridos e informativos

---

## 🔐 Segurança

- ✅ Dados armazenados localmente (não enviados para servidor)
- ✅ Sem autenticação externa (OAuth não necessário)
- ✅ Sem dependência de API remota
- ✅ Funciona completamente offline
- ✅ Código aberto para auditoria

---

## 📊 Estatísticas

- **Linhas de código:** ~5000+
- **Componentes React:** 20+
- **Páginas:** 4 (Dashboard, Alunos, Vencimentos, Relatórios)
- **Gráficos:** 4 tipos diferentes
- **Tempo de desenvolvimento:** 40+ horas

---

## 🚀 Roadmap

### v1.1 (Próxima)
- [ ] Exportação para Excel/PDF
- [ ] Backup automático na nuvem
- [ ] Notificações por email
- [ ] Temas personalizáveis

### v1.2
- [ ] Aplicativo mobile (iOS/Android)
- [ ] Sincronização multi-dispositivo
- [ ] Integração com gateways de pagamento
- [ ] Sistema de usuários e permissões

### v2.0
- [ ] API REST para integrações
- [ ] Webhooks para eventos
- [ ] Plugin system
- [ ] Relatórios avançados com BI

---

## 📝 Licença

Este projeto é fornecido como está para fins educacionais e comerciais.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para academias

---

## 🤝 Contribuições

Contribuições são bem-vindas! Para reportar bugs ou sugerir features:

1. Abra uma issue no GitHub
2. Descreva o problema/sugestão
3. Aguarde o feedback

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação
2. Verifique o Troubleshooting
3. Abra uma issue no GitHub

---

## 🎉 Obrigado!

Obrigado por usar o Gym CRM! Esperamos que este sistema ajude a gerenciar sua academia com eficiência.

**Versão:** 1.0.0  
**Última atualização:** Abril de 2026  
**Status:** ✅ Pronto para produção

---

**Desenvolvido com React, Electron e muito café ☕**
