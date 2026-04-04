/**
 * =============================================================
 * ARQUIVO: drizzle/schema.ts
 * DESCRIÇÃO: Define a estrutura do banco de dados MySQL.
 *
 * Este arquivo é como o "projeto arquitetônico" do banco de dados.
 * Cada "mysqlTable" representa uma tabela no banco, e cada campo
 * dentro dela representa uma coluna dessa tabela.
 *
 * O Drizzle ORM usa este arquivo para:
 * 1. Gerar os comandos SQL de criação das tabelas (migrations)
 * 2. Fornecer tipagem TypeScript para consultas ao banco
 * =============================================================
 */

import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─────────────────────────────────────────────────────────────
// TABELA: users (Usuários do sistema / Administradores)
// Esta tabela é criada automaticamente pelo sistema de autenticação
// Manus OAuth. Ela armazena os dados do administrador logado.
// ─────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  /** Chave primária: número único que identifica cada usuário */
  id: int("id").autoincrement().primaryKey(),

  /** ID único do Manus OAuth — vem do provedor de autenticação */
  openId: varchar("openId", { length: 64 }).notNull().unique(),

  /** Nome completo do administrador */
  name: text("name"),

  /** E-mail do administrador */
  email: varchar("email", { length: 320 }),

  /** Método de login utilizado (ex: "manus") */
  loginMethod: varchar("loginMethod", { length: 64 }),

  /**
   * Papel/função do usuário no sistema:
   * - "user": usuário comum (sem acesso ao painel admin)
   * - "admin": administrador com acesso total
   */
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),

  /** Data e hora em que o usuário foi criado no sistema */
  createdAt: timestamp("createdAt").defaultNow().notNull(),

  /** Data e hora da última atualização do registro */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),

  /** Data e hora do último login realizado */
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Exporta os tipos TypeScript inferidos da tabela users
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────────────────────
// TABELA: plans (Planos de Matrícula)
// Armazena os tipos de planos disponíveis na academia.
// Cada aluno será associado a um desses planos.
// ─────────────────────────────────────────────────────────────
export const plans = mysqlTable("plans", {
  /** Chave primária do plano */
  id: int("id").autoincrement().primaryKey(),

  /**
   * Tipo do plano — define a duração da matrícula:
   * - "monthly": Mensalidade (1 mês)
   * - "quarterly": Trimestral (3 meses)
   * - "semiannual": Semestral (6 meses)
   * - "annual": Anual (12 meses)
   */
  type: mysqlEnum("type", ["monthly", "quarterly", "semiannual", "annual"])
    .notNull()
    .unique(),

  /** Nome legível do plano para exibição na tela (ex: "Plano Mensal") */
  name: varchar("name", { length: 100 }).notNull(),

  /** Duração do plano em meses (1, 3, 6 ou 12) */
  durationMonths: int("durationMonths").notNull(),

  /**
   * Preço do plano em reais (com 2 casas decimais).
   * Ex: 89.90 = R$ 89,90
   */
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),

  /** Descrição opcional do plano para exibição ao usuário */
  description: text("description"),

  /** Data de criação do plano */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

// ─────────────────────────────────────────────────────────────
// TABELA: students (Alunos da Academia)
// Esta é a tabela principal do sistema. Armazena todos os dados
// cadastrais de cada aluno matriculado na academia.
// ─────────────────────────────────────────────────────────────
export const students = mysqlTable("students", {
  /** Chave primária: número único que identifica cada aluno */
  id: int("id").autoincrement().primaryKey(),

  /** Nome completo do aluno — campo obrigatório */
  name: varchar("name", { length: 255 }).notNull(),

  /** Idade do aluno em anos */
  age: int("age").notNull(),

  /**
   * Endereço completo do aluno.
   * Usamos text() pois endereços podem ser longos.
   */
  address: text("address").notNull(),

  /**
   * Telefone/celular do aluno para contato.
   * Armazenamos como texto para suportar formatações variadas.
   * Ex: "(11) 99999-9999"
   */
  phone: varchar("phone", { length: 20 }).notNull(),

  /** E-mail do aluno (opcional, mas útil para comunicação) */
  email: varchar("email", { length: 320 }),

  /**
   * Chave estrangeira (FK) que referencia a tabela `plans`.
   * Indica qual plano o aluno está inscrito.
   * Usamos int() pois armazenamos o ID do plano.
   */
  planId: int("planId").notNull(),

  /**
   * Status atual da mensalidade do aluno:
   * - "paid": Mensalidade paga e em dia
   * - "pending": Mensalidade pendente (ainda não venceu)
   * - "overdue": Mensalidade vencida (passou da data de vencimento)
   */
  paymentStatus: mysqlEnum("paymentStatus", ["paid", "pending", "overdue"])
    .default("pending")
    .notNull(),

  /**
   * Data de início da matrícula do aluno.
   * Usada para calcular o vencimento do plano.
   */
  startDate: timestamp("startDate").notNull(),

  /**
   * Data de vencimento da mensalidade atual.
   * Calculada automaticamente com base no plano escolhido.
   * O sistema usa esta data para gerar alertas de vencimento.
   */
  dueDate: timestamp("dueDate").notNull(),

  /**
   * Indica se o aluno está ativo na academia:
   * - true: Aluno ativo (frequentando)
   * - false: Aluno inativo (cancelou ou trancou matrícula)
   */
  isActive: boolean("isActive").default(true).notNull(),

  /** Observações gerais sobre o aluno (campo livre para o admin) */
  notes: text("notes"),

  /** Data e hora em que o cadastro do aluno foi criado */
  createdAt: timestamp("createdAt").defaultNow().notNull(),

  /** Data e hora da última atualização do cadastro */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

// ─────────────────────────────────────────────────────────────
// TABELA: payment_history (Histórico de Pagamentos)
// Registra cada pagamento realizado por um aluno.
// Isso permite rastrear o histórico financeiro de cada aluno.
// ─────────────────────────────────────────────────────────────
export const paymentHistory = mysqlTable("payment_history", {
  /** Chave primária do registro de pagamento */
  id: int("id").autoincrement().primaryKey(),

  /**
   * Chave estrangeira que referencia a tabela `students`.
   * Indica qual aluno realizou este pagamento.
   */
  studentId: int("studentId").notNull(),

  /**
   * Chave estrangeira que referencia a tabela `plans`.
   * Indica qual plano foi pago nesta transação.
   */
  planId: int("planId").notNull(),

  /**
   * Valor pago nesta transação (em reais, com 2 casas decimais).
   * Pode ser diferente do preço atual do plano (ex: desconto aplicado).
   */
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  /**
   * Data e hora em que o pagamento foi registrado no sistema.
   * Diferente de paymentDate, que é quando o aluno pagou de fato.
   */
  paidAt: timestamp("paidAt").defaultNow().notNull(),

  /**
   * Período de competência: início do período pago.
   * Ex: Se o aluno pagou o mês de abril, este campo = 01/04/2025
   */
  periodStart: timestamp("periodStart").notNull(),

  /**
   * Período de competência: fim do período pago.
   * Ex: Se o aluno pagou o mês de abril, este campo = 30/04/2025
   */
  periodEnd: timestamp("periodEnd").notNull(),

  /**
   * Método de pagamento utilizado:
   * - "cash": Dinheiro
   * - "card": Cartão (débito ou crédito)
   * - "pix": PIX
   * - "transfer": Transferência bancária
   */
  paymentMethod: mysqlEnum("paymentMethod", [
    "cash",
    "card",
    "pix",
    "transfer",
  ])
    .default("cash")
    .notNull(),

  /** Observações sobre este pagamento (ex: "Pagamento com desconto de 10%") */
  notes: text("notes"),

  /** Data e hora em que este registro foi criado */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof paymentHistory.$inferInsert;
