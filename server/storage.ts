import { type User, type InsertUser, type Tool, type InsertTool, type Loan, type InsertLoan, type InventoryMovement, type InsertInventoryMovement, type ToolWithLoanInfo, type LoanWithToolInfo } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | null>;

  // Tools
  getTools(worksite?: string): Promise<ToolWithLoanInfo[]>;
  getTool(id: string): Promise<Tool | undefined>;
  getToolByCode(code: string): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, tool: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: string): Promise<boolean>;

  // Loans
  getLoans(worksite?: string): Promise<LoanWithToolInfo[]>;
  getLoan(id: string): Promise<Loan | undefined>;
  getActiveLoans(worksite?: string): Promise<LoanWithToolInfo[]>;
  getOverdueLoans(worksite?: string): Promise<LoanWithToolInfo[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, loan: Partial<Loan>): Promise<Loan | undefined>;
  returnLoan(id: string): Promise<Loan | undefined>;

  // Inventory Movements
  getInventoryMovements(worksite?: string): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;

  // Dashboard stats
  getDashboardStats(worksite?: string): Promise<{
    totalTools: number;
    lentTools: number;
    lowStockCount: number;
    overdueReturns: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tools: Map<string, Tool>;
  private loans: Map<string, Loan>;
  private inventoryMovements: Map<string, InventoryMovement>;

  constructor() {
    this.users = new Map();
    this.tools = new Map();
    this.loans = new Map();
    this.inventoryMovements = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      role: insertUser.role || "operator",
      worksite: insertUser.worksite || null,
      isActive: insertUser.isActive ?? true,
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      username: userUpdate.username ?? existingUser.username,
      email: userUpdate.email ?? existingUser.email,
      password: userUpdate.password ?? existingUser.password,
      role: userUpdate.role ?? existingUser.role,
      worksite: userUpdate.worksite ?? existingUser.worksite,
      isActive: userUpdate.isActive ?? existingUser.isActive,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || !user.isActive) return null;
    
    // In a real app, you'd use bcrypt to compare hashed passwords
    if (user.password === password) {
      // Update last login
      const updatedUser = { ...user, lastLogin: new Date() };
      this.users.set(user.id, updatedUser);
      return updatedUser;
    }
    
    return null;
  }

  // Tools
  async getTools(worksite?: string): Promise<ToolWithLoanInfo[]> {
    const allTools = Array.from(this.tools.values());
    const allLoans = Array.from(this.loans.values());
    
    // Filter tools by worksite if provided
    const filteredTools = worksite ? 
      allTools.filter(tool => tool.originWorksite === worksite || tool.originWorksite === null) : 
      allTools;
    
    return filteredTools.map(tool => {
      const toolLoans = allLoans.filter(loan => loan.toolId === tool.id);
      const currentLoans = toolLoans.filter(loan => loan.status === 'active').length;
      const overdueLoans = toolLoans.filter(loan => 
        loan.status === 'active' && new Date() > new Date(loan.expectedReturnDate)
      ).length;
      
      return {
        ...tool,
        currentLoans,
        overdueLoans,
      };
    });
  }

  async getTool(id: string): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async getToolByCode(code: string): Promise<Tool | undefined> {
    return Array.from(this.tools.values()).find(tool => tool.code === code);
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = randomUUID();
    const now = new Date();
    const tool: Tool = {
      id,
      name: insertTool.name,
      code: insertTool.code,
      category: insertTool.category,
      totalQuantity: insertTool.totalQuantity || 0,
      availableQuantity: insertTool.availableQuantity || insertTool.totalQuantity || 0,
      unitPrice: insertTool.unitPrice || null,
      supplier: insertTool.supplier || null,
      purchaseDate: insertTool.purchaseDate || null,
      notes: insertTool.notes || null,
      entryType: insertTool.entryType || "compra",
      originWorksite: insertTool.originWorksite || null,
      createdAt: now,
      updatedAt: now,
    };
    this.tools.set(id, tool);
    return tool;
  }

  async updateTool(id: string, toolUpdate: Partial<InsertTool>): Promise<Tool | undefined> {
    const existingTool = this.tools.get(id);
    if (!existingTool) return undefined;
    
    const updatedTool: Tool = {
      ...existingTool,
      ...toolUpdate,
      updatedAt: new Date(),
    };
    this.tools.set(id, updatedTool);
    return updatedTool;
  }

  async deleteTool(id: string): Promise<boolean> {
    return this.tools.delete(id);
  }

  // Loans
  async getLoans(worksite?: string): Promise<LoanWithToolInfo[]> {
    const allLoans = Array.from(this.loans.values());
    const allTools = Array.from(this.tools.values());
    
    return allLoans
      .filter(loan => {
        if (!worksite) return true;
        const tool = allTools.find(t => t.id === loan.toolId);
        return tool && (tool.originWorksite === worksite || tool.originWorksite === null);
      })
      .map(loan => {
        const tool = allTools.find(t => t.id === loan.toolId);
        const isOverdue = loan.status === 'active' && new Date() > new Date(loan.expectedReturnDate);
        const daysOverdue = isOverdue ? 
          Math.floor((new Date().getTime() - new Date(loan.expectedReturnDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        return {
          ...loan,
          toolName: tool?.name,
          toolCode: tool?.code,
          isOverdue,
          daysOverdue,
        };
      });
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async getActiveLoans(worksite?: string): Promise<LoanWithToolInfo[]> {
    const allLoans = await this.getLoans(worksite);
    return allLoans.filter(loan => loan.status === 'active');
  }

  async getOverdueLoans(worksite?: string): Promise<LoanWithToolInfo[]> {
    const allLoans = await this.getLoans(worksite);
    return allLoans.filter(loan => loan.isOverdue);
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = randomUUID();
    const now = new Date();
    const loan: Loan = {
      id,
      toolId: insertLoan.toolId,
      borrowerName: insertLoan.borrowerName,
      borrowerTeam: insertLoan.borrowerTeam || null,
      borrowerContact: insertLoan.borrowerContact || null,
      quantity: insertLoan.quantity || 1,
      loanDate: insertLoan.loanDate || now,
      expectedReturnDate: insertLoan.expectedReturnDate,
      notes: insertLoan.notes || null,
      status: 'active',
      actualReturnDate: null,
      createdAt: now,
      updatedAt: now,
    };
    this.loans.set(id, loan);

    // Update tool available quantity
    const tool = this.tools.get(insertLoan.toolId);
    if (tool) {
      const updatedTool = {
        ...tool,
        availableQuantity: tool.availableQuantity - (insertLoan.quantity || 1),
        updatedAt: now,
      };
      this.tools.set(tool.id, updatedTool);
    }

    return loan;
  }

  async updateLoan(id: string, loanUpdate: Partial<Loan>): Promise<Loan | undefined> {
    const existingLoan = this.loans.get(id);
    if (!existingLoan) return undefined;
    
    const updatedLoan: Loan = {
      ...existingLoan,
      ...loanUpdate,
      updatedAt: new Date(),
    };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  async returnLoan(id: string): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;

    const now = new Date();
    const updatedLoan: Loan = {
      ...loan,
      status: 'returned',
      actualReturnDate: now,
      updatedAt: now,
    };
    this.loans.set(id, updatedLoan);

    // Update tool available quantity
    const tool = this.tools.get(loan.toolId);
    if (tool) {
      const updatedTool = {
        ...tool,
        availableQuantity: tool.availableQuantity + loan.quantity,
        updatedAt: now,
      };
      this.tools.set(tool.id, updatedTool);
    }

    return updatedLoan;
  }

  // Inventory Movements
  async getInventoryMovements(worksite?: string): Promise<InventoryMovement[]> {
    const allMovements = Array.from(this.inventoryMovements.values());
    
    if (!worksite) return allMovements;
    
    return allMovements.filter(movement => 
      movement.originWorksite === worksite || movement.originWorksite === null
    );
  }

  async createInventoryMovement(insertMovement: InsertInventoryMovement): Promise<InventoryMovement> {
    const id = randomUUID();
    const movement: InventoryMovement = {
      id,
      type: insertMovement.type,
      toolId: insertMovement.toolId,
      quantity: insertMovement.quantity,
      originWorksite: insertMovement.originWorksite || null,
      description: insertMovement.description || null,
      userId: insertMovement.userId || null,
      loanId: insertMovement.loanId || null,
      createdAt: new Date(),
    };
    this.inventoryMovements.set(id, movement);
    return movement;
  }

  // Dashboard stats
  async getDashboardStats(worksite?: string): Promise<{
    totalTools: number;
    lentTools: number;
    lowStockCount: number;
    overdueReturns: number;
  }> {
    const allTools = Array.from(this.tools.values());
    const allLoans = Array.from(this.loans.values());
    
    // Filter by worksite if provided
    const filteredTools = worksite ? 
      allTools.filter(tool => tool.originWorksite === worksite || tool.originWorksite === null) : 
      allTools;
      
    const filteredLoans = worksite ? 
      allLoans.filter(loan => {
        const tool = allTools.find(t => t.id === loan.toolId);
        return tool && (tool.originWorksite === worksite || tool.originWorksite === null);
      }) : allLoans;
    
    const totalTools = filteredTools.reduce((sum, tool) => sum + tool.totalQuantity, 0);
    const lentTools = filteredLoans
      .filter(loan => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.quantity, 0);
    const lowStockCount = filteredTools.filter(tool => tool.availableQuantity <= 2).length;
    const overdueReturns = filteredLoans.filter(loan => 
      loan.status === 'active' && new Date() > new Date(loan.expectedReturnDate)
    ).length;

    return {
      totalTools,
      lentTools,
      lowStockCount,
      overdueReturns,
    };
  }
}

export const storage = new MemStorage();
