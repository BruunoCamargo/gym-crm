/**
 * =============================================================
 * ARQUIVO: client/src/pages/OverdueStudents.tsx
 * DESCRIÇÃO: Página de alunos com mensalidades vencidas ou próximas.
 *
 * Exibe:
 * - Lista de alunos com mensalidade vencida (overdue)
 * - Lista de alunos com vencimento nos próximos 7 dias
 * - Opção de registrar pagamento diretamente nesta tela
 * =============================================================
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Componente principal da página de Vencimentos.
 */
export default function OverdueStudents() {
  // Estado do modal de pagamento
  const [payingStudent, setPayingStudent] = useState<{
    id: number;
    name: string;
    planId: number;
    planDuration: number | null;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("pix");

  // Busca todos os alunos ativos
  const { data: students, isLoading, refetch } = trpc.students.list.useQuery({
    isActive: true,
  });

  // Filtra alunos com mensalidade vencida
  const overdueStudents = students?.filter(
    (s) => s.paymentStatus === "overdue"
  );

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
  });

  // Mutation para registrar pagamento
  const paymentMutation = trpc.students.registerPayment.useMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado com sucesso!");
      setPayingStudent(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao registrar pagamento: ${error.message}`);
    },
  });

  const handleRegisterPayment = () => {
    if (!payingStudent) return;

    // Busca o plano para obter o preço
    paymentMutation.mutate({
      studentId: payingStudent.id,
      amount: "0", // Será calculado no servidor
      paymentMethod: paymentMethod as "cash" | "card" | "pix" | "transfer",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── CABEÇALHO ─────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Vencimentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe mensalidades vencidas e próximas do vencimento
          </p>
        </div>

        {/* ── CARDS DE RESUMO ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-400 font-display">
                  {overdueStudents?.length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Mensalidades Vencidas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400 font-display">
                  {expiringStudents?.length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vencem em 7 dias
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── ALUNOS COM MENSALIDADE VENCIDA ────────────── */}
        {!isLoading && overdueStudents && overdueStudents.length > 0 && (
          <Card className="border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Mensalidades Vencidas
                <Badge
                  variant="outline"
                  className="ml-auto border-red-500/30 text-red-400 text-xs"
                >
                  {overdueStudents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueStudents.map((student) => {
                const dueDate = new Date(student.dueDate);
                const now = new Date();
                const daysOverdue = Math.ceil(
                  (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-sm font-bold text-red-400 shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.planName} • Venceu em{" "}
                          {dueDate.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="border-red-500/30 text-red-400 text-xs"
                      >
                        {daysOverdue}d atraso
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPayingStudent({
                            id: student.id,
                            name: student.name,
                            planId: student.planId,
                            planDuration: student.planDuration,
                          })
                        }
                        className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <CreditCard className="w-3 h-3" />
                        Pagar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ── ALUNOS COM VENCIMENTO PRÓXIMO ─────────────── */}
        {!isLoading && expiringStudents && expiringStudents.length > 0 && (
          <Card className="border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Vencem nos Próximos 7 Dias
                <Badge
                  variant="outline"
                  className="ml-auto border-amber-500/30 text-amber-400 text-xs"
                >
                  {expiringStudents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expiringStudents.map((student) => {
                const dueDate = new Date(student.dueDate);
                const now = new Date();
                const daysLeft = Math.ceil(
                  (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.planName} • Vence em{" "}
                          {dueDate.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 text-xs"
                      >
                        {daysLeft}d restantes
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPayingStudent({
                            id: student.id,
                            name: student.name,
                            planId: student.planId,
                            planDuration: student.planDuration,
                          })
                        }
                        className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <CreditCard className="w-3 h-3" />
                        Pagar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Estado vazio — tudo em dia */}
        {!isLoading &&
          (!overdueStudents || overdueStudents.length === 0) &&
          (!expiringStudents || expiringStudents.length === 0) && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-400 text-lg">
                    Tudo em dia!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não há mensalidades vencidas ou próximas do vencimento.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      {/* ── MODAL: REGISTRAR PAGAMENTO ────────────────── */}
      <Dialog
        open={payingStudent !== null}
        onOpenChange={(open) => !open && setPayingStudent(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <CreditCard className="w-5 h-5 text-primary" />
              Registrar Pagamento
            </DialogTitle>
            <DialogDescription>
              Registrar pagamento para{" "}
              <strong className="text-foreground">{payingStudent?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Método de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPayingStudent(null)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegisterPayment}
              disabled={paymentMutation.isPending}
            >
              {paymentMutation.isPending ? "Registrando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
