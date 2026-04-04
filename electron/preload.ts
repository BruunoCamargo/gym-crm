/**
 * =============================================================
 * ARQUIVO: electron/preload.ts
 * DESCRIÇÃO: Script de preload do Electron.
 *
 * O preload é um script que roda ANTES do conteúdo da página.
 * Ele permite comunicação segura entre o frontend (React) e
 * o backend (Electron) via IPC (Inter-Process Communication).
 *
 * Por segurança, o frontend não pode acessar diretamente o
 * Electron. Este script atua como intermediário.
 * =============================================================
 */

import { contextBridge, ipcRenderer } from "electron";

/**
 * Expõe APIs seguras para o frontend.
 * O frontend acessa via window.electronAPI
 *
 * Exemplo no React:
 * const info = await window.electronAPI.getAppInfo();
 */
contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * Obtém informações do aplicativo.
   * @returns {Promise} Objeto com name, version, platform, isDev
   */
  getAppInfo: () => ipcRenderer.invoke("app:getInfo"),

  /**
   * Minimiza a janela.
   */
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),

  /**
   * Alterna entre maximizado e tamanho normal.
   */
  toggleMaximizeWindow: () => ipcRenderer.invoke("window:toggleMaximize"),

  /**
   * Fecha a janela (e o aplicativo).
   */
  closeWindow: () => ipcRenderer.invoke("window:close"),

  /**
   * Listener para eventos do Electron.
   * Permite que o frontend escute eventos do processo principal.
   *
   * Exemplo:
   * window.electronAPI.on("app-update-available", (version) => {
   *   console.log("Nova versão disponível:", version);
   * });
   */
  on: (channel: string, func: (...args: any[]) => void) => {
    // Lista de canais permitidos (whitelist de segurança)
    const validChannels = ["app-update-available", "app-update-downloaded"];

    if (validChannels.includes(channel)) {
      // Registra o listener
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  /**
   * Remove um listener de evento.
   */
  off: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ["app-update-available", "app-update-downloaded"];

    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  },
});

/**
 * Tipagem TypeScript para window.electronAPI
 * Permite autocompletar no editor de código.
 */
declare global {
  interface Window {
    electronAPI: {
      getAppInfo: () => Promise<{
        name: string;
        version: string;
        platform: string;
        isDev: boolean;
      }>;
      minimizeWindow: () => Promise<void>;
      toggleMaximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      on: (channel: string, func: (...args: any[]) => void) => void;
      off: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

export {};
