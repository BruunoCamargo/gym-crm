/**
 * =============================================================
 * ARQUIVO: server/routers.ts
 * DESCRIÇÃO: Define todos os "endpoints" da API usando tRPC.
 *
 * O tRPC é uma biblioteca que permite criar APIs type-safe
 * (com verificação de tipos) entre o servidor e o cliente React.
 *
 * Cada "procedure" (procedimento) é como uma função que o
 * frontend pode chamar para buscar ou modificar dados.
 *
 * Tipos de procedures:
 * - publicProcedure: qualquer um pode chamar (sem login)
 * - protectedProcedure: só usuários logados podem chamar
 * =============================================================
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createStudent,
  deleteStudent,
  getAllPlans,
  getDashboardStats,
  getPlanById,
  getStudentById,
  getStudentPaymentHistory,
  getStudentsByPlan,
  getStudents,
  registerPayment,
  seedDefaultPlans,
  updateOverdueStudents,
  updateStudent,
} from "./db";

// ─────────────────────────────────────────────────────────────
// ROUTER DE PLANOS
// Gerencia os tipos de planos disponíveis na academia
// ─────────────────────────────────────────────────────────────
const plansRouter = router({
  /**
   * Lista todos os planos disponíveis.
   * Usado nos formulários de cadastro de alunos.
   *
   * Exemplo de uso no frontend:
   * const { data: plans } = trpc.plans.list.useQuery();
   */
  list: protectedProcedure.query(async () => {
    // Garante que os planos padrão existam no banco
    await seedDefaultPlans();
    // Busca e retorna todos os planos
    return getAllPlans();
  }),
});

// ─────────────────────────────────────────────────────────────
// ROUTER DE ALUNOS
// CRUD completo: listar, criar, atualizar, deletar
// ─────────────────────────────────────────────────────────────
const studentsRouter = router({
  /**
   * Lista alunos com filtros opcionais.
   * Suporta busca por nome, status de pagamento e tipo de plano.
   *
   * Exemplo de uso no frontend:
   * const { data } = trpc.students.list.useQuery({
   *   search: "João",
   *   paymentStatus: "overdue"
   * });
   */
  list: protectedProcedure
    // Define o schema de validação dos parâmetros de entrada
    // z.object() cria um validador para objetos
    .input(
      z.object({
        /** Texto de busca pelo nome do aluno (opcional) */
        search: z.string().optional(),
        /** Filtro por status de pagamento (opcional) */
        paymentStatus: z
          .enum(["paid", "pending", "overdue"])
          .optional(),
        /** Filtro por tipo de plano (opcional) */
        planType: z
          .enum(["monthly", "quarterly", "semiannual", "annual"])
          .optional(),
        /** Filtro por status ativo/inativo (opcional) */
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      // Atualiza o status de alunos vencidos antes de retornar a lista
      await updateOverdueStudents();
      // Busca os alunos com os filtros fornecidos
      return getStudents(input);
    }),

  /**
   * Busca um aluno específico pelo ID.
   * Usado para exibir os detalhes de um aluno.
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(), // ID deve ser número inteiro positivo
      })
    )
    .query(async ({ input }) => {
      const student = await getStudentById(input.id);

      // Se o aluno não foi encontrado, lança um erro 404
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aluno não encontrado",
        });
      }

      return student;
    }),

  /**
   * Cria um novo aluno no sistema.
   * Valida todos os campos obrigatórios antes de salvar.
   *
   * Exemplo de uso no frontend:
   * const createMutation = trpc.students.create.useMutation();
   * await createMutation.mutateAsync({ name: "João", age: 25, ... });
   */
  create: protectedProcedure
    .input(
      z.object({
        /** Nome completo do aluno — obrigatório, mínimo 2 caracteres */
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),

        /** Idade do aluno — deve ser entre 5 e 120 anos */
        age: z.number().int().min(5).max(120),

        /** Endereço completo — obrigatório */
        address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),

        /** Telefone — obrigatório */
        phone: z.string().min(8, "Telefone inválido"),

        /** E-mail — opcional, mas se fornecido deve ser válido */
        email: z.string().email("E-mail inválido").optional().or(z.literal("")),

        /** ID do plano escolhido */
        planId: z.number().int().positive("Selecione um plano"),

        /** Data de início da matrícula */
        startDate: z.string().datetime(),

        /** Observações adicionais — opcional */
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Busca o plano para calcular a data de vencimento
      const plan = await getPlanById(input.planId);
      if (!plan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Plano não encontrado",
        });
      }

      // Calcula a data de vencimento com base na duração do plano
      const startDate = new Date(input.startDate);
      const dueDate = new Date(startDate);
      // Adiciona os meses de duração do plano à data de início
      dueDate.setMonth(dueDate.getMonth() + plan.durationMonths);

      // Cria o aluno no banco de dados
      const result = await createStudent({
        name: input.name,
        age: input.age,
        address: input.address,
        phone: input.phone,
        email: input.email || null,
        planId: input.planId,
        paymentStatus: "pending", // Começa como pendente
        startDate: startDate,
        dueDate: dueDate,
        isActive: true,
        notes: input.notes || null,
      });

      return { success: true, id: result.id };
    }),

  /**
   * Atualiza os dados de um aluno existente.
   * Permite atualizar qualquer campo individualmente.
   */
  update: protectedProcedure
    .input(
      z.object({
        /** ID do aluno a ser atualizado */
        id: z.number().int().positive(),

        /** Campos que podem ser atualizados (todos opcionais) */
        name: z.string().min(2).optional(),
        age: z.number().int().min(5).max(120).optional(),
        address: z.string().min(5).optional(),
        phone: z.string().min(8).optional(),
        email: z.string().email().optional().or(z.literal("")).or(z.null()),
        planId: z.number().int().positive().optional(),
        paymentStatus: z.enum(["paid", "pending", "overdue"]).optional(),
        startDate: z.string().datetime().optional(),
        dueDate: z.string().datetime().optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().or(z.null()),
      })
    )
    .mutation(async ({ input }) => {
      // Extrai o ID e os demais campos
      const { id, ...data } = input;

      // Verifica se o aluno existe antes de atualizar
      const existing = await getStudentById(id);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aluno não encontrado",
        });
      }

      // Prepara os dados para atualização
      const updateData: Record<string, unknown> = {};

      // Adiciona apenas os campos que foram fornecidos
      if (data.name !== undefined) updateData.name = data.name;
      if (data.age !== undefined) updateData.age = data.age;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.planId !== undefined) {
        updateData.planId = data.planId;

        // Se o plano mudou, recalcula a data de vencimento
        const plan = await getPlanById(data.planId);
        if (plan && data.startDate) {
          const startDate = new Date(data.startDate);
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + plan.durationMonths);
          updateData.dueDate = dueDate;
        }
      }
      if (data.paymentStatus !== undefined)
        updateData.paymentStatus = data.paymentStatus;
      if (data.startDate !== undefined)
        updateData.startDate = new Date(data.startDate);
      if (data.dueDate !== undefined)
        updateData.dueDate = new Date(data.dueDate);
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.notes !== undefined) updateData.notes = data.notes;

      // Executa a atualização no banco
      await updateStudent(id, updateData as Parameters<typeof updateStudent>[1]);

      return { success: true };
    }),

  /**
   * Remove um aluno do sistema permanentemente.
   * Esta operação não pode ser desfeita!
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      // Verifica se o aluno existe
      const existing = await getStudentById(input.id);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aluno não encontrado",
        });
      }

      // Remove o aluno e seu histórico de pagamentos
      await deleteStudent(input.id);

      return { success: true };
    }),

  /**
   * Registra um pagamento para um aluno.
   * Atualiza o status para "paid" e a nova data de vencimento.
   */
  registerPayment: protectedProcedure
    .input(
      z.object({
        studentId: z.number().int().positive(),
        amount: z.string(), // Valor em string para preservar decimais
        paymentMethod: z.enum(["cash", "card", "pix", "transfer"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Busca o aluno para obter o plano atual
      const student = await getStudentById(input.studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aluno não encontrado",
        });
      }

      // Define o período de competência do pagamento
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(
        periodEnd.getMonth() + (student.planDuration ?? 1)
      );

      // Registra o pagamento e atualiza o status do aluno
      await registerPayment({
        studentId: input.studentId,
        planId: student.planId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        periodStart,
        periodEnd,
        notes: input.notes || null,
      });

      return { success: true };
    }),

  /**
   * Busca o histórico de pagamentos de um aluno.
   */
  paymentHistory: protectedProcedure
    .input(z.object({ studentId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return getStudentPaymentHistory(input.studentId);
    }),
});

// ─────────────────────────────────────────────────────────────
// ROUTER DO DASHBOARD
// Estatísticas e métricas para o painel administrativo
// ─────────────────────────────────────────────────────────────
const dashboardRouter = router({
  /**
   * Retorna as estatísticas gerais do dashboard.
   * Inclui contadores de alunos e alertas de vencimento.
   */
  stats: protectedProcedure.query(async () => {
    // Atualiza alunos vencidos antes de calcular as estatísticas
    await updateOverdueStudents();
    return getDashboardStats();
  }),

  /**
   * Retorna a distribuição de alunos por tipo de plano.
   * Usado para renderizar gráficos no dashboard.
   */
  studentsByPlan: protectedProcedure.query(async () => {
    return getStudentsByPlan();
  }),
});

// ─────────────────────────────────────────────────────────────
// ROUTER PRINCIPAL (App Router)
// Agrupa todos os sub-routers em um único objeto.
// O frontend acessa via: trpc.students.list, trpc.dashboard.stats, etc.
// ─────────────────────────────────────────────────────────────
export const appRouter = router({
  /** Routers do sistema (notificações, etc.) */
  system: systemRouter,

  /** Routers de autenticação (login, logout, dados do usuário) */
  auth: router({
    /**
     * Retorna os dados do usuário logado.
     * Se não estiver logado, retorna null.
     */
    me: publicProcedure.query((opts) => opts.ctx.user),

    /**
     * Realiza o logout do usuário.
     * Remove o cookie de sessão.
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Limpa o cookie de sessão (maxAge: -1 = expirado imediatamente)
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /** Routers de planos */
  plans: plansRouter,

  /** Routers de alunos (CRUD completo) */
  students: studentsRouter,

  /** Routers do dashboard (estatísticas) */
  dashboard: dashboardRouter,
});

// Exporta o tipo do router para uso no frontend (tipagem automática)
export type AppRouter = typeof appRouter;
