/**
 * =============================================================
 * ARQUIVO: client/src/App.tsx
 * DESCRIÇÃO: Componente raiz da aplicação React.
 *
 * Este arquivo define:
 * 1. O tema da aplicação (dark/light)
 * 2. As rotas — cada URL corresponde a uma página diferente
 * 3. Os providers globais (tema, tooltips, notificações)
 * =============================================================
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Importação das páginas do CRM
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import OverdueStudents from "./pages/OverdueStudents";
import Reports from "./pages/Reports";

/**
 * Componente de roteamento.
 * Define qual componente renderizar para cada URL.
 *
 * Exemplos:
 * - URL "/"          → componente Dashboard
 * - URL "/students"  → componente Students
 * - URL "/overdue"   → componente OverdueStudents
 */
function Router() {
  return (
    <Switch>
      {/* Rota raiz: Dashboard principal */}
      <Route path="/" component={Dashboard} />

      {/* Rota de listagem e gestão de alunos */}
      <Route path="/students" component={Students} />

      {/* Rota de alunos com mensalidades vencidas */}
      <Route path="/overdue" component={OverdueStudents} />

      {/* Rota de relatórios e estatísticas */}
      <Route path="/reports" component={Reports} />

      {/* Rota 404 — exibida quando nenhuma rota acima corresponde */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Componente principal da aplicação.
 * Envolve tudo com os providers necessários:
 * - ErrorBoundary: captura erros e evita tela branca
 * - ThemeProvider: gerencia o tema (dark/light)
 * - TooltipProvider: habilita tooltips nos componentes
 * - Toaster: exibe notificações toast (pop-ups de feedback)
 */
function App() {
  return (
    <ErrorBoundary>
      {/* defaultTheme="dark" — o sistema usa tema escuro por padrão */}
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          {/* Toaster: componente de notificações (posicionado no canto) */}
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
