# Gym CRM - Build para Windows (Passo a Passo)

## ⚠️ Importante

Este guia é para **desenvolvedores** que desejam compilar o Gym CRM para Windows. Se você apenas quer **usar** o aplicativo, baixe o instalador pronto em [link do download].

---

## 📋 Pré-requisitos

Você precisa ter instalado:

### 1. Node.js 18+
- Baixe em: https://nodejs.org/
- Escolha a versão **LTS** (Long Term Support)
- Durante a instalação, marque "Add to PATH"
- Verifique: `node --version` e `npm --version`

### 2. Python 3.x
- Baixe em: https://www.python.org/
- **IMPORTANTE:** Marque "Add Python to PATH" durante a instalação
- Verifique: `python --version`

### 3. Visual Studio Build Tools
- Baixe em: https://visualstudio.microsoft.com/downloads/
- Procure por "Build Tools for Visual Studio 2022"
- Clique em "Download"
- Execute o instalador
- Selecione: "Desktop development with C++"
- Clique em "Install"
- **Aguarde a instalação completar (pode levar 30 minutos)**

### 4. Git
- Baixe em: https://git-scm.com/
- Execute o instalador com as opções padrão
- Verifique: `git --version`

---

## 🚀 Passos de Build

### Passo 1: Clonar o Repositório

Abra o **PowerShell** ou **Command Prompt** como **Administrador**:

```powershell
# Navegar para uma pasta de trabalho
cd C:\Users\[Seu Usuário]\Desktop

# Clonar o repositório
git clone https://github.com/BruunoCamargo/gym-crm.git
cd gym-crm
```

### Passo 2: Instalar Dependências

```powershell
# Instalar pnpm globalmente
npm install -g pnpm

# Instalar dependências do projeto
pnpm install

# Instalar better-sqlite3
pnpm add better-sqlite3 --save

# Instalar tipos do better-sqlite3
pnpm add -D @types/better-sqlite3
```

**Tempo esperado:** 5-10 minutos

### Passo 3: Compilar o Frontend

```powershell
# Compilar o React/Vite
pnpm run build
```

**Esperado:**
```
✓ 2410 modules transformed.
✓ built in 5.32s
```

### Passo 4: Preparar o Electron

```powershell
# Copiar o main-standalone.ts para dist/electron
mkdir dist\electron -Force
Copy-Item electron\main-standalone.ts -Destination dist\electron\main.ts
```

### Passo 5: Gerar o Instalador Windows

```powershell
# Compilar o Electron e gerar o instalador
pnpm exec electron-builder --win
```

**Tempo esperado:** 5-15 minutos (depende da internet)

**Esperado no final:**
```
✓ Instalador criado com sucesso
```

### Passo 6: Localizar o Instalador

O instalador estará em:
```
C:\Users\[Seu Usuário]\Desktop\gym-crm\dist\installers\
```

Você verá dois arquivos:
- `Gym CRM Setup 1.0.0.exe` — Instalador NSIS (recomendado)
- `Gym CRM 1.0.0.exe` — Versão portável

---

## 🧪 Testando o Build

### Teste 1: Instalar o Aplicativo

1. Clique duas vezes em `Gym CRM Setup 1.0.0.exe`
2. Siga as instruções do instalador
3. Clique em "Finish" quando terminar
4. O aplicativo deve abrir automaticamente

### Teste 2: Verificar Funcionalidades

- ✅ Dashboard carrega com dados de demonstração
- ✅ Pode adicionar novo aluno
- ✅ Pode editar aluno
- ✅ Pode deletar aluno
- ✅ Gráficos aparecem corretamente
- ✅ Funciona sem internet

### Teste 3: Verificar Banco de Dados

1. Abra o Explorador de Arquivos
2. Navegue para: `C:\Users\[Seu Usuário]\AppData\Roaming\Gym CRM`
3. Você deve ver o arquivo `gym-crm.db`
4. Este é o banco de dados SQLite local

---

## 🔧 Troubleshooting

### Erro: "Python not found"

```powershell
# Verifique se Python está instalado
python --version

# Se não funcionar, reinstale Python com "Add to PATH" marcado
```

### Erro: "Visual Studio Build Tools not found"

```powershell
# Verifique a instalação do Visual Studio Build Tools
# Vá em: Painel de Controle > Programas > Programas e Recursos
# Procure por "Visual Studio Build Tools"
# Se não encontrar, reinstale
```

### Erro: "better-sqlite3 compilation failed"

```powershell
# Limpe o cache e tente novamente
pnpm store prune
pnpm add better-sqlite3 --save --force
```

### Erro: "electron-builder not found"

```powershell
# Reinstale as dependências
pnpm install
pnpm exec electron-builder --version
```

### Erro: "Arquivo index.html não encontrado"

```powershell
# Verifique se o build foi bem-sucedido
ls dist\public\index.html

# Se não existir, execute novamente
pnpm run build
```

---

## 📦 Distribuindo o Instalador

Depois de gerar o `.exe`, você pode:

1. **Hospedar em um servidor de downloads**
   ```
   https://seu-dominio.com/downloads/Gym-CRM-Setup-1.0.0.exe
   ```

2. **Compartilhar via Google Drive/Dropbox**
   - Upload do arquivo
   - Gerar link de compartilhamento

3. **Criar um site de download**
   - Adicione um botão "Download"
   - Direcione para o arquivo `.exe`

---

## 🔄 Atualizando o Build

Se fizer mudanças no código:

```powershell
# 1. Faça as alterações
# 2. Commit no Git
git add .
git commit -m "Sua mensagem"

# 3. Aumente a versão em package.json
# Mude "version": "1.0.0" para "1.0.1"

# 4. Gere novo build
pnpm run build
mkdir dist\electron -Force
Copy-Item electron\main-standalone.ts -Destination dist\electron\main.ts
pnpm exec electron-builder --win
```

---

## 📊 Tamanho do Instalador

Esperado:
- Instalador NSIS: ~150-200 MB
- Versão portável: ~150-200 MB

**Nota:** O tamanho é grande porque inclui o Chromium (navegador do Electron)

---

## ✅ Checklist Final

Antes de distribuir:

- [ ] Testou a instalação em Windows 10
- [ ] Testou a instalação em Windows 11
- [ ] Dashboard carrega corretamente
- [ ] Pode adicionar alunos
- [ ] Pode editar alunos
- [ ] Pode deletar alunos
- [ ] Gráficos aparecem
- [ ] Banco de dados é criado em AppData
- [ ] Funciona sem internet
- [ ] Sem erros no console (F12)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os pré-requisitos novamente
2. Consulte o arquivo `WINDOWS_BUILD.md`
3. Verifique os logs em: `dist/installers/builder-effective-config.yaml`
4. Abra uma issue no GitHub

---

**Bom build! 🚀**
