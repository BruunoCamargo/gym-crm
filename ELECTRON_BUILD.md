# Gym CRM - Guia de Build para Electron (Windows)

## Visão Geral

Este documento explica como compilar o Gym CRM em um aplicativo executável para Windows 10.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js 18+** — [Download](https://nodejs.org/)
2. **pnpm** — `npm install -g pnpm`
3. **Git** — [Download](https://git-scm.com/)

---

## Estrutura do Projeto

```
gym-crm/
├── electron/
│   ├── main.ts           ← Processo principal do Electron
│   └── preload.ts        ← Script de preload (segurança)
├── client/
│   └── src/              ← Código React
├── server/
│   └── ...               ← Backend tRPC
├── assets/
│   └── icon.png          ← Ícone do aplicativo
├── electron-builder.config.js  ← Configuração do build
└── package.json          ← Scripts e dependências
```

---

## Passo a Passo: Compilar para Windows

### 1. Instalar Dependências

```bash
cd gym-crm
pnpm install
```

### 2. Compilar o Código

```bash
pnpm build
```

Este comando:
- Compila o React (frontend) para `dist/public/`
- Compila o backend Express para `dist/`
- Gera os arquivos otimizados para produção

### 3. Gerar o Executável Windows

```bash
pnpm electron:build:win
```

Isso vai:
- Compilar o Electron
- Gerar dois instaladores em `dist/installers/`:
  - `Gym CRM Setup 1.0.0.exe` (instalador NSIS)
  - `Gym CRM 1.0.0.exe` (versão portátil)

### 4. Testar o Executável

Abra o arquivo `.exe` gerado e teste:
- Login com OAuth
- Cadastro de alunos
- Listagem e filtros
- Dashboard com gráficos

---

## Desenvolvimento com Electron

Para desenvolver e testar em tempo real:

```bash
pnpm electron:dev
```

Isso vai:
- Iniciar o servidor de desenvolvimento (Vite)
- Abrir a janela do Electron
- Recarregar automaticamente ao fazer mudanças

---

## Estrutura de Arquivos do Build

### electron/main.ts

Arquivo principal do Electron que:
- Cria a janela do aplicativo
- Gerencia o ciclo de vida
- Expõe APIs via IPC (Inter-Process Communication)

**Funções principais:**
- `createWindow()` — Cria a janela principal
- `app.on('ready')` — Inicializa quando o Electron está pronto
- `ipcMain.handle()` — Define handlers para comunicação com o frontend

### electron/preload.ts

Script de segurança que:
- Expõe APIs seguras para o React via `window.electronAPI`
- Valida canais de comunicação (whitelist)
- Previne acesso direto ao Node.js do frontend

**APIs disponíveis no React:**
```javascript
// Obter informações do app
const info = await window.electronAPI.getAppInfo();

// Controlar a janela
await window.electronAPI.minimizeWindow();
await window.electronAPI.toggleMaximizeWindow();
await window.electronAPI.closeWindow();
```

### electron-builder.config.js

Configuração do build:
- Define ícone, nome e versão do app
- Configura o instalador NSIS
- Define arquivos a incluir no build

---

## Distribuição

### Opção 1: Instalador NSIS (Recomendado)

O arquivo `Gym CRM Setup 1.0.0.exe` é um instalador tradicional:
- Usuários clicam e seguem o assistente
- Cria atalhos na área de trabalho e menu Iniciar
- Permite desinstalação via Painel de Controle

### Opção 2: Executável Portátil

O arquivo `Gym CRM 1.0.0.exe` é um executável único:
- Não requer instalação
- Pode rodar de qualquer pasta
- Ideal para pendrives ou compartilhamento rápido

---

## Solução de Problemas

### "electron not found"

```bash
pnpm install
```

### "Build failed: icon.png not found"

Certifique-se de que o ícone existe em `assets/icon.png`

### "Port 5173 already in use"

```bash
# Matar o processo que usa a porta
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9
```

### Aplicativo não conecta ao servidor

Verifique se:
1. O servidor Manus está rodando
2. As variáveis de ambiente estão corretas
3. A URL do servidor está configurada em `client/src/lib/trpc.ts`

---

## Customizações

### Mudar o Ícone

1. Gere uma nova imagem 1024x1024 em PNG
2. Salve em `assets/icon.png`
3. Recompile com `pnpm electron:build:win`

### Mudar o Nome do Aplicativo

Edite `electron-builder.config.js`:

```javascript
productName: "Seu Nome Aqui",
```

### Mudar a Versão

Edite `package.json`:

```json
"version": "1.1.0"
```

---

## Próximos Passos

1. **Assinatura de código** — Para distribuição profissional, assine o executável com um certificado
2. **Atualizações automáticas** — Configure electron-updater para atualizações OTA
3. **Notarização macOS** — Se quiser versão para Mac
4. **Distribuição** — Hospede os instaladores em um servidor ou GitHub Releases

---

## Referências

- [Documentação Electron](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [NSIS Installer](https://nsis.sourceforge.io/)
