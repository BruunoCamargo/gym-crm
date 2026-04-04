/**
 * =============================================================
 * ARQUIVO: server/gym-crm.test.ts
 * DESCRIÇÃO: Testes automatizados para os routers do Gym CRM.
 *
 * O que são testes automatizados?
 * São funções que verificam se o código funciona corretamente.
 * Em vez de testar manualmente clicando na interface, escrevemos
 * código que testa o código — mais rápido e confiável.
 *
 * Estrutura de um teste:
 * describe("grupo") → agrupa testes relacionados
 * it("deve fazer X") → descreve o comportamento esperado
 * expect(valor).toBe(esperado) → verifica se o resultado está correto
 * =============================================================
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─────────────────────────────────────────────────────────────
// MOCKS (Simulações)
// Substituímos as funções reais do banco de dados por versões
// simuladas para que os testes não dependam de um banco real.
// ─────────────────────────────────────────────────────────────

/**
 * vi.mock() substitui o módulo "./db" por uma versão simulada.
 * Isso permite testar a lógica sem precisar de um banco de dados real.
 */
vi.mock("./db", () => ({
  // Simula a função de buscar todos os planos
  getAllPlans: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Plano Mensal",
      type: "monthly",
      durationMonths: 1,
      price: "89.90",
      description: "Acesso por 1 mês",
    },
    {
      id: 2,
      name: "Plano Trimestral",
      type: "quarterly",
      durationMonths: 3,
      price: "239.90",
      description: "Acesso por 3 meses",
    },
  ]),

  // Simula a função de buscar plano por ID
  getPlanById: vi.fn().mockImplementation(async (id: number) => {
    const plans: Record<number, { id: number; name: string; durationMonths: number; price: string }> = {
      1: { id: 1, name: "Plano Mensal", durationMonths: 1, price: "89.90" },
      2: { id: 2, name: "Plano Trimestral", durationMonths: 3, price: "239.90" },
    };
    return plans[id] ?? null;
  }),

  // Simula a função de listar alunos
  getStudents: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "João Silva",
      age: 28,
      address: "Rua das Flores, 123",
      phone: "(11) 99999-9999",
      email: "joao@email.com",
      planId: 1,
      planName: "Plano Mensal",
      planType: "monthly",
      planDuration: 1,
      paymentStatus: "paid",
      startDate: new Date("2024-01-01"),
      dueDate: new Date("2024-02-01"),
      isActive: true,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),

  // Simula a função de buscar aluno por ID
  getStudentById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        name: "João Silva",
        age: 28,
        address: "Rua das Flores, 123",
        phone: "(11) 99999-9999",
        email: "joao@email.com",
        planId: 1,
        planName: "Plano Mensal",
        planType: "monthly",
        planDuration: 1,
        paymentStatus: "paid",
        startDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        isActive: true,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    // Retorna null para IDs que não existem
    return null;
  }),

  // Simula a criação de aluno
  createStudent: vi.fn().mockResolvedValue({ id: 99 }),

  // Simula a atualização de aluno
  updateStudent: vi.fn().mockResolvedValue(undefined),

  // Simula a exclusão de aluno
  deleteStudent: vi.fn().mockResolvedValue(undefined),

  // Simula o registro de pagamento
  registerPayment: vi.fn().mockResolvedValue(undefined),

  // Simula as estatísticas do dashboard
  getDashboardStats: vi.fn().mockResolvedValue({
    totalStudents: 10,
    activeStudents: 8,
    paidStudents: 6,
    pendingStudents: 1,
    overdueStudents: 1,
    expiringThisWeek: 2,
  }),

  // Simula a distribuição por plano
  getStudentsByPlan: vi.fn().mockResolvedValue([
    { planType: "monthly", planName: "Plano Mensal", count: 5 },
    { planType: "quarterly", planName: "Plano Trimestral", count: 3 },
  ]),

  // Simula o histórico de pagamentos
  getStudentPaymentHistory: vi.fn().mockResolvedValue([]),

  // Simula a atualização de alunos vencidos (não retorna nada)
  updateOverdueStudents: vi.fn().mockResolvedValue(undefined),

  // Simula a criação dos planos padrão
  seedDefaultPlans: vi.fn().mockResolvedValue(undefined),
}));

// ─────────────────────────────────────────────────────────────
// HELPERS DE CONTEXTO
// Funções auxiliares para criar contextos de teste
// ─────────────────────────────────────────────────────────────

/**
 * Cria um contexto de usuário autenticado para os testes.
 * Simula um usuário logado sem precisar do OAuth real.
 */
function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-openid",
      email: "admin@gymcrm.com",
      name: "Admin Test",
      loginMethod: "manus",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

/**
 * Cria um contexto sem usuário (não autenticado).
 * Usado para testar que rotas protegidas rejeitam acesso.
 */
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─────────────────────────────────────────────────────────────
// TESTES: AUTENTICAÇÃO
// ─────────────────────────────────────────────────────────────

describe("auth", () => {
  /**
   * Teste: verificar se o endpoint "me" retorna o usuário logado.
   */
  it("auth.me deve retornar o usuário autenticado", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    // Verifica se o usuário retornado tem os dados corretos
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Admin Test");
    expect(user?.email).toBe("admin@gymcrm.com");
  });

  /**
   * Teste: verificar se "me" retorna null para usuário não autenticado.
   */
  it("auth.me deve retornar null quando não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    // Sem usuário logado, deve retornar null
    expect(user).toBeNull();
  });

  /**
   * Teste: verificar se o logout limpa o cookie de sessão.
   */
  it("auth.logout deve limpar o cookie e retornar sucesso", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    // Deve retornar { success: true }
    expect(result.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// TESTES: PLANOS
// ─────────────────────────────────────────────────────────────

describe("plans", () => {
  /**
   * Teste: listar todos os planos disponíveis.
   */
  it("plans.list deve retornar a lista de planos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plans = await caller.plans.list();

    // Deve retornar um array com pelo menos 1 plano
    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBeGreaterThan(0);

    // O primeiro plano deve ter os campos obrigatórios
    expect(plans[0]).toHaveProperty("id");
    expect(plans[0]).toHaveProperty("name");
    expect(plans[0]).toHaveProperty("durationMonths");
    expect(plans[0]).toHaveProperty("price");
  });

  /**
   * Teste: rota protegida deve rejeitar acesso sem autenticação.
   */
  it("plans.list deve rejeitar acesso sem autenticação", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Espera que a chamada lance um erro de não autorizado
    await expect(caller.plans.list()).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────
// TESTES: ALUNOS
// ─────────────────────────────────────────────────────────────

describe("students", () => {
  /**
   * Teste: listar alunos sem filtros.
   */
  it("students.list deve retornar a lista de alunos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.list({});

    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThan(0);

    // Verifica os campos obrigatórios do aluno
    const student = students[0];
    expect(student).toHaveProperty("id");
    expect(student).toHaveProperty("name");
    expect(student).toHaveProperty("age");
    expect(student).toHaveProperty("phone");
    expect(student).toHaveProperty("paymentStatus");
    expect(student).toHaveProperty("dueDate");
  });

  /**
   * Teste: buscar aluno por ID existente.
   */
  it("students.getById deve retornar o aluno correto", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const student = await caller.students.getById({ id: 1 });

    expect(student.id).toBe(1);
    expect(student.name).toBe("João Silva");
    expect(student.age).toBe(28);
  });

  /**
   * Teste: buscar aluno com ID inexistente deve lançar erro 404.
   */
  it("students.getById deve lançar NOT_FOUND para ID inexistente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // ID 999 não existe no mock
    await expect(caller.students.getById({ id: 999 })).rejects.toThrow(
      TRPCError
    );
  });

  /**
   * Teste: criar um novo aluno com dados válidos.
   */
  it("students.create deve criar aluno com dados válidos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.students.create({
      name: "Maria Santos",
      age: 30,
      address: "Av. Principal, 456 - Centro",
      phone: "(11) 88888-8888",
      email: "maria@email.com",
      planId: 1,
      startDate: new Date().toISOString(),
    });

    // Deve retornar sucesso e um ID
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  /**
   * Teste: criar aluno com nome muito curto deve falhar.
   */
  it("students.create deve rejeitar nome com menos de 2 caracteres", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.students.create({
        name: "A", // Nome muito curto
        age: 25,
        address: "Rua Teste, 123",
        phone: "(11) 99999-9999",
        planId: 1,
        startDate: new Date().toISOString(),
      })
    ).rejects.toThrow();
  });

  /**
   * Teste: criar aluno com plano inexistente deve falhar.
   */
  it("students.create deve rejeitar planId inexistente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.students.create({
        name: "Carlos Teste",
        age: 25,
        address: "Rua Teste, 123",
        phone: "(11) 99999-9999",
        planId: 999, // Plano inexistente
        startDate: new Date().toISOString(),
      })
    ).rejects.toThrow(TRPCError);
  });

  /**
   * Teste: atualizar aluno existente.
   */
  it("students.update deve atualizar aluno existente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.students.update({
      id: 1,
      name: "João Silva Atualizado",
      paymentStatus: "paid",
    });

    expect(result.success).toBe(true);
  });

  /**
   * Teste: atualizar aluno inexistente deve falhar.
   */
  it("students.update deve lançar NOT_FOUND para ID inexistente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.students.update({
        id: 999,
        name: "Aluno Inexistente",
      })
    ).rejects.toThrow(TRPCError);
  });

  /**
   * Teste: excluir aluno existente.
   */
  it("students.delete deve excluir aluno existente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.students.delete({ id: 1 });

    expect(result.success).toBe(true);
  });

  /**
   * Teste: excluir aluno inexistente deve falhar.
   */
  it("students.delete deve lançar NOT_FOUND para ID inexistente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.students.delete({ id: 999 })).rejects.toThrow(
      TRPCError
    );
  });

  /**
   * Teste: registrar pagamento para aluno existente.
   */
  it("students.registerPayment deve registrar pagamento com sucesso", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.students.registerPayment({
      studentId: 1,
      amount: "89.90",
      paymentMethod: "pix",
    });

    expect(result.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// TESTES: DASHBOARD
// ─────────────────────────────────────────────────────────────

describe("dashboard", () => {
  /**
   * Teste: buscar estatísticas do dashboard.
   */
  it("dashboard.stats deve retornar as estatísticas corretas", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.stats();

    // Verifica todos os campos das estatísticas
    expect(stats).toHaveProperty("totalStudents");
    expect(stats).toHaveProperty("activeStudents");
    expect(stats).toHaveProperty("paidStudents");
    expect(stats).toHaveProperty("pendingStudents");
    expect(stats).toHaveProperty("overdueStudents");
    expect(stats).toHaveProperty("expiringThisWeek");

    // Os valores devem ser números
    expect(typeof stats.totalStudents).toBe("number");
    expect(typeof stats.activeStudents).toBe("number");
  });

  /**
   * Teste: buscar distribuição de alunos por plano.
   */
  it("dashboard.studentsByPlan deve retornar distribuição por plano", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const planData = await caller.dashboard.studentsByPlan();

    expect(Array.isArray(planData)).toBe(true);

    if (planData.length > 0) {
      // Cada item deve ter tipo de plano, nome e contagem
      expect(planData[0]).toHaveProperty("planType");
      expect(planData[0]).toHaveProperty("planName");
      expect(planData[0]).toHaveProperty("count");
    }
  });
});
