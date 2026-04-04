/**
 * =============================================================
 * ARQUIVO: client/src/pages/Students.tsx
 * DESCRIÇÃO: Página de gestão completa de alunos.
 *
 * Funcionalidades:
 * - Listagem de alunos em tabela com paginação
 * - Filtros por nome, status de pagamento e tipo de plano
 * - Modal para cadastrar novo aluno
 * - Modal para editar aluno existente
 * - Confirmação de exclusão de aluno
 * - Registro de pagamento
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit,
  Plus,
  Search,
  Trash2,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import StudentForm from "@/components/StudentForm";

/**
 * Componente principal da página de Alunos.
 */
export default function Students() {
  // ── ESTADOS DOS FILTROS ──────────────────────────────────
  /** Texto de busca pelo nome do aluno */
  const [search, setSearch] = useState("");
  /** Filtro por status de pagamento */
  const [statusFilter, setStatusFilter] = useState<string>("all");
  /** Filtro por tipo de plano */
  const [planFilter, setPlanFilter] = useState<string>("all");

  // ── ESTADOS DOS MODAIS ───────────────────────────────────
  /** Controla se o modal de cadastro está aberto */
  const [showAddModal, setShowAddModal] = useState(false);
  /** Aluno sendo editado (null = nenhum) */
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  /** Aluno sendo excluído (null = nenhum) */
  const [deletingStudent, setDeletingStudent] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // ── QUERIES (busca de dados) ─────────────────────────────
  /**
   * Busca a lista de alunos com os filtros aplicados.
   * O tRPC refaz a busca automaticamente quando os filtros mudam.
   */
  const { data: students, isLoading, refetch } = trpc.students.list.useQuery({
    search: search || undefined,
    paymentStatus:
      statusFilter !== "all"
        ? (statusFilter as "paid" | "pending" | "overdue")
        : undefined,
    planType:
      planFilter !== "all"
        ? (planFilter as "monthly" | "quarterly" | "semiannual" | "annual")
        : undefined,
  });

  // ── MUTATIONS (modificação de dados) ─────────────────────
  /**
   * Mutation para excluir um aluno.
   * onSuccess: fecha o modal e atualiza a lista
   * onError: exibe mensagem de erro
   */
  const deleteMutation = trpc.students.delete.useMutation({
    onSuccess: () => {
      toast.success("Aluno excluído com sucesso!");
      setDeletingStudent(null);
      refetch(); // Atualiza a lista
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  // Função chamada ao confirmar exclusão
  const handleDelete = () => {
    if (deletingStudent) {
      deleteMutation.mutate({ id: deletingStudent.id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── CABEÇALHO ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">
              Alunos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {students?.length ?? 0} aluno(s) encontrado(s)
            </p>
          </div>

          {/* Botão para abrir o modal de cadastro */}
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Aluno
          </Button>
        </div>

        {/* ── FILTROS DE BUSCA ──────────────────────────── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Campo de busca por nome */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtro por status de pagamento */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por tipo de plano */}
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="semiannual">Semestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── TABELA DE ALUNOS ──────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Lista de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              // Skeleton de carregamento
              <div className="p-8 text-center text-muted-foreground">
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded" />
                  ))}
                </div>
              </div>
            ) : !students || students.length === 0 ? (
              // Estado vazio
              <div className="p-12 text-center">
                <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  Nenhum aluno encontrado
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search || statusFilter !== "all" || planFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Clique em 'Novo Aluno' para cadastrar o primeiro aluno"}
                </p>
              </div>
            ) : (
              // Tabela com os alunos
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                        Nome
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                        Idade
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                        Telefone
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                        Plano
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                        Vencimento
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className="border-border hover:bg-accent/30 transition-colors"
                      >
                        {/* Nome do aluno com avatar */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {student.name}
                              </p>
                              {student.email && (
                                <p className="text-xs text-muted-foreground">
                                  {student.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Idade */}
                        <TableCell className="text-sm text-muted-foreground">
                          {student.age} anos
                        </TableCell>

                        {/* Telefone */}
                        <TableCell className="text-sm text-muted-foreground">
                          {student.phone}
                        </TableCell>

                        {/* Tipo de plano */}
                        <TableCell>
                          <span className="text-sm text-foreground">
                            {student.planName}
                          </span>
                        </TableCell>

                        {/* Status de pagamento com badge colorido */}
                        <TableCell>
                          <PaymentStatusBadge
                            status={student.paymentStatus}
                          />
                        </TableCell>

                        {/* Data de vencimento com alerta visual */}
                        <TableCell>
                          <DueDateCell dueDate={new Date(student.dueDate)} />
                        </TableCell>

                        {/* Botões de ação */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Botão editar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingStudent(student.id)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>

                            {/* Botão excluir */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeletingStudent({
                                  id: student.id,
                                  name: student.name,
                                })
                              }
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── MODAL: CADASTRAR NOVO ALUNO ───────────────────── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Plus className="w-5 h-5 text-primary" />
              Cadastrar Novo Aluno
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do aluno para cadastrá-lo no sistema.
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            onSuccess={() => {
              setShowAddModal(false);
              refetch();
            }}
            onCancel={() => setShowAddModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDITAR ALUNO ───────────────────────────── */}
      <Dialog
        open={editingStudent !== null}
        onOpenChange={(open) => !open && setEditingStudent(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Edit className="w-5 h-5 text-primary" />
              Editar Aluno
            </DialogTitle>
            <DialogDescription>
              Atualize os dados do aluno conforme necessário.
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <StudentForm
              studentId={editingStudent}
              onSuccess={() => {
                setEditingStudent(null);
                refetch();
              }}
              onCancel={() => setEditingStudent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CONFIRMAR EXCLUSÃO ─────────────────────── */}
      <Dialog
        open={deletingStudent !== null}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-display">
              <Trash2 className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o aluno{" "}
              <strong className="text-foreground">
                {deletingStudent?.name}
              </strong>
              ? Esta ação não pode ser desfeita e removerá também o histórico
              de pagamentos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingStudent(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES
// ─────────────────────────────────────────────────────────────

/**
 * Badge colorido para o status de pagamento.
 * - Verde: Pago
 * - Âmbar: Pendente
 * - Vermelho: Vencido
 */
function PaymentStatusBadge({
  status,
}: {
  status: "paid" | "pending" | "overdue";
}) {
  // Configurações visuais para cada status
  const config = {
    paid: {
      label: "Pago",
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-400 border-green-500/30",
    },
    pending: {
      label: "Pendente",
      icon: Clock,
      className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    overdue: {
      label: "Vencido",
      icon: XCircle,
      className: "bg-red-500/10 text-red-400 border-red-500/30",
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge
      variant="outline"
      className={`gap-1 text-xs font-medium ${className}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

/**
 * Célula de data de vencimento com alerta visual.
 * Exibe a data e um ícone de alerta se estiver vencida ou próxima.
 */
function DueDateCell({ dueDate }: { dueDate: Date }) {
  const now = new Date();
  const sevenDays = new Date();
  sevenDays.setDate(sevenDays.getDate() + 7);

  // Verifica se está vencida
  const isOverdue = dueDate < now;
  // Verifica se vence nos próximos 7 dias
  const isExpiring = !isOverdue && dueDate <= sevenDays;

  const formattedDate = dueDate.toLocaleDateString("pt-BR");

  return (
    <div className="flex items-center gap-1.5">
      {/* Ícone de alerta para vencidas ou próximas */}
      {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
      {isExpiring && <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}

      <span
        className={`text-sm ${
          isOverdue
            ? "text-red-400 font-medium"
            : isExpiring
              ? "text-amber-400 font-medium"
              : "text-muted-foreground"
        }`}
      >
        {formattedDate}
      </span>
    </div>
  );
}
