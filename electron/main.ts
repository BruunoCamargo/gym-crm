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
 * - Menu e atalhos do sistema
 * =============================================================
 */

import { app, Menu, BrowserWindow } from "electron";
import path from "path";
import isDev from "electron-is-dev";

// Referência global da janela principal
let mainWindow: BrowserWindow | null = null;

/**
 * FUNÇÃO: createWindow()
 * DESCRIÇÃO: Cria a janela principal do aplicativo Electron.
 *
 * Esta função:
 * 1. Cria uma nova janela com dimensões 1200x800
 * 2. Carrega a URL da aplicação (online ou local)
 * 3. Configura eventos de ciclo de vida
 * 4. Abre o DevTools em desenvolvimento
 */
function createWindow() {
  // Cria a janela principal do Electron
  // Parâmetros:
  // - width: 1200 (largura em pixels)
  // - height: 800 (altura em pixels)
  // - webPreferences: configurações de segurança e funcionalidades
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../assets/icon.png"),
    webPreferences: {
      // preload: caminho para arquivo que roda antes do app carregar
      // Comentado porque estamos usando apenas servidor online
      // preload: path.join(__dirname, "preload.js"),

      // nodeIntegration: false (segurança - não permite acesso a Node.js no renderer)
      nodeIntegration: false,

      // contextIsolation: true (segurança - isola contexto do Node)
      contextIsolation: true,

      // enableRemoteModule: false (segurança - desabilita remote module)
      enableRemoteModule: false,
    },
  });

  // ===== CARREGAMENTO DA APLICAÇÃO =====
  // Estratégia: SEMPRE conectar ao servidor online
  // Razão: Mais seguro, mais confiável, sem problemas de permissões de arquivo

  if (isDev) {
    // DESENVOLVIMENTO: Conecta ao servidor Vite local (localhost:5173)
    console.log("[Electron] ⚙️  Modo DESENVOLVIMENTO");
    console.log("[Electron] Carregando: http://localhost:5173");
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // PRODUÇÃO: Conecta ao servidor online (Manus)
    console.log("[Electron] 🏭 Modo PRODUÇÃO");
    console.log("[Electron] Carregando: https://gymcrm-nbedknkp.manus.space");
    mainWindow.loadURL("https://gymcrm-nbedknkp.manus.space");
  }

  // ===== DEVTOOLS =====
  // Em desenvolvimento: abre o DevTools automaticamente para debug
  if (isDev) {
    mainWindow.webContents.openDevTools();
    console.log("[Electron] DevTools aberto (desenvolvimento)");
  }

  // ===== EVENTOS DA JANELA =====

  // Evento: quando a janela é fechada
  mainWindow.on("closed", () => {
    console.log("[Electron] Janela fechada");
    mainWindow = null;
  });

  // Evento: quando há erro de carregamento
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("[Electron] ❌ Erro ao carregar página:");
    console.error("  Código:", errorCode);
    console.error("  Descrição:", errorDescription);
  });

  // Evento: quando a página carrega com sucesso
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("[Electron] ✅ Página carregada com sucesso!");
    if (mainWindow) {
      console.log("[Electron] URL atual:", mainWindow.webContents.getURL());
    }
  });

  // Evento: erros de console no renderer
  mainWindow.webContents.on("console-message", (level, message, line, sourceId) => {
    console.log(`[Renderer] [${level}] ${message}`);
  });

  // Evento: antes de navegar
  mainWindow.webContents.on("will-navigate", (event, url) => {
    console.log("[Electron] Navegando para:", url);
  });
}

/**
 * EVENTO: app.on('ready')
 * DESCRIÇÃO: Dispara quando o Electron terminou de inicializar.
 *
 * Aqui criamos a janela principal e configuramos o menu.
 */
app.on("ready", () => {
  console.log("[Electron] Aplicação iniciada");
  createWindow();
  createMenu();
});

/**
 * EVENTO: app.on('window-all-closed')
 * DESCRIÇÃO: Dispara quando todas as janelas são fechadas.
 *
 * Em macOS: aplicação continua rodando
 * Em Windows/Linux: aplicação fecha
 */
app.on("window-all-closed", () => {
  console.log("[Electron] Todas as janelas fechadas");
  // Em macOS, aplicações geralmente continuam ativas até o usuário sair explicitamente
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * EVENTO: app.on('activate')
 * DESCRIÇÃO: Dispara quando o usuário clica no ícone do app (macOS).
 *
 * Recriar a janela se ela foi fechada.
 */
app.on("activate", () => {
  console.log("[Electron] Aplicação ativada");
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * FUNÇÃO: createMenu()
 * DESCRIÇÃO: Cria o menu do aplicativo (File, Edit, etc).
 *
 * Define as opções disponíveis no menu da aplicação.
 */
function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
