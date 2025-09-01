import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operator"), // admin, manager, operator
  worksite: text("worksite"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tools = pgTable("tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  category: text("category").notNull(),
  totalQuantity: integer("total_quantity").notNull().default(0),
  availableQuantity: integer("available_quantity").notNull().default(0),
  unitPrice: decimal("unit_price"),
  supplier: text("supplier"),
  purchaseDate: timestamp("purchase_date"),
  notes: text("notes"),
  entryType: text("entry_type").notNull().default("purchase"), // purchase, transfer
  originWorksite: text("origin_worksite"), // para transferências
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: varchar("tool_id").notNull().references(() => tools.id),
  borrowerName: text("borrower_name").notNull(),
  borrowerTeam: text("borrower_team"),
  borrowerContact: text("borrower_contact"),
  quantity: integer("quantity").notNull().default(1),
  loanDate: timestamp("loan_date").notNull().default(sql`CURRENT_TIMESTAMP`),
  expectedReturnDate: timestamp("expected_return_date").notNull(),
  actualReturnDate: timestamp("actual_return_date"),
  status: text("status").notNull().default("active"), // active, returned, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: varchar("tool_id").notNull().references(() => tools.id),
  type: text("type").notNull(), // entry, exit, loan, return, transfer
  quantity: integer("quantity").notNull(),
  description: text("description"),
  userId: varchar("user_id").references(() => users.id),
  loanId: varchar("loan_id").references(() => loans.id),
  originWorksite: text("origin_worksite"), // para transferências
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const userRoles = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  OPERATOR: 'operator' as const,
} as const;

export type UserRole = typeof userRoles[keyof typeof userRoles];

export const rolePermissions = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_transfers'],
  manager: ['read', 'write', 'manage_transfers'],
  operator: ['read', 'write'],
} as const;

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  actualReturnDate: true,
  status: true,
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof tools.$inferSelect;

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;

// Extended types for frontend use
export type ToolWithLoanInfo = Tool & {
  currentLoans?: number;
  overdueLoans?: number;
};

export type LoanWithToolInfo = Loan & {
  toolName?: string;
  toolCode?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
};
