/**
 * =============================================================
 * ARQUIVO: server/db.ts
 * DESCRIÇÃO: Funções auxiliares para consultar o banco de dados.
 *
 * Este arquivo centraliza todas as operações de banco de dados
 * (SELECT, INSERT, UPDATE, DELETE). Ao invés de escrever SQL
 * diretamente nos routers, chamamos funções daqui.
 *
 * Vantagem: se precisar mudar como buscamos dados, mudamos
 * apenas aqui, sem tocar nos routers.
 * =============================================================
 */

import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertPaymentHistory,
  InsertPlan,
  InsertStudent,
  InsertUser,
  paymentHistory,
  plans,
  students,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

// ─────────────────────────────────────────────────────────────
// CONEXÃO COM O BANCO DE DADOS
// Criamos uma única instância do Drizzle para reutilizar
// em todas as funções. Isso evita abrir muitas conexões.
// ─────────────────────────────────────────────────────────────

/** Variável que armazena a conexão com o banco de dados */
let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Retorna a instância do banco de dados.
 * Se ainda não foi criada, cria agora (lazy initialization).
 *
 * "Lazy" significa que só conecta quando realmente precisar,
 * não ao iniciar o servidor.
 */
export async function getDb() {
  // Se já temos uma conexão ativa, reutiliza ela
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Cria a conexão usando a URL do banco de dados
      // A URL contém: usuário, senha, host, porta e nome do banco
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      // Se falhar ao conectar, registra o erro mas não trava o servidor
      console.warn("[Database] Falha ao conectar:", error);
      _db = null;
    }
  }
  return _db;
}

// ─────────────────────────────────────────────────────────────
// FUNÇÕES DE USUÁRIOS (Autenticação)
// Usadas pelo sistema de login OAuth do Manus
// ─────────────────────────────────────────────────────────────

/**
 * Cria ou atualiza um usuário no banco de dados.
 * "Upsert" = INSERT se não existe, UPDATE se já existe.
 *
 * Chamada automaticamente após o login OAuth bem-sucedido.
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  // Verifica se o openId foi fornecido (é obrigatório)
  if (!user.openId) {
    throw new Error("O openId do usuário é obrigatório para upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Não é possível fazer upsert: banco indisponível");
    return;
  }

  try {
    // Monta o objeto com os valores a serem inseridos
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    // Campos de texto que podem ser atualizados
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    // Para cada campo de texto, adiciona ao insert/update se foi fornecido
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Atualiza a data do último login
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    // Define o papel do usuário
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      // O dono do sistema sempre tem papel de admin
      values.role = "admin";
      updateSet.role = "admin";
    }

    // Garante que a data de último login seja preenchida
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // Se não há nada para atualizar, pelo menos atualiza o último login
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Executa o INSERT com ON DUPLICATE KEY UPDATE
    // Isso significa: "insira, mas se já existir, atualize"
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Falha ao fazer upsert do usuário:", error);
    throw error;
  }
}

/**
 * Busca um usuário pelo seu openId (ID do OAuth).
 * Retorna o usuário encontrado ou undefined se não existir.
 */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  // SELECT * FROM users WHERE openId = ? LIMIT 1
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  // Retorna o primeiro resultado ou undefined se não encontrou
  return result.length > 0 ? result[0] : undefined;
}

// ─────────────────────────────────────────────────────────────
// FUNÇÕES DE PLANOS
// Gerenciam os tipos de planos disponíveis na academia
// ─────────────────────────────────────────────────────────────

/**
 * Retorna todos os planos cadastrados no banco de dados.
 * Ordenados por duração (do mais curto ao mais longo).
 */
export async function getAllPlans() {
  const db = await getDb();
  if (!db) return [];

  // SELECT * FROM plans ORDER BY durationMonths ASC
  return db.select().from(plans).orderBy(plans.durationMonths);
}

/**
 * Busca um plano específico pelo seu ID.
 */
export async function getPlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  return result[0];
}

/**
 * Insere os planos padrão da academia no banco de dados.
 * Chamada apenas uma vez na inicialização do sistema.
 */
export async function seedDefaultPlans() {
  const db = await getDb();
  if (!db) return;

  // Verifica se já existem planos cadastrados
  const existing = await db.select().from(plans).limit(1);
  if (existing.length > 0) return; // Já tem planos, não precisa inserir

  // Dados dos planos padrão da academia
  const defaultPlans: InsertPlan[] = [
    {
      type: "monthly",
      name: "Plano Mensal",
      durationMonths: 1,
      price: "89.90",
      description: "Acesso completo por 1 mês",
    },
    {
      type: "quarterly",
      name: "Plano Trimestral",
      durationMonths: 3,
      price: "239.90",
      description: "Acesso completo por 3 meses",
    },
    {
      type: "semiannual",
      name: "Plano Semestral",
      durationMonths: 6,
      price: "449.90",
      description: "Acesso completo por 6 meses",
    },
    {
      type: "annual",
      name: "Plano Anual",
      durationMonths: 12,
      price: "799.90",
      description: "Acesso completo por 12 meses",
    },
  ];

  // INSERT INTO plans (...) VALUES (...)
  await db.insert(plans).values(defaultPlans);
  console.log("[Database] Planos padrão inseridos com sucesso!");
}

// ─────────────────────────────────────────────────────────────
// FUNÇÕES DE ALUNOS
// CRUD completo: Create, Read, Update, Delete
// ─────────────────────────────────────────────────────────────

/**
 * Parâmetros de filtro para busca de alunos.
 * Todos os campos são opcionais — se não fornecido, não filtra por ele.
 */
export interface StudentFilters {
  /** Texto para buscar no nome do aluno (busca parcial) */
  search?: string;
  /** Filtrar por status de pagamento */
  paymentStatus?: "paid" | "pending" | "overdue";
  /** Filtrar por tipo de plano */
  planType?: "monthly" | "quarterly" | "semiannual" | "annual";
  /** Filtrar apenas alunos ativos ou inativos */
  isActive?: boolean;
}

/**
 * Busca alunos com filtros opcionais.
 * Retorna os alunos junto com os dados do plano de cada um.
 *
 * @param filters - Objeto com os filtros a aplicar
 */
export async function getStudents(filters: StudentFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  // Monta as condições de filtro dinamicamente
  const conditions = [];

  // Filtro de busca por nome (LIKE '%texto%')
  if (filters.search) {
    conditions.push(like(students.name, `%${filters.search}%`));
  }

  // Filtro por status de pagamento
  if (filters.paymentStatus) {
    conditions.push(eq(students.paymentStatus, filters.paymentStatus));
  }

  // Filtro por status ativo/inativo
  if (filters.isActive !== undefined) {
    conditions.push(eq(students.isActive, filters.isActive));
  }

  // Busca os alunos com JOIN na tabela de planos
  // Isso traz os dados do plano junto com os dados do aluno
  const query = db
    .select({
      // Campos do aluno
      id: students.id,
      name: students.name,
      age: students.age,
      address: students.address,
      phone: students.phone,
      email: students.email,
      planId: students.planId,
      paymentStatus: students.paymentStatus,
      startDate: students.startDate,
      dueDate: students.dueDate,
      isActive: students.isActive,
      notes: students.notes,
      createdAt: students.createdAt,
      updatedAt: students.updatedAt,
      // Campos do plano (via JOIN)
      planName: plans.name,
      planType: plans.type,
      planPrice: plans.price,
      planDuration: plans.durationMonths,
    })
    .from(students)
    // LEFT JOIN: traz o plano mesmo que o planId não exista (evita erro)
    .leftJoin(plans, eq(students.planId, plans.id))
    .orderBy(desc(students.createdAt)); // Mais recentes primeiro

  // Aplica os filtros se houver algum
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  // Filtro por tipo de plano (precisa do JOIN, então filtramos depois)
  const result = await query;

  if (filters.planType) {
    return result.filter((s) => s.planType === filters.planType);
  }

  return result;
}

/**
 * Busca um aluno específico pelo ID.
 * Retorna os dados do aluno + dados do plano.
 */
export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: students.id,
      name: students.name,
      age: students.age,
      address: students.address,
      phone: students.phone,
      email: students.email,
      planId: students.planId,
      paymentStatus: students.paymentStatus,
      startDate: students.startDate,
      dueDate: students.dueDate,
      isActive: students.isActive,
      notes: students.notes,
      createdAt: students.createdAt,
      updatedAt: students.updatedAt,
      planName: plans.name,
      planType: plans.type,
      planPrice: plans.price,
      planDuration: plans.durationMonths,
    })
    .from(students)
    .leftJoin(plans, eq(students.planId, plans.id))
    .where(eq(students.id, id))
    .limit(1);

  return result[0];
}

/**
 * Cria um novo aluno no banco de dados.
 * Retorna o ID do aluno recém-criado.
 */
export async function createStudent(data: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  // INSERT INTO students (...) VALUES (...)
  const result = await db.insert(students).values(data);

  // insertId contém o ID gerado automaticamente pelo banco
  return { id: result[0].insertId };
}

/**
 * Atualiza os dados de um aluno existente.
 * Recebe apenas os campos que devem ser alterados (Partial).
 */
export async function updateStudent(
  id: number,
  data: Partial<InsertStudent>
) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  // UPDATE students SET ... WHERE id = ?
  await db.update(students).set(data).where(eq(students.id, id));
}

/**
 * Remove um aluno do banco de dados permanentemente.
 * Também remove o histórico de pagamentos associado.
 */
export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  // Primeiro remove o histórico de pagamentos do aluno
  // (necessário por causa das restrições de chave estrangeira)
  await db
    .delete(paymentHistory)
    .where(eq(paymentHistory.studentId, id));

  // Depois remove o aluno
  await db.delete(students).where(eq(students.id, id));
}

// ─────────────────────────────────────────────────────────────
// FUNÇÕES DE DASHBOARD
// Estatísticas e métricas para o painel administrativo
// ─────────────────────────────────────────────────────────────

/**
 * Retorna as estatísticas gerais para o dashboard.
 * Inclui contadores de alunos e alertas de vencimento.
 */
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) {
    // Retorna zeros se o banco não estiver disponível
    return {
      totalStudents: 0,
      activeStudents: 0,
      paidStudents: 0,
      pendingStudents: 0,
      overdueStudents: 0,
      expiringThisWeek: 0,
    };
  }

  // Data atual
  const now = new Date();

  // Data daqui a 7 dias (para alertas de vencimento próximo)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Conta total de alunos cadastrados
  const [totalResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students);

  // Conta alunos ativos
  const [activeResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(eq(students.isActive, true));

  // Conta alunos com mensalidade paga
  const [paidResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(and(eq(students.paymentStatus, "paid"), eq(students.isActive, true)));

  // Conta alunos com mensalidade pendente
  const [pendingResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(
      and(eq(students.paymentStatus, "pending"), eq(students.isActive, true))
    );

  // Conta alunos com mensalidade vencida
  const [overdueResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(
      and(eq(students.paymentStatus, "overdue"), eq(students.isActive, true))
    );

  // Conta alunos com vencimento nos próximos 7 dias
  const [expiringResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(
      and(
        eq(students.isActive, true),
        gte(students.dueDate, now),
        lte(students.dueDate, sevenDaysFromNow)
      )
    );

  return {
    totalStudents: Number(totalResult?.count ?? 0),
    activeStudents: Number(activeResult?.count ?? 0),
    paidStudents: Number(paidResult?.count ?? 0),
    pendingStudents: Number(pendingResult?.count ?? 0),
    overdueStudents: Number(overdueResult?.count ?? 0),
    expiringThisWeek: Number(expiringResult?.count ?? 0),
  };
}

/**
 * Retorna a distribuição de alunos por tipo de plano.
 * Usado para gráficos no dashboard.
 */
export async function getStudentsByPlan() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      planName: plans.name,
      planType: plans.type,
      count: sql<number>`COUNT(${students.id})`,
    })
    .from(plans)
    .leftJoin(
      students,
      and(eq(students.planId, plans.id), eq(students.isActive, true))
    )
    .groupBy(plans.id, plans.name, plans.type)
    .orderBy(plans.durationMonths);
}

// ─────────────────────────────────────────────────────────────
// FUNÇÕES DE HISTÓRICO DE PAGAMENTOS
// ─────────────────────────────────────────────────────────────

/**
 * Registra um novo pagamento no histórico.
 * Também atualiza o status do aluno para "paid".
 */
export async function registerPayment(data: InsertPaymentHistory) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  // Insere o registro de pagamento
  await db.insert(paymentHistory).values(data);

  // Atualiza o status do aluno para "pago" e a nova data de vencimento
  await db
    .update(students)
    .set({
      paymentStatus: "paid",
      dueDate: data.periodEnd,
    })
    .where(eq(students.id, data.studentId));
}

/**
 * Busca o histórico de pagamentos de um aluno específico.
 * Ordenado do mais recente para o mais antigo.
 */
export async function getStudentPaymentHistory(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.studentId, studentId))
    .orderBy(desc(paymentHistory.paidAt));
}

/**
 * Atualiza automaticamente o status de alunos com mensalidade vencida.
 * Deve ser chamada periodicamente (ex: ao carregar o dashboard).
 *
 * Regra: se a data de vencimento passou e o status não é "paid",
 * muda para "overdue" (vencido).
 */
export async function updateOverdueStudents() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();

  // UPDATE students SET paymentStatus = 'overdue'
  // WHERE dueDate < NOW() AND paymentStatus != 'paid' AND isActive = true
  await db
    .update(students)
    .set({ paymentStatus: "overdue" })
    .where(
      and(
        lte(students.dueDate, now),
        or(
          eq(students.paymentStatus, "pending"),
          eq(students.paymentStatus, "overdue")
        ),
        eq(students.isActive, true)
      )
    );
}
