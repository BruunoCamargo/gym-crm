// Configuração do Electron Builder para Windows

module.exports = {
  appId: "com.gymcrm.app",
  productName: "Gym CRM",
  main: "dist/electron/main.js",
  directories: { output: "dist/installers" },
  files: ["dist/electron/**/*", "node_modules/**/*"],
  win: {
    target: [{ target: "nsis", arch: ["x64"] }, { target: "portable", arch: ["x64"] }],
    icon: "assets/icon.png",
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Gym CRM",
    installerIcon: "assets/icon.png",
    uninstallerIcon: "assets/icon.png",
  },
  publish: null,
  generateUpdatesFilesForAllChannels: false,
};
