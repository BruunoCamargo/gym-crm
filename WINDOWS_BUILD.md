# Gym CRM - Build para Windows (Standalone)

## Visão Geral

Este guia explica como compilar o Gym CRM como um aplicativo Electron standalone para Windows 10/11. A versão standalone funciona completamente offline com banco de dados SQLite local, sem necessidade de servidor externo ou autenticação OAuth.

## Pré-requisitos

- **Node.js 18+** — [Download](https://nodejs.org/)
- **pnpm** — `npm install -g pnpm`
- **Python 3.x** — Necessário para compilar native modules (better-sqlite3)
- **Visual Studio Build Tools** — Para compilar módulos nativos no Windows

### Instalação do Visual Studio Build Tools

1. Baixe do [site oficial](https://visualstudio.microsoft.com/downloads/)
2. Selecione "Desktop development with C++"
3. Instale e reinicie o computador

## Passos para Build

### 1. Preparar o Ambiente

```bash
cd /home/ubuntu/gym-crm

# Instalar dependências
pnpm install

# Instalar better-sqlite3 (se ainda não estiver instalado)
pnpm add better-sqlite3 --save
```

### 2. Compilar para Windows

**Opção A: Script automático (recomendado)**

```bash
bash build-electron-standalone.sh
```

**Opção B: Comandos manuais**

```bash
# Compilar frontend
pnpm run build

# Compilar TypeScript do Electron
pnpm exec tsc -p tsconfig.electron.json

# Copiar o main-standalone.ts
cp electron/main-standalone.ts dist/electron/main.ts

# Gerar instalador Windows
pnpm exec electron-builder --win
```

### 3. Resultado

O instalador será gerado em:
```
dist/installers/Gym CRM Setup 1.0.0.exe
```

## Estrutura do Build

```
dist/
├── public/                    # Frontend compilado
│   ├── index.html
│   ├── assets/
│   └── ...
├── electron/
│   ├── main.js               # Electron principal
│   ├── preload.js
│   └── ...
└── installers/
    ├── Gym CRM Setup 1.0.0.exe    # Instalador NSIS
    └── Gym CRM 1.0.0.exe          # Versão portável
```

## Configuração do Banco de Dados

O banco de dados SQLite é criado automaticamente em:
```
%APPDATA%\Gym CRM\gym-crm.db
```

Planos padrão são inseridos na primeira execução:
- Plano Mensal: R$ 89,90
- Plano Trimestral: R$ 239,90
- Plano Semestral: R$ 429,90
- Plano Anual: R$ 799,90

## Troubleshooting

### Erro: "better-sqlite3 not found"

```bash
# Recompilar o módulo nativo
pnpm exec node-gyp rebuild --directory node_modules/better-sqlite3
```

### Erro: "Arquivo index.html não encontrado"

Certifique-se de que o build foi executado corretamente:
```bash
ls dist/public/index.html
```

### Erro ao executar o instalador

1. Desabilite temporariamente o antivírus
2. Execute como administrador
3. Verifique se há espaço em disco

## Recursos da Versão Standalone

✅ **Dashboard** com estatísticas em tempo real
✅ **Gestão de Alunos** (CRUD completo)
✅ **Controle de Vencimentos** com alertas
✅ **Relatórios** com gráficos
✅ **Banco de Dados Local** (SQLite)
✅ **Funciona Offline** (sem internet necessária)
✅ **Sem Autenticação Externa** (OAuth não necessário)

## Desenvolvimento

Para desenvolver localmente:

```bash
# Terminal 1: Servidor de desenvolvimento
pnpm run dev

# Terminal 2: Electron em modo desenvolvimento
pnpm run electron:dev
```

## Distribuição

Para distribuir o instalador:

1. Gere o arquivo `.exe`
2. Hospede em um servidor de downloads
3. Crie um link de download para os usuários

Exemplo de link:
```
https://seu-dominio.com/downloads/Gym-CRM-Setup-1.0.0.exe
```

## Suporte

Para problemas ou dúvidas, consulte:
- [Documentação Electron](https://www.electronjs.org/docs)
- [Documentação better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Electron Builder](https://www.electron.build/)
