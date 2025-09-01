import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertToolSchema, insertLoanSchema, insertInventoryMovementSchema, loginSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(validatedData.username, validatedData.password);
      
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const { password, ...userWithoutPassword } = user;
      
      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.omit({ 
        lastLogin: true,
        createdAt: true,
        updatedAt: true 
      }).parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "E-mail já está em uso" });
      }

      const newUser = await storage.createUser({
        ...validatedData,
        role: validatedData.role || "operator",
        isActive: true,
      });

      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({
        message: "Usuário criado com sucesso",
        user: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  });

  // Create initial admin user if none exists
  app.post("/api/auth/setup", async (req, res) => {
    try {
      const existingAdmin = await storage.getUserByUsername("admin");
      if (existingAdmin) {
        return res.status(400).json({ message: "Sistema já configurado" });
      }

      const adminUser = await storage.createUser({
        username: "admin",
        email: "admin@obrastock.com",
        password: "admin123", // In production, this should be hashed
        role: "admin",
        worksite: "Depósito Central",
        isActive: true,
      });

      const { password, ...userWithoutPassword } = adminUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar usuário administrador" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const userWorksite = req.user.worksite;
      const stats = await storage.getDashboardStats(userWorksite);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar estatísticas" });
    }
  });

  // Tools routes
  app.get("/api/tools", authenticateToken, async (req: any, res) => {
    try {
      const userWorksite = req.user.worksite;
      const tools = await storage.getTools(userWorksite);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar ferramentas" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Ferramenta não encontrada" });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar ferramenta" });
    }
  });

  app.post("/api/tools", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertToolSchema.parse(req.body);
      
      // Check if code already exists
      const existingTool = await storage.getToolByCode(validatedData.code);
      if (existingTool) {
        return res.status(400).json({ message: "Código da ferramenta já existe" });
      }

      // Set the origin worksite to the user's worksite if not a transfer
      const toolWithWorksite = {
        ...validatedData,
        originWorksite: validatedData.entryType === "transfer" ? validatedData.originWorksite : req.user.worksite
      };

      const tool = await storage.createTool(toolWithWorksite);
      
      // Create inventory movement record
      const movementType = validatedData.entryType === "transfer" ? "transfer" : "entry";
      const movementDescription = validatedData.entryType === "transfer" 
        ? `Transferência de ${validatedData.originWorksite} - ${validatedData.name}`
        : `Entrada inicial - ${validatedData.name}`;

      await storage.createInventoryMovement({
        toolId: tool.id,
        type: movementType,
        quantity: validatedData.totalQuantity,
        description: movementDescription,
        originWorksite: toolWithWorksite.originWorksite,
      });

      res.status(201).json(tool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar ferramenta" });
    }
  });

  app.patch("/api/tools/:id", async (req, res) => {
    try {
      const updates = insertToolSchema.partial().parse(req.body);
      const updatedTool = await storage.updateTool(req.params.id, updates);
      
      if (!updatedTool) {
        return res.status(404).json({ message: "Ferramenta não encontrada" });
      }

      res.json(updatedTool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar ferramenta" });
    }
  });

  // Loans routes
  app.get("/api/loans", authenticateToken, async (req: any, res) => {
    try {
      const userWorksite = req.user.worksite;
      const loans = await storage.getLoans(userWorksite);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar empréstimos" });
    }
  });

  app.get("/api/loans/active", authenticateToken, async (req: any, res) => {
    try {
      const userWorksite = req.user.worksite;
      const activeLoans = await storage.getActiveLoans(userWorksite);
      res.json(activeLoans);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar empréstimos ativos" });
    }
  });

  app.get("/api/loans/overdue", authenticateToken, async (req: any, res) => {
    try {
      const userWorksite = req.user.worksite;
      const overdueLoans = await storage.getOverdueLoans(userWorksite);
      res.json(overdueLoans);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar empréstimos atrasados" });
    }
  });

  app.post("/api/loans", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertLoanSchema.parse(req.body);
      
      // Check if tool exists and has enough quantity
      const tool = await storage.getTool(validatedData.toolId);
      if (!tool) {
        return res.status(404).json({ message: "Ferramenta não encontrada" });
      }
      
      if (tool.availableQuantity < validatedData.quantity) {
        return res.status(400).json({ message: "Quantidade insuficiente em estoque" });
      }

      const loan = await storage.createLoan(validatedData);
      
      // Create inventory movement record
      await storage.createInventoryMovement({
        toolId: validatedData.toolId,
        type: "loan",
        quantity: -validatedData.quantity,
        description: `Empréstimo para ${validatedData.borrowerName}`,
        loanId: loan.id,
        originWorksite: req.user.worksite,
      });

      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar empréstimo" });
    }
  });

  app.patch("/api/loans/:id/return", async (req, res) => {
    try {
      const loan = await storage.returnLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ message: "Empréstimo não encontrado" });
      }

      // Create inventory movement record
      await storage.createInventoryMovement({
        toolId: loan.toolId,
        type: "return",
        quantity: loan.quantity,
        description: `Devolução de ${loan.borrowerName}`,
        loanId: loan.id,
      });

      res.json(loan);
    } catch (error) {
      res.status(500).json({ message: "Erro ao processar devolução" });
    }
  });

  // Inventory movements
  app.get("/api/inventory/movements", authenticateToken, async (req: any, res) => {
    try {
      const userWorksite = req.user.worksite;
      const movements = await storage.getInventoryMovements(userWorksite);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar movimentações" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
