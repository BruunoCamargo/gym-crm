/**
 * =============================================================
 * ARQUIVO: electron-builder.config.js
 * DESCRIÇÃO: Configuração do Electron Builder.
 *
 * O Electron Builder é a ferramenta que compila a aplicação
 * Electron em um instalador executável para Windows.
 *
 * Este arquivo define:
 * - Informações do aplicativo (nome, versão, ícone)
 * - Configurações de build para Windows
 * - Tipo de instalador (NSIS = instalador tradicional)
 * =============================================================
 */

module.exports = {
  // ID único do aplicativo
  appId: "com.gymcrm.app",

  // Nome do produto exibido no instalador
  productName: "Gym CRM",

  // Diretórios de entrada e saída
  directories: {
    // Pasta onde o Electron Builder procura pelos arquivos compilados
    buildResources: "assets",
    // Pasta de saída dos instaladores
    output: "dist/installers",
  },

  // Arquivos a incluir no build
  files: [
    // Código compilado do frontend (React)
    "dist/public/**/*",
    // Código do Electron (main.ts compilado)
    "electron/**/*",
    // Node modules necessários
    "node_modules/**/*",
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURAÇÃO PARA WINDOWS
  // ─────────────────────────────────────────────────────────────
  win: {
    // Tipos de instaladores a gerar
    target: [
      // NSIS: instalador tradicional do Windows (recomendado)
      {
        target: "nsis",
        arch: ["x64"], // Apenas 64-bit
      },
      // Portable: executável único sem instalação
      {
        target: "portable",
        arch: ["x64"],
      },
    ],
    // Caminho do ícone do aplicativo
    icon: "assets/icon.png",
    // Certificado de assinatura (opcional)
    certificateFile: null,
    certificatePassword: null,
  },

  // ─────────────────────────────────────────────────────────────
  // CONFIGURAÇÃO DO INSTALADOR NSIS
  // ─────────────────────────────────────────────────────────────
  nsis: {
    // Se false, mostra diálogo de seleção de pasta
    oneClick: false,

    // Permite ao usuário escolher a pasta de instalação
    allowToChangeInstallationDirectory: true,

    // Cria atalho na área de trabalho
    createDesktopShortcut: true,

    // Cria atalho no menu Iniciar
    createStartMenuShortcut: true,

    // Nome do atalho no menu Iniciar
    shortcutName: "Gym CRM",

    // Instalador de 64-bit
    installerIcon: "assets/icon.png",
    uninstallerIcon: "assets/icon.png",

    // Página de boas-vindas do instalador
    installerHeader: "assets/icon.png",
    installerSidebar: "assets/icon.png",
  },

  // ─────────────────────────────────────────────────────────────
  // CONFIGURAÇÃO GERAL
  // ─────────────────────────────────────────────────────────────

  // Publica atualizações automaticamente (opcional)
  publish: null,

  // Não criar arquivo de atualização automática
  generateUpdatesFilesForAllChannels: false,
};
