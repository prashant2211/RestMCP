import express from "express";
import { z } from "zod";

const router = express.Router();

// POST /200OK/MCP/describe — Make.com fetches schema here
router.post('/MCP/describe', (req, res) => {
  res.json({
    name: "Custom MCP Server",
    version: "1.0.0",
    description: "Compatible with Make.com / n8n",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string" }
      },
      required: ["prompt"]
    },
    outputSchema: {
      type: "object",
      properties: {
        answer: { type: "string" }
      }
    }
  });
});

// POST /MCP/prompt — Handles both Make (JSON-RPC) and manual (flat) calls
router.post("/MCP/prompt", async (req, res) => {
    console.log(`inside prompt -=-=-`);
  const jsonRpcSchema = z.object({
    jsonrpc: z.literal("2.0"),
    method: z.string(),
    id: z.union([z.string(), z.number()]),
    params: z.object({
      prompt: z.string(),
    }),
  });

  const flatSchema = z.object({
    prompt: z.string(),
  });

  try {
    if (jsonRpcSchema.safeParse(req.body).success) {
        console.log(`inside if con -=-=-=`);
      const { id, params } = jsonRpcSchema.parse(req.body);
      const { prompt } = params;
      console.log(`prompt -=-=-= ${prompt}`);
      const answer = `You said: ${prompt}`;
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          answer,
        },
      });
    }

    if (flatSchema.safeParse(req.body).success) {
      const { prompt } = flatSchema.parse(req.body);
      const answer = `You said: ${prompt}`;
      return res.json({ answer });
    }

    // If both failed
    return res.status(400).json({
      code: 400,
      success: false,
      error: "❌ 'prompt' is required in the request body.",
    });
  } catch (e) {
    console.error("❌ Unexpected error:", e);
    return res.status(500).json({
      code: 500,
      success: false,
      error: "🚨 Internal server error.",
    });
  }
});

// Optional health check
router.get('/MCP/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
