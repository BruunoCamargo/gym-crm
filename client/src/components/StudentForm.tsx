/**
 * =============================================================
 * ARQUIVO: client/src/components/StudentForm.tsx
 * DESCRIÇÃO: Formulário reutilizável para cadastrar e editar alunos.
 *
 * Este componente é usado em dois contextos:
 * 1. Cadastro: sem studentId → cria novo aluno
 * 2. Edição: com studentId → carrega dados e atualiza
 *
 * Campos do formulário:
 * - Nome, Idade, Endereço, Telefone, E-mail (opcional)
 * - Tipo de Plano, Data de Início
 * - Status de Pagamento, Observações
 * =============================================================
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Props do componente StudentForm.
 * @param studentId - ID do aluno para edição (undefined = cadastro)
 * @param onSuccess - Callback chamado após salvar com sucesso
 * @param onCancel - Callback chamado ao cancelar
 */
interface StudentFormProps {
  studentId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Componente de formulário para cadastro e edição de alunos.
 */
export default function StudentForm({
  studentId,
  onSuccess,
  onCancel,
}: StudentFormProps) {
  // Verifica se é modo de edição ou cadastro
  const isEditing = studentId !== undefined;

  // ── ESTADOS DO FORMULÁRIO ────────────────────────────────
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(
    // Data de hoje como padrão para novos cadastros
    new Date().toISOString().split("T")[0]
  );
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [notes, setNotes] = useState("");

  // ── QUERIES ──────────────────────────────────────────────
  /** Busca os planos disponíveis para o select */
  const { data: plans } = trpc.plans.list.useQuery();

  /**
   * Busca os dados do aluno para edição.
   * enabled: false quando não está em modo de edição
   */
  const { data: studentData } = trpc.students.getById.useQuery(
    { id: studentId! },
    { enabled: isEditing }
  );

  /**
   * Preenche o formulário com os dados do aluno quando carregados.
   * useEffect executa quando studentData muda.
   */
  useEffect(() => {
    if (studentData) {
      setName(studentData.name);
      setAge(studentData.age.toString());
      setAddress(studentData.address);
      setPhone(studentData.phone);
      setEmail(studentData.email ?? "");
      setPlanId(studentData.planId.toString());
      // Formata a data para o input type="date" (YYYY-MM-DD)
      setStartDate(
        new Date(studentData.startDate).toISOString().split("T")[0]
      );
      setPaymentStatus(studentData.paymentStatus);
      setNotes(studentData.notes ?? "");
    }
  }, [studentData]);

  // ── MUTATIONS ────────────────────────────────────────────
  /** Mutation para criar novo aluno */
  const createMutation = trpc.students.create.useMutation({
    onSuccess: () => {
      toast.success("Aluno cadastrado com sucesso!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    },
  });

  /** Mutation para atualizar aluno existente */
  const updateMutation = trpc.students.update.useMutation({
    onSuccess: () => {
      toast.success("Aluno atualizado com sucesso!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  // Verifica se alguma mutation está em andamento
  const isPending = createMutation.isPending || updateMutation.isPending;

  /**
   * Função de envio do formulário.
   * Valida os campos e chama a mutation correta.
   */
  const handleSubmit = (e: React.FormEvent) => {
    // Previne o comportamento padrão do formulário (recarregar a página)
    e.preventDefault();

    // Validação básica dos campos obrigatórios
    if (!name || !age || !address || !phone || !planId || !startDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      toast.error("Idade inválida (deve ser entre 5 e 120 anos)");
      return;
    }

    if (isEditing) {
      // Modo edição: chama updateMutation
      updateMutation.mutate({
        id: studentId,
        name,
        age: ageNum,
        address,
        phone,
        email: email || undefined,
        planId: parseInt(planId),
        startDate: new Date(startDate + "T12:00:00.000Z").toISOString(),
        paymentStatus: paymentStatus as "paid" | "pending" | "overdue",
        notes: notes || undefined,
      });
    } else {
      // Modo cadastro: chama createMutation
      createMutation.mutate({
        name,
        age: ageNum,
        address,
        phone,
        email: email || undefined,
        planId: parseInt(planId),
        startDate: new Date(startDate + "T12:00:00.000Z").toISOString(),
        notes: notes || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── LINHA 1: Nome e Idade ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Campo Nome — ocupa 2/3 da linha */}
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="name">
            Nome Completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ex: João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Campo Idade — ocupa 1/3 da linha */}
        <div className="space-y-1.5">
          <Label htmlFor="age">
            Idade <span className="text-destructive">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Ex: 25"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={5}
            max={120}
            required
          />
        </div>
      </div>

      {/* ── LINHA 2: Endereço ─────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="address">
          Endereço Completo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          placeholder="Ex: Rua das Flores, 123 - Bairro - Cidade/UF"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      {/* ── LINHA 3: Telefone e E-mail ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Telefone/Celular <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="Ex: (11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">
            E-mail{" "}
            <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Ex: joao@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* ── LINHA 4: Plano e Data de Início ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="plan">
            Tipo de Plano <span className="text-destructive">*</span>
          </Label>
          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger id="plan">
              <SelectValue placeholder="Selecione o plano" />
            </SelectTrigger>
            <SelectContent>
              {plans?.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  <div className="flex items-center justify-between gap-4 w-full">
                    <span>{plan.name}</span>
                    <span className="text-muted-foreground text-xs">
                      R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="startDate">
            Data de Início <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* ── STATUS DE PAGAMENTO (apenas na edição) ────── */}
      {isEditing && (
        <div className="space-y-1.5">
          <Label htmlFor="paymentStatus">Status da Mensalidade</Label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger id="paymentStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">✅ Pago</SelectItem>
              <SelectItem value="pending">⏳ Pendente</SelectItem>
              <SelectItem value="overdue">❌ Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── OBSERVAÇÕES ──────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">
          Observações{" "}
          <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Informações adicionais sobre o aluno..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* ── BOTÕES DE AÇÃO ────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Salvando..."
              : "Cadastrando..."
            : isEditing
              ? "Salvar Alterações"
              : "Cadastrar Aluno"}
        </Button>
      </div>
    </form>
  );
}
