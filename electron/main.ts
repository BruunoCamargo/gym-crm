/**
 * =============================================================
 * ARQUIVO: electron/main.ts
 * DESCRIÇÃO: Arquivo principal do Electron.
 *
 * O Electron permite criar aplicativos desktop usando
 * tecnologias web (HTML, CSS, JavaScript).
 *
 * Este arquivo gerencia:
 * - Criação da janela do aplicativo
 * - Ciclo de vida do app (inicialização, fechamento)
 * - Comunicação entre processos (IPC)
 * - Menu e atalhos do sistema
 * =============================================================
 */

import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import isDev from "electron-is-dev";

// Referência global da janela principal
let mainWindow: BrowserWindow | null = null;

/**
 * Cria a janela principal do aplicativo.
 * Define tamanho, ícone, e carrega a URL da aplicação.
 */
function createWindow() {
  // Cria uma nova janela do navegador
  mainWindow = new BrowserWindow({
    width: 1400, // Largura inicial em pixels
    height: 900, // Altura inicial em pixels
    minWidth: 800, // Largura mínima permitida
    minHeight: 600, // Altura mínima permitida
    webPreferences: {
      // Segurança: desabilita node integration
      nodeIntegration: false,
      // Segurança: ativa context isolation
      contextIsolation: true,
      // Permite comunicação segura via preload script
      preload: path.join(__dirname, "preload.js"),
    },
    // Ícone do aplicativo (será criado depois)
    icon: path.join(__dirname, "../assets/icon.png") || undefined,
  });

  // URL da aplicação
  // Em desenvolvimento: localhost:5173 (servidor Vite)
  // Em produção: arquivo local (dist/index.html)
  const startUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "../dist/public/index.html")}`;

  // Carrega a URL na janela
  mainWindow.loadURL(startUrl);

  // Abre DevTools em desenvolvimento (comentar em produção)
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Evento: quando a janela é fechada
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/**
 * Evento: quando o Electron terminou de inicializar.
 * Cria a janela principal neste momento.
 */
app.on("ready", createWindow);

/**
 * Evento: quando todas as janelas são fechadas.
 * Em macOS, aplicativos geralmente permanecem ativos até o usuário
 * fechar explicitamente com Cmd+Q. No Windows, fechamos o app.
 */
app.on("window-all-closed", () => {
  // No macOS, manter o app ativo
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Evento: quando o app é ativado novamente (macOS).
 * Se não há janelas abertas, cria uma nova.
 */
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Menu da aplicação.
 * Define os menus do topo (Arquivo, Editar, etc.)
 */
function createMenu() {
  const template: any[] = [
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Sair",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Editar",
      submenu: [
        { label: "Desfazer", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Refazer", accelerator: "CmdOrCtrl+Y", role: "redo" },
        { type: "separator" },
        { label: "Cortar", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copiar", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Colar", accelerator: "CmdOrCtrl+V", role: "paste" },
      ],
    },
    {
      label: "Exibir",
      submenu: [
        { label: "Recarregar", accelerator: "CmdOrCtrl+R", role: "reload" },
        {
          label: "Ferramentas do Desenvolvedor",
          accelerator: "CmdOrCtrl+Shift+I",
          role: "toggleDevTools",
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Cria o menu quando o app está pronto
app.on("ready", createMenu);

/**
 * Handlers IPC (Inter-Process Communication).
 * Permite que o frontend (React) comunique com o backend (Electron).
 */

/**
 * IPC: obter informações do aplicativo.
 * Usado para exibir versão, nome, etc. no frontend.
 */
ipcMain.handle("app:getInfo", async () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    isDev: isDev,
  };
});

/**
 * IPC: minimizar a janela.
 * Chamado quando o usuário clica no botão minimizar.
 */
ipcMain.handle("window:minimize", async () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

/**
 * IPC: maximizar/restaurar a janela.
 * Alterna entre maximizado e tamanho normal.
 */
ipcMain.handle("window:toggleMaximize", async () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

/**
 * IPC: fechar a janela.
 * Chamado quando o usuário clica no botão fechar.
 */
ipcMain.handle("window:close", async () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
