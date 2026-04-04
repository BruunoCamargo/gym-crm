/**
 * =============================================================
 * ARQUIVO: client/src/components/DashboardLayout.tsx
 * DESCRIÇÃO: Layout principal do painel administrativo do Gym CRM.
 *
 * Este componente é o "esqueleto" de todas as páginas internas.
 * Ele fornece:
 * - Sidebar (barra lateral) com navegação
 * - Cabeçalho com informações do usuário logado
 * - Área principal onde o conteúdo de cada página é renderizado
 * - Proteção de rota: redireciona para login se não autenticado
 * =============================================================
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  AlertTriangle,
  BarChart3,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Users,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

/**
 * Itens do menu de navegação da sidebar.
 * Cada item tem:
 * - icon: ícone do Lucide React
 * - label: texto exibido no menu
 * - path: rota para navegar ao clicar
 */
const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Users,
    label: "Alunos",
    path: "/students",
  },
  {
    icon: AlertTriangle,
    label: "Vencimentos",
    path: "/overdue",
  },
  {
    icon: BarChart3,
    label: "Relatórios",
    path: "/reports",
  },
];

// Constantes para o redimensionamento da sidebar
const SIDEBAR_WIDTH_KEY = "gym-crm-sidebar-width"; // Chave no localStorage
const DEFAULT_WIDTH = 260; // Largura padrão em pixels
const MIN_WIDTH = 200; // Largura mínima
const MAX_WIDTH = 400; // Largura máxima

/**
 * Componente principal do layout.
 * Verifica autenticação e renderiza o layout ou a tela de login.
 *
 * @param children - Conteúdo da página atual (passado via props)
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Recupera a largura salva da sidebar (ou usa o padrão)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });

  // Hook de autenticação — fornece dados do usuário e estado de loading
  const { loading, user } = useAuth();

  // Salva a largura da sidebar no localStorage quando ela muda
  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // Enquanto verifica a autenticação, mostra um skeleton (tela de carregamento)
  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  // Se não há usuário logado, mostra a tela de login
  if (!user) {
    return <LoginScreen />;
  }

  // Se está autenticado, renderiza o layout completo
  return (
    <SidebarProvider
      style={
        {
          // Define a largura da sidebar via variável CSS
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

/**
 * Tela de login exibida quando o usuário não está autenticado.
 * Apresenta o branding do Gym CRM e botão para iniciar o OAuth.
 */
function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Padrão de fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {/* Logo e título */}
          <div className="flex flex-col items-center gap-6 mb-8">
            {/* Logo da academia — imagem gerada por IA */}
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512937086/NbedKNkptWhgXcAge2qCTA/gym-crm-logo-ZszfavYK75QNGqBnDYi5fv.webp"
              alt="Gym CRM Logo"
              className="w-20 h-20 rounded-2xl object-cover border border-primary/20 shadow-lg shadow-primary/10"
            />

            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground font-display">
                Gym CRM
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de Gestão para Academia
              </p>
            </div>
          </div>

          {/* Mensagem de boas-vindas */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Acesso Administrativo
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Faça login com sua conta Manus para acessar o painel de
              administração da academia.
            </p>
          </div>

          {/* Botão de login */}
          <Button
            onClick={() => {
              // Redireciona para a URL de login OAuth do Manus
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2 rotate-180" />
            Entrar com Manus
          </Button>

          {/* Nota de segurança */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Acesso exclusivo para administradores autorizados
          </p>
        </div>
      </div>
    </div>
  );
}

// Tipos das props do componente interno
type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

/**
 * Componente interno que renderiza o layout com sidebar.
 * Separado do componente principal para poder usar o hook useSidebar()
 * (que precisa estar dentro do SidebarProvider).
 */
function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  // Dados do usuário logado e função de logout
  const { user, logout } = useAuth();

  // Hook de roteamento — location = rota atual, setLocation = navegar
  const [location, setLocation] = useLocation();

  // Estado da sidebar (expandida ou recolhida)
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Estado de redimensionamento da sidebar
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Verifica se é dispositivo móvel
  const isMobile = useIsMobile();

  // Encontra o item de menu ativo com base na rota atual
  const activeMenuItem = menuItems.find((item) => item.path === location);

  // Para o redimensionamento quando a sidebar é recolhida
  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  // Lógica de redimensionamento da sidebar com mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft =
        sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      // Limita a largura entre MIN e MAX
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    // Cleanup: remove os listeners quando não está mais redimensionando
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  // Gera as iniciais do nome do usuário para o avatar
  const userInitials =
    user?.name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  return (
    <>
      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          {/* Cabeçalho da sidebar com logo */}
          <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
            <div className="flex items-center gap-3 px-2 w-full">
              {/* Botão para expandir/recolher a sidebar */}
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Alternar navegação"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Logo e nome — visível apenas quando expandida */}
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  {/* Logo da academia — imagem gerada por IA */}
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512937086/NbedKNkptWhgXcAge2qCTA/gym-crm-logo-ZszfavYK75QNGqBnDYi5fv.webp"
                    alt="Gym CRM Logo"
                    className="w-7 h-7 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-sm tracking-tight text-foreground font-display truncate block">
                      Gym CRM
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      Painel Admin
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SidebarHeader>

          {/* Itens de navegação */}
          <SidebarContent className="gap-0 pt-2">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map((item) => {
                // Verifica se este item é a rota atual
                const isActive = location === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`
                        h-10 transition-all font-normal rounded-lg
                        ${isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-sidebar-accent text-sidebar-foreground"
                        }
                      `}
                    >
                      {/* Ícone do item de menu */}
                      <item.icon
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* Rodapé da sidebar com informações do usuário */}
          <SidebarFooter className="p-3 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent/50 transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {/* Avatar com iniciais do usuário */}
                  <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Nome e e-mail — visível apenas quando expandida */}
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-none text-foreground">
                        {user?.name || "Administrador"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {user?.email || "admin"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>

              {/* Menu dropdown do usuário */}
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Alça de redimensionamento da sidebar */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (!isCollapsed) setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      {/* ── ÁREA PRINCIPAL ──────────────────────────────────── */}
      <SidebarInset>
        {/* Cabeçalho mobile */}
        {isMobile && (
          <div className="flex border-b border-border h-14 items-center justify-between bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg" />
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm font-display">
                  {activeMenuItem?.label ?? "Gym CRM"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da página atual */}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
