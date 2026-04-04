/**
 * =============================================================
 * ARQUIVO: client/src/pages/Reports.tsx
 * DESCRIÇÃO: Página de relatórios e estatísticas da academia.
 *
 * Exibe:
 * - Resumo financeiro por tipo de plano
 * - Distribuição de alunos por status de pagamento
 * - Gráfico de barras com alunos por plano
 * =============================================================
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react";

/** Cores para os gráficos */
const COLORS = ["#F59E0B", "#22C55E", "#3B82F6", "#A855F7"];

/**
 * Componente principal da página de Relatórios.
 */
export default function Reports() {
  // Busca estatísticas do dashboard
  const { data: stats } = trpc.dashboard.stats.useQuery();

  // Busca distribuição por plano
  const { data: planData } = trpc.dashboard.studentsByPlan.useQuery();

  // Dados para o gráfico de status de pagamento
  const statusData = stats
    ? [
        { name: "Pagos", value: stats.paidStudents, color: "#22C55E" },
        { name: "Pendentes", value: stats.pendingStudents, color: "#F59E0B" },
        { name: "Vencidos", value: stats.overdueStudents, color: "#EF4444" },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── CABEÇALHO ─────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Relatórios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Estatísticas e análises da academia
          </p>
        </div>

        {/* ── CARDS DE RESUMO ───────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold font-display">
                    {stats?.totalStudents ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ativos</p>
                  <p className="text-xl font-bold font-display">
                    {stats?.activeStudents ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pagos</p>
                  <p className="text-xl font-bold font-display">
                    {stats?.paidStudents ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencendo</p>
                  <p className="text-xl font-bold font-display">
                    {stats?.expiringThisWeek ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── GRÁFICOS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Gráfico de Barras: Alunos por Plano */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Alunos por Tipo de Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              {planData && planData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={planData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.28 0.02 240)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="planName"
                      tick={{ fontSize: 11, fill: "oklch(0.60 0.02 240)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "oklch(0.60 0.02 240)" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.18 0.025 240)",
                        border: "1px solid oklch(0.28 0.02 240)",
                        borderRadius: "8px",
                        color: "oklch(0.97 0.005 240)",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value} aluno(s)`, "Quantidade"]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {planData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Sem dados para exibir
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Pizza: Status de Pagamento */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Status de Mensalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.some((d) => d.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.18 0.025 240)",
                          border: "1px solid oklch(0.28 0.02 240)",
                          borderRadius: "8px",
                          color: "oklch(0.97 0.005 240)",
                          fontSize: "12px",
                        }}
                        formatter={(value, name) => [`${value} aluno(s)`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2 mt-2">
                    {statusData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: item.color }}
                          />
                          <span className="text-muted-foreground">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {item.value}
                          </span>
                          {stats && stats.activeStudents > 0 && (
                            <span className="text-muted-foreground">
                              (
                              {Math.round(
                                (item.value / stats.activeStudents) * 100
                              )}
                              %)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Sem dados para exibir
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── TABELA DE PLANOS ──────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Detalhamento por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground font-medium">
                      Plano
                    </th>
                    <th className="text-center py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground font-medium">
                      Alunos
                    </th>
                    <th className="text-center py-2 px-3 text-xs uppercase tracking-wide text-muted-foreground font-medium">
                      % do Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planData?.map((plan, index) => (
                    <tr
                      key={plan.planType}
                      className="border-b border-border/50 hover:bg-accent/20 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="text-foreground font-medium">
                            {plan.planName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-foreground">
                        {Number(plan.count)}
                      </td>
                      <td className="py-3 px-3 text-center text-muted-foreground">
                        {stats && stats.activeStudents > 0
                          ? `${Math.round((Number(plan.count) / stats.activeStudents) * 100)}%`
                          : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
