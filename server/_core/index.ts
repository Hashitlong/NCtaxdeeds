import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerAuthRoutes } from "./auth";
// import { registerSetupRoutes } from "./setup-team"; // Temporary - removed after setup
// import { registerDebugRoutes } from "./debug-auth"; // Temporary - removed after setup
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  try {
    console.log("[Server] Starting server...");
    console.log("[Server] NODE_ENV:", process.env.NODE_ENV);
    console.log("[Server] PORT:", process.env.PORT);
    console.log("[Server] DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
    
    const app = express();
    const server = createServer(app);
    
    // Configure body parser with larger size limit for file uploads
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    
    // Health check endpoint (Railway will use this for health checks)
    app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString()
      });
    });
    
    // Authentication routes
    console.log("[Server] Registering authentication routes...");
    registerAuthRoutes(app);
    
    // Setup routes for team member creation (removed after initial setup)
    // registerSetupRoutes(app);
    
    // Debug routes (removed after testing)
    // registerDebugRoutes(app);
    
    // OAuth callback under /api/oauth/callback (legacy)
    console.log("[Server] Registering OAuth routes...");
    registerOAuthRoutes(app);
  
  // Internal cron endpoint for automated scraping (no auth required)
  app.post("/api/internal/cron/scrape", async (req, res) => {
    try {
      // Simple internal secret check
      const secret = req.headers['x-cron-secret'] || req.query.secret;
      const expectedSecret = process.env.CRON_SECRET || 'internal-cron-secret-2024';
      
      if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { ScraperService } = await import('../scraperService');
      const service = new ScraperService();
      const result = await service.runScraper('all');
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        count: result.count,
        error: result.error,
      });
    } catch (error: any) {
      console.error('[Cron] Scrape failed:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    });
    
    // tRPC API
    console.log("[Server] Setting up tRPC API...");
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );
    
    // development mode uses Vite, production mode uses static files
    console.log("[Server] Setting up static files...");
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || "3000");
    console.log("[Server] Using port:", port);
    
    // In production (Railway), use the exact PORT provided and bind to all interfaces
    if (process.env.NODE_ENV === "production") {
      server.listen(port, "0.0.0.0", () => {
        console.log(`[Server] Server running on port ${port}`);
        console.log(`[Server] Health check available at http://0.0.0.0:${port}/health`);
      });
    } else {
      // In development, find available port
      const availablePort = await findAvailablePort(port);
      if (availablePort !== port) {
        console.log(`[Server] Port ${port} is busy, using port ${availablePort} instead`);
      }
      server.listen(availablePort, () => {
        console.log(`[Server] Server running on http://localhost:${availablePort}/`);
      });
    }
  } catch (error) {
    console.error("[Server] Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);
