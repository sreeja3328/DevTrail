import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";

import { clerk } from "./auth/clerkAuth";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

function assertProdKeys() {
  if (process.env.NODE_ENV !== "production") return;

  const publishable =
    process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;

  const badPub = publishable?.startsWith("pk_test_");
  const badSecret = secret?.startsWith("sk_test_");

  if (badPub || badSecret) {
    console.warn(
      "Warning: using Clerk test keys in production. Set live Clerk keys before going live.",
    );
  }
}

const app = express();
const httpServer = createServer(app);

assertProdKeys();

// 🔐 Clerk
app.use(clerk);

// 📦 Body parsers
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// Handle HEAD requests globally (e.g., uptime monitors)
app.use((req, res, next) => {
  if (req.method === "HEAD") {
    return res.status(200).end();
  }
  next();
});

// 📁 Static (for assets if any)
app.use(express.static(path.join(process.cwd(), "client/public")));

// 🪵 Logger
function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [${source}] ${message}`);
}

// 🚀 START SERVER IMMEDIATELY (Render requirement)
const port = Number(process.env.PORT) || 5000;

httpServer.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
});

// 🧠 Async setup AFTER server start
(async () => {
  try {
    await registerRoutes(httpServer, app);

    // ❌ Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // 🌍 Production vs Dev
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    log("App setup complete");
  } catch (err) {
    console.error("Startup error:", err);
  }
})();



