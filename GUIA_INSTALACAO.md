# Gym CRM - Guia Completo de Instalação e Uso

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Versão Web (Online)](#versão-web-online)
3. [Versão Desktop (Windows)](#versão-desktop-windows)
4. [Funcionalidades](#funcionalidades)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Gym CRM** é um sistema de gestão para academias com duas versões:

| Versão | Acesso | Dados | Requisitos | Melhor para |
|--------|--------|-------|-----------|-----------|
| **Web** | Online via navegador | Armazenados no navegador | Apenas internet | Uso em qualquer dispositivo |
| **Desktop** | Aplicativo Windows | Banco de dados local (SQLite) | Windows 10/11 | Uso offline, sem internet |

---

## 🌐 Versão Web (Online)

### Acesso Rápido

1. Abra seu navegador (Chrome, Firefox, Edge, Safari)
2. Acesse: **[Seu link do site]**
3. O sistema carrega automaticamente com dados de demonstração

### Recursos Disponíveis

✅ **Dashboard** — Visão geral com estatísticas em tempo real
✅ **Gestão de Alunos** — Adicionar, editar e deletar alunos
✅ **Controle de Vencimentos** — Alertas de mensalidades vencidas
✅ **Relatórios** — Gráficos e análises de receita
✅ **Dados Locais** — Tudo armazenado no seu navegador (privado)

### Navegação

```
Dashboard (Página inicial)
├── Total de Alunos
├── Alunos Ativos
├── Mensalidades Pagas
├── Vencimentos Hoje
└── Gráficos de Receita

Alunos (Gestão)
├── Listar todos os alunos
├── Adicionar novo aluno
├── Editar informações
└── Deletar aluno

Vencimentos (Alertas)
├── Alunos com mensalidades vencidas
├── Dias em atraso
└── Marcar como pago

Relatórios (Análises)
├── Receita por plano
├── Status de pagamento
├── Inscrições (últimos 30 dias)
└── Distribuição de idade
```

### Planos Disponíveis

| Plano | Valor | Duração |
|-------|-------|---------|
| Mensal | R$ 89,90 | 1 mês |
| Trimestral | R$ 239,90 | 3 meses |
| Semestral | R$ 429,90 | 6 meses |
| Anual | R$ 799,90 | 12 meses |

---

## 🪟 Versão Desktop (Windows)

### Requisitos do Sistema

- **Windows 10** ou **Windows 11** (64-bit)
- **Mínimo 200 MB** de espaço em disco
- **Sem necessidade de internet** (funciona offline)

### Instalação

#### Opção 1: Instalador (Recomendado)

1. Baixe o arquivo `Gym-CRM-Setup-1.0.0.exe`
2. Clique duas vezes para executar
3. Siga as instruções do instalador
4. O atalho será criado automaticamente na área de trabalho

#### Opção 2: Versão Portável

1. Baixe o arquivo `Gym-CRM-1.0.0.exe`
2. Extraia em uma pasta de sua escolha
3. Clique duas vezes para executar (sem instalação)

### Primeira Execução

Na primeira vez que abrir o app:

1. ✅ O banco de dados será criado automaticamente
2. ✅ Os planos padrão serão inseridos
3. ✅ Dados de demonstração serão carregados
4. ✅ Tudo pronto para usar!

### Localização do Banco de Dados

Os dados são salvos em:
```
C:\Users\[Seu Usuário]\AppData\Roaming\Gym CRM\gym-crm.db
```

**Importante:** Faça backup deste arquivo regularmente!

### Recursos da Versão Desktop

✅ Todas as funcionalidades da versão web
✅ Funciona **completamente offline**
✅ Dados salvos localmente (mais seguro)
✅ Sem dependência de servidor externo
✅ Atualizações automáticas (em breve)

---

## 🎯 Funcionalidades Detalhadas

### 1. Dashboard

**O que você vê:**
- Total de alunos cadastrados
- Alunos ativos (com mensalidade em dia)
- Mensalidades pagas este mês
- Vencimentos hoje
- Taxa de adimplência (%)
- Gráficos de receita por plano
- Alertas de vencimentos próximos

**Ações possíveis:**
- Visualizar estatísticas em tempo real
- Acessar alunos vencidos rapidamente
- Ver tendências de receita

### 2. Gestão de Alunos

**Adicionar Novo Aluno:**
1. Clique em "Novo Aluno"
2. Preencha os dados:
   - Nome completo (obrigatório)
   - Idade
   - Telefone (obrigatório)
   - Endereço (obrigatório)
   - E-mail (opcional)
   - Plano (Mensal/Trimestral/Semestral/Anual)
   - Data de início
   - Observações (opcional)
3. Clique em "Cadastrar"

**Editar Aluno:**
1. Clique no ícone de edição (lápis)
2. Modifique os dados desejados
3. Clique em "Atualizar"

**Deletar Aluno:**
1. Clique no ícone de lixeira
2. Confirme a exclusão
3. O aluno será removido do sistema

**Filtros:**
- Buscar por nome, email ou telefone
- Filtrar por status de pagamento (Em Dia / Pendente / Vencido)
- Filtrar por tipo de plano

### 3. Controle de Vencimentos

**Visualizar Vencimentos:**
- Página dedicada mostra todos os alunos com mensalidades vencidas
- Exibe dias em atraso
- Mostra valor da mensalidade

**Ações:**
- Marcar como pago (atualiza automaticamente a data de vencimento)
- Editar informações do aluno
- Ver histórico de pagamentos

### 4. Relatórios

**Gráficos Disponíveis:**

1. **Receita por Plano** — Mostra qual plano gera mais receita
2. **Status de Pagamento** — Distribuição de alunos por status
3. **Inscrições (30 dias)** — Tendência de novos alunos
4. **Distribuição de Idade** — Faixa etária dos alunos

**Métricas:**
- Receita total mensal
- Taxa de retenção (%)
- Ticket médio por aluno

---

## 🔧 Troubleshooting

### Problema: App não abre

**Solução:**
1. Desabilite temporariamente o antivírus
2. Tente executar como administrador
3. Reinstale o aplicativo

### Problema: "Arquivo não encontrado"

**Solução:**
1. Verifique se o Windows 10/11 está atualizado
2. Instale o [.NET Runtime](https://dotnet.microsoft.com/download/dotnet)
3. Reinstale o Gym CRM

### Problema: Dados desapareceram (Web)

**Solução:**
1. Verifique se o navegador está salvando dados locais
2. Não limpe o cache do navegador
3. Tente em outro navegador
4. Use a versão Desktop para dados mais seguros

### Problema: Banco de dados corrompido (Desktop)

**Solução:**
1. Localize o arquivo `gym-crm.db` em `AppData\Roaming\Gym CRM`
2. Faça backup (renomeie para `gym-crm.db.backup`)
3. Abra o app novamente (um novo banco será criado)
4. Os dados anteriores podem ser recuperados do backup

### Problema: Instalador não funciona

**Solução:**
1. Baixe novamente o arquivo
2. Verifique a integridade (compare o tamanho)
3. Tente a versão portável
4. Desabilite antivírus temporariamente

---

## 📞 Suporte

Para problemas ou dúvidas:

1. **Consulte este guia** — Muitas respostas estão aqui
2. **Verifique os logs** — Abra DevTools (Ctrl+Shift+I) na web
3. **Contate o desenvolvedor** — [Email/Telefone]

---

## 📝 Dicas Úteis

### Backup de Dados (Desktop)

```
1. Localize: C:\Users\[Seu Usuário]\AppData\Roaming\Gym CRM
2. Copie o arquivo gym-crm.db
3. Salve em um local seguro (Google Drive, Dropbox, etc.)
```

### Exportar Dados

Atualmente, use:
- **Print Screen** para capturar tabelas
- **Copiar dados** das tabelas manualmente
- Planeje exportar para Excel (em breve)

### Melhor Prática

- ✅ Faça backup semanal dos dados
- ✅ Use a versão Desktop para dados críticos
- ✅ Mantenha o Windows atualizado
- ✅ Não compartilhe o arquivo do banco de dados

---

## 🚀 Próximas Versões

Planejado para futuras atualizações:

- 📱 Aplicativo mobile (iOS/Android)
- ☁️ Sincronização na nuvem
- 📊 Exportação para Excel/PDF
- 💳 Integração com gateways de pagamento
- 📧 Notificações por email
- 🔔 Lembretes de vencimento

---

## 📄 Informações Técnicas

**Versão:** 1.0.0
**Plataforma:** Windows 10/11 (64-bit)
**Banco de Dados:** SQLite 3
**Frontend:** React 19
**Desktop:** Electron

---

**Obrigado por usar o Gym CRM! 💪**
