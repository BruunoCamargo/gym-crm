#!/bin/bash

# Script para compilar o Electron standalone para Windows
# Uso: bash build-electron-standalone.sh

set -e

echo "🏗️  Compilando Gym CRM Electron Standalone..."

# 1. Compilar o frontend
echo "📦 Compilando frontend..."
pnpm run build

# 2. Compilar o TypeScript do Electron
echo "⚙️  Compilando TypeScript do Electron..."
pnpm exec tsc -p tsconfig.electron.json

# 3. Copiar o main-standalone.ts para main.ts (ou criar um symlink)
echo "🔗 Preparando arquivo principal..."
cp electron/main-standalone.ts dist/electron/main.ts

# 4. Fazer build do instalador Windows
echo "🪟 Gerando instalador Windows..."
pnpm exec electron-builder --win

echo "✅ Build concluído!"
echo "📁 Instalador disponível em: dist/installers/"
