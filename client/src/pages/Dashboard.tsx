/**
 * =============================================================
 * ARQUIVO: client/src/pages/Dashboard.tsx
 * DESCRIÇÃO: Página principal do painel administrativo.
 *
 * Exibe:
 * - Cards com estatísticas gerais (total de alunos, pagamentos, etc.)
 * - Alertas de mensalidades vencidas e próximas do vencimento
 * - Gráfico de distribuição de alunos por plano
 * - Lista dos alunos com vencimento mais próximo
 * =============================================================
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Dumbbell,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/**
 * Cores para o gráfico de pizza dos planos.
 * Cada índice corresponde a um tipo de plano.
 */
const CHART_COLORS = [
  "#F59E0B", // Âmbar — Mensal
  "#22C55E", // Verde — Trimestral
  "#3B82F6", // Azul — Semestral
  "#A855F7", // Roxo — Anual
];

/**
 * Componente principal da página Dashboard.
 * Busca os dados do servidor e renderiza as estatísticas.
 */
export default function Dashboard() {
  // Hook de navegação para redirecionar para outras páginas
  const [, setLocation] = useLocation();

  // Busca as estatísticas do dashboard via tRPC
  // isLoading = true enquanto aguarda a resposta do servidor
  const { data: stats, isLoading: statsLoading } =
    trpc.dashboard.stats.useQuery();

  // Busca a distribuição de alunos por plano para o gráfico
  const { data: planData, isLoading: planLoading } =
    trpc.dashboard.studentsByPlan.useQuery();

  // Busca alunos com vencimento próximo (para alertas)
  const { data: students } = trpc.students.list.useQuery({
    isActive: true,
  });

  // Filtra alunos com vencimento nos próximos 7 dias
  const expiringStudents = students?.filter((s) => {
    const dueDate = new Date(s.dueDate);
    const now = new Date();
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    return (
      dueDate >= now &&
      dueDate <= sevenDays &&
      s.paymentStatus !== "paid"
    );
  }).slice(0, 5); // Mostra apenas os 5 primeiros

  // Filtra alunos com mensalidade vencida
  const overdueStudents = students
    ?.filter((s) => s.paymentStatus === "overdue")
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── CABEÇALHO DA PÁGINA ──────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visão geral da academia
            </p>
          </div>

          {/* Botão para adicionar novo aluno */}
          <Button
            onClick={() => setLocation("/students")}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Gerenciar Alunos
          </Button>
        </div>

        {/* ── CARDS DE ESTATÍSTICAS ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Total de Alunos */}
          <StatCard
            title="Total de Alunos"
            value={stats?.totalStudents ?? 0}
            icon={Users}
            iconColor="text-blue-400"
            iconBg="bg-blue-400/10"
            loading={statsLoading}
          />

          {/* Card: Alunos Ativos */}
          <StatCard
            title="Alunos Ativos"
            value={stats?.activeStudents ?? 0}
            icon={UserCheck}
            iconColor="text-green-400"
            iconBg="bg-green-400/10"
            loading={statsLoading}
          />

          {/* Card: Mensalidades Pagas */}
          <StatCard
            title="Mensalidades Pagas"
            value={stats?.paidStudents ?? 0}
            icon={CheckCircle2}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-400/10"
            loading={statsLoading}
          />

          {/* Card: Mensalidades Vencidas — com destaque vermelho */}
          <StatCard
            title="Mensalidades Vencidas"
            value={stats?.overdueStudents ?? 0}
            icon={XCircle}
            iconColor="text-red-400"
            iconBg="bg-red-400/10"
            loading={statsLoading}
            highlight={stats?.overdueStudents ? stats.overdueStudents > 0 : false}
          />
        </div>

        {/* ── SEGUNDA LINHA: ALERTAS E GRÁFICO ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── ALERTAS DE VENCIMENTO ─────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Alunos com vencimento próximo */}
            {expiringStudents && expiringStudents.length > 0 && (
              <AlertCard
                title="Vencimentos nos Próximos 7 Dias"
                icon={Clock}
                iconColor="text-amber-400"
                borderColor="border-amber-500/30"
                bgColor="bg-amber-500/5"
              >
                {expiringStudents.map((student) => (
                  <StudentAlertRow
                    key={student.id}
                    student={student}
                    onView={() => setLocation("/students")}
                    variant="warning"
                  />
                ))}
              </AlertCard>
            )}

            {/* Alunos com mensalidade vencida */}
            {overdueStudents && overdueStudents.length > 0 && (
              <AlertCard
                title="Mensalidades Vencidas"
                icon={AlertTriangle}
                iconColor="text-red-400"
                borderColor="border-red-500/30"
                bgColor="bg-red-500/5"
              >
                {overdueStudents.map((student) => (
                  <StudentAlertRow
                    key={student.id}
                    student={student}
                    onView={() => setLocation("/students")}
                    variant="danger"
                  />
                ))}
              </AlertCard>
            )}

            {/* Mensagem quando não há alertas */}
            {(!expiringStudents || expiringStudents.length === 0) &&
              (!overdueStudents || overdueStudents.length === 0) && (
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="flex items-center gap-3 py-6">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-green-400">
                        Tudo em dia!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Não há mensalidades vencidas ou próximas do vencimento.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* ── GRÁFICO DE DISTRIBUIÇÃO POR PLANO ─────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Alunos por Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              {planLoading ? (
                // Skeleton do gráfico enquanto carrega
                <div className="h-48 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
                </div>
              ) : planData && planData.length > 0 ? (
                <>
                  {/* Gráfico de pizza com Recharts */}
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={planData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="count"
                        nameKey="planName"
                      >
                        {planData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.18 0.025 240)",
                          border: "1px solid oklch(0.28 0.02 240)",
                          borderRadius: "8px",
                          color: "oklch(0.97 0.005 240)",
                        }}
                        formatter={(value, name) => [
                          `${value} aluno(s)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legenda do gráfico */}
                  <div className="space-y-2 mt-2">
                    {planData.map((plan, index) => (
                      <div
                        key={plan.planType}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {/* Bolinha colorida da legenda */}
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          <span className="text-muted-foreground">
                            {plan.planName}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          {Number(plan.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // Estado vazio — sem alunos cadastrados
                <div className="h-48 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Dumbbell className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Nenhum aluno cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RESUMO DE STATUS ─────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Resumo de Mensalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* Pagas */}
              <div className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <p className="text-2xl font-bold text-green-400">
                  {stats?.paidStudents ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Pagas</p>
              </div>

              {/* Pendentes */}
              <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-2xl font-bold text-amber-400">
                  {stats?.pendingStudents ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
              </div>

              {/* Vencidas */}
              <div className="text-center p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <p className="text-2xl font-bold text-red-400">
                  {stats?.overdueStudents ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES
// Componentes menores usados apenas nesta página
// ─────────────────────────────────────────────────────────────

/**
 * Card de estatística reutilizável.
 * Exibe um número com ícone e título.
 */
function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  loading,
  highlight = false,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <Card
      className={`transition-all ${highlight ? "border-red-500/40 bg-red-500/5" : ""}`}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {title}
            </p>
            {loading ? (
              // Skeleton enquanto carrega
              <div className="h-8 w-16 bg-muted rounded animate-pulse mt-1" />
            ) : (
              <p
                className={`text-3xl font-bold mt-1 font-display ${highlight ? "text-red-400" : "text-foreground"}`}
              >
                {value}
              </p>
            )}
          </div>
          {/* Ícone do card */}
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Card de alerta com lista de alunos.
 */
function AlertCard({
  title,
  icon: Icon,
  iconColor,
  borderColor,
  bgColor,
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`border ${borderColor} ${bgColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

/**
 * Linha de aluno em um card de alerta.
 * Exibe nome, plano e data de vencimento.
 */
function StudentAlertRow({
  student,
  onView,
  variant,
}: {
  student: {
    id: number;
    name: string;
    planName: string | null;
    dueDate: Date;
    paymentStatus: string;
  };
  onView: () => void;
  variant: "warning" | "danger";
}) {
  // Formata a data de vencimento para exibição
  const dueDate = new Date(student.dueDate);
  const formattedDate = dueDate.toLocaleDateString("pt-BR");

  // Calcula quantos dias faltam ou passaram
  const now = new Date();
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar com inicial do nome */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            variant === "danger"
              ? "bg-red-500/10 text-red-400"
              : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {student.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {student.planName} • Vence em {formattedDate}
          </p>
        </div>
      </div>

      {/* Badge com dias restantes */}
      <Badge
        variant="outline"
        className={`shrink-0 text-xs ${
          variant === "danger"
            ? "border-red-500/40 text-red-400"
            : "border-amber-500/40 text-amber-400"
        }`}
      >
        {variant === "danger"
          ? `${Math.abs(diffDays)}d atraso`
          : `${diffDays}d`}
      </Badge>
    </div>
  );
}
