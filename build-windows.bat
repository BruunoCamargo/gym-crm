@echo off
REM ============================================================
REM Script de Compilação Automática para Windows
REM Gym CRM - Sistema de Gestão para Academia
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  Gym CRM - Compilador para Windows 10/11              ║
echo ║  Este script irá compilar e gerar o instalador .exe   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js não está instalado!
    echo.
    echo Baixe em: https://nodejs.org/
    echo Instale e tente novamente.
    pause
    exit /b 1
)

REM Verificar se pnpm está instalado
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  pnpm não encontrado. Instalando...
    call npm install -g pnpm
)

echo ✓ Node.js encontrado: %NODE_VERSION%
echo.

REM ============================================================
REM PASSO 1: Instalar Dependências
REM ============================================================
echo [1/5] Instalando dependências...
call pnpm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)
echo ✓ Dependências instaladas
echo.

REM ============================================================
REM PASSO 2: Compilar Frontend
REM ============================================================
echo [2/5] Compilando frontend...
call pnpm run build
if %errorlevel% neq 0 (
    echo ❌ Erro ao compilar frontend
    pause
    exit /b 1
)
echo ✓ Frontend compilado
echo.

REM ============================================================
REM PASSO 3: Verificar TypeScript
REM ============================================================
echo [3/5] Verificando TypeScript...
call pnpm check
if %errorlevel% neq 0 (
    echo ❌ Erros de TypeScript encontrados
    pause
    exit /b 1
)
echo ✓ TypeScript OK
echo.

REM ============================================================
REM PASSO 4: Gerar Instalador Electron
REM ============================================================
echo [4/5] Gerando instalador Electron...
call pnpm run electron-build
if %errorlevel% neq 0 (
    echo ❌ Erro ao gerar instalador
    pause
    exit /b 1
)
echo ✓ Instalador gerado
echo.

REM ============================================================
REM PASSO 5: Verificar Arquivo
REM ============================================================
echo [5/5] Verificando arquivo gerado...
if exist "release\Gym CRM Setup*.exe" (
    echo ✓ Instalador criado com sucesso!
    echo.
    echo 📦 Arquivo pronto para download:
    echo    %CD%\release\
    echo.
    echo 🚀 Próximos passos:
    echo    1. Copie o arquivo .exe para um local seguro
    echo    2. Compartilhe com seus usuários
    echo    3. Duplo-clique para instalar no Windows
    echo.
    pause
) else (
    echo ❌ Arquivo .exe não encontrado
    echo Verifique se a compilação foi bem-sucedida
    pause
    exit /b 1
)

echo ✓ Compilação concluída com sucesso!
pause
