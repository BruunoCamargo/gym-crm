# ============================================================
# Script de Compilação Automática para Windows (PowerShell)
# Gym CRM - Sistema de Gestão para Academia
# ============================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Gym CRM - Compilador para Windows 10/11              ║" -ForegroundColor Cyan
Write-Host "║  Este script irá compilar e gerar o instalador .exe   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Node.js não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Instale e tente novamente."
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se pnpm está instalado
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm encontrado: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  pnpm não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g pnpm
}

Write-Host ""

# ============================================================
# PASSO 1: Instalar Dependências
# ============================================================
Write-Host "[1/5] Instalando dependências..." -ForegroundColor Cyan
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✓ Dependências instaladas" -ForegroundColor Green
Write-Host ""

# ============================================================
# PASSO 2: Compilar Frontend
# ============================================================
Write-Host "[2/5] Compilando frontend..." -ForegroundColor Cyan
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar frontend" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✓ Frontend compilado" -ForegroundColor Green
Write-Host ""

# ============================================================
# PASSO 3: Verificar TypeScript
# ============================================================
Write-Host "[3/5] Verificando TypeScript..." -ForegroundColor Cyan
pnpm check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erros de TypeScript encontrados" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✓ TypeScript OK" -ForegroundColor Green
Write-Host ""

# ============================================================
# PASSO 4: Gerar Instalador Electron
# ============================================================
Write-Host "[4/5] Gerando instalador Electron..." -ForegroundColor Cyan
pnpm run electron-build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar instalador" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✓ Instalador gerado" -ForegroundColor Green
Write-Host ""

# ============================================================
# PASSO 5: Verificar Arquivo
# ============================================================
Write-Host "[5/5] Verificando arquivo gerado..." -ForegroundColor Cyan
$exeFile = Get-ChildItem -Path "release" -Filter "Gym CRM Setup*.exe" -ErrorAction SilentlyContinue

if ($exeFile) {
    Write-Host "✓ Instalador criado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Arquivo pronto para download:" -ForegroundColor Yellow
    Write-Host "   $($exeFile.FullName)" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Copie o arquivo .exe para um local seguro" -ForegroundColor White
    Write-Host "   2. Compartilhe com seus usuários" -ForegroundColor White
    Write-Host "   3. Duplo-clique para instalar no Windows" -ForegroundColor White
    Write-Host ""
    
    # Perguntar se quer abrir a pasta
    $response = Read-Host "Deseja abrir a pasta do instalador? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        Invoke-Item "release"
    }
} else {
    Write-Host "❌ Arquivo .exe não encontrado" -ForegroundColor Red
    Write-Host "Verifique se a compilação foi bem-sucedida" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "✓ Compilação concluída com sucesso!" -ForegroundColor Green
Read-Host "Pressione Enter para sair"
