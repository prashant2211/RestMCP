import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getWeatherData,
  getMovieRating,
  getSalesforceRecord,
  createSalesforceAccountRecord,
  genericSalesforceCall
} from "./mcpTools.js";

// ✅ Create MCP server
const server = new McpServer({
  name: "smart-server",
  version: "1.0.0",
});

// ✅ Track tool handlers manually
const toolRegistry = new Map();

// ✅ Wrapper to register tools with logging
function registerTool(name, schema, impl) {
  server.tool(name, schema, impl);
  toolRegistry.set(name, impl);
}

// ✅ Explicit registration function you must call
export const initializeTools = () => {
  registerTool("getWeatherData", z.object({ city: z.string(), token: z.string() }), getWeatherData);
  registerTool("getMovieRating", z.object({ title: z.string(), token: z.string() }), getMovieRating);
  registerTool("getSalesforceRecord", z.object({ objectName: z.string(), token: z.string() }), getSalesforceRecord);
  registerTool("createSalesforceAccountRecord", z.object({ name: z.string() }), createSalesforceAccountRecord);

  registerTool(
    "genericSalesforceCall",
    z.object({
      channelName: z.string(),
      params: z.record(z.any()),
      token: z.string().optional()
    }),
    genericSalesforceCall
  );

};

// ✅ Helper methods for managing tools
server.hasTool = (toolName) => toolRegistry.has(toolName);

server.invokeTool = async (toolName, params) => {
  const impl = toolRegistry.get(toolName);
  if (!impl) {
    console.error(`❌ Tool "${toolName}" not found`);
    console.error(`Available tools: ${[...toolRegistry.keys()].join(", ")}`);
    throw new Error(`Tool "${toolName}" not registered`);
  }

  return await impl(params);
};

export default server;
