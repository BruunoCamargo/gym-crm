/**
 * =============================================================
 * ARQUIVO: electron/main-standalone.ts
 * DESCRIÇÃO: Versão corrigida do Electron para funcionar standalone
 * com banco de dados SQLite local, sem dependência de servidor externo.
 *
 * Principais mudanças:
 * - Carrega a versão web compilada (dist/public/index.html)
 * - Suporta banco de dados SQLite local
 * - Funciona completamente offline
 * - Sem necessidade de OAuth externo
 * =============================================================
 */

import { app, Menu, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import isDev from "electron-is-dev";
import Database from "better-sqlite3";

// Referência global da janela principal
let mainWindow: BrowserWindow | null = null;
let db: Database.Database | null = null;

/**
 * Inicializa o banco de dados SQLite local
 */
function initializeDatabase() {
  try {
    const dbPath = path.join(app.getPath("userData"), "gym-crm.db");
    console.log("[Database] Caminho do banco:", dbPath);

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    // Criar tabelas se não existirem
    db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        address TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        planId INTEGER,
        paymentStatus TEXT DEFAULT 'pending',
        startDate TEXT,
        dueDate TEXT,
        isActive INTEGER DEFAULT 1,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT,
        price REAL,
        durationMonths INTEGER
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        planId INTEGER,
        amount REAL,
        paidAt TEXT,
        periodStart TEXT,
        periodEnd TEXT,
        paymentMethod TEXT,
        notes TEXT,
        FOREIGN KEY(studentId) REFERENCES students(id)
      );
    `);

    // Inserir planos padrão se não existirem
    const plansCount = db.prepare("SELECT COUNT(*) as count FROM plans").get() as any;
    if (plansCount.count === 0) {
      const insertPlan = db.prepare(
        "INSERT INTO plans (id, name, type, price, durationMonths) VALUES (?, ?, ?, ?, ?)"
      );
      insertPlan.run(1, "Plano Mensal", "monthly", 89.90, 1);
      insertPlan.run(2, "Plano Trimestral", "quarterly", 239.90, 3);
      insertPlan.run(3, "Plano Semestral", "semiannual", 429.90, 6);
      insertPlan.run(4, "Plano Anual", "annual", 799.90, 12);
      console.log("[Database] Planos padrão inseridos");
    }

    console.log("[Database] ✅ Banco de dados inicializado com sucesso");
    return true;
  } catch (error) {
    console.error("[Database] ❌ Erro ao inicializar banco:", error);
    return false;
  }
}

/**
 * Cria a janela principal do aplicativo
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
    },
    icon: path.join(__dirname, "../assets/icon.png"),
  });

  // Determinar a URL a carregar
  let urlToLoad: string;

  if (isDev) {
    // Desenvolvimento: servidor Vite local
    console.log("[Electron] ⚙️  Modo DESENVOLVIMENTO");
    urlToLoad = "http://localhost:5173";
  } else {
    // Produção: arquivo HTML compilado
    console.log("[Electron] 🏭 Modo PRODUÇÃO (Standalone)");
    const htmlPath = path.join(__dirname, "../public/index.html");
    
    if (fs.existsSync(htmlPath)) {
      console.log("[Electron] ✅ Arquivo encontrado:", htmlPath);
      urlToLoad = `file://${htmlPath}`;
    } else {
      console.error("[Electron] ❌ Arquivo não encontrado:", htmlPath);
      dialog.showErrorBox(
        "Erro",
        "Não foi possível encontrar os arquivos da aplicação. Por favor, reinstale o Gym CRM."
      );
      app.quit();
      return;
    }
  }

  mainWindow.loadURL(urlToLoad);

  // Abrir DevTools em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Log de debug
  console.log("\n========================================");
  console.log("[Electron] DEBUG INFO");
  console.log("========================================");
  console.log("isDev:", isDev);
  console.log("__dirname:", __dirname);
  console.log("URL carregada:", urlToLoad);
  console.log("========================================\n");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("[Electron] ERRO ao carregar página:", errorCode, errorDescription);
    dialog.showErrorBox(
      "Erro de Carregamento",
      `Não foi possível carregar a aplicação: ${errorDescription}`
    );
  });

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("[Electron] ✅ Página carregada com sucesso!");
  });
}

/**
 * Evento: Electron pronto
 */
app.on("ready", () => {
  console.log("[Electron] App pronto, inicializando...");
  
  // Inicializar banco de dados
  if (!initializeDatabase()) {
    dialog.showErrorBox(
      "Erro",
      "Não foi possível inicializar o banco de dados. Por favor, reinstale o Gym CRM."
    );
    app.quit();
    return;
  }

  createWindow();
  createMenu();
});

/**
 * Evento: Todas as janelas fechadas
 */
app.on("window-all-closed", () => {
  console.log("[Electron] Todas as janelas fechadas");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Evento: App ativado (macOS)
 */
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Evento: App vai fechar
 */
app.on("before-quit", () => {
  if (db) {
    db.close();
    console.log("[Database] Conexão fechada");
  }
});

/**
 * Menu da aplicação
 */
function createMenu() {
  const template: any[] = [
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Sair",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit(),
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
        isDev && {
          label: "Ferramentas do Desenvolvedor",
          accelerator: "CmdOrCtrl+Shift+I",
          role: "toggleDevTools",
        },
      ].filter(Boolean),
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Sobre Gym CRM",
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: "info",
              title: "Sobre Gym CRM",
              message: "Gym CRM - Sistema de Gestão para Academia",
              detail: `Versão: ${app.getVersion()}\nPlataforma: ${process.platform}`,
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * IPC Handlers
 */

ipcMain.handle("app:getInfo", async () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    isDev: isDev,
    isStandalone: true,
  };
});

ipcMain.handle("window:minimize", async () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle("window:toggleMaximize", async () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("window:close", async () => {
  if (mainWindow) mainWindow.close();
});

/**
 * Database IPC Handlers
 */

ipcMain.handle("db:query", async (event, sql: string, params: any[] = []) => {
  try {
    if (!db) throw new Error("Database not initialized");
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error("[Database] Erro na query:", error);
    throw error;
  }
});

ipcMain.handle("db:run", async (event, sql: string, params: any[] = []) => {
  try {
    if (!db) throw new Error("Database not initialized");
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  } catch (error) {
    console.error("[Database] Erro ao executar:", error);
    throw error;
  }
});

ipcMain.handle("db:exec", async (event, sql: string) => {
  try {
    if (!db) throw new Error("Database not initialized");
    db.exec(sql);
    return true;
  } catch (error) {
    console.error("[Database] Erro ao executar SQL:", error);
    throw error;
  }
});
