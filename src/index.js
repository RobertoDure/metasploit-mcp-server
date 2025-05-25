import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MetasploitService } from "./services/metasploit-service.js";

// Create the MCP server instance
const server = new Server(
  {
    name: "metasploit-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize the Metasploit service
const metasploitService = new MetasploitService();

// Define request schemas for different Metasploit functionalities

// Schema for executing raw Metasploit commands
const executeCommandSchema = z.object({
  method: z.literal("tools/invoke"),
  params: z.object({
    name: z.literal("execute-command"),
    arguments: z.object({
      command: z.string(),
    }),
  }),
});

// Schema for searching exploits
const searchExploitSchema = z.object({
  method: z.literal("tools/invoke"),
  params: z.object({
    name: z.literal("search-exploit"),
    arguments: z.object({
      query: z.string(),
    }),
  }),
});

// Schema for getting module info
const getModuleInfoSchema = z.object({
  method: z.literal("tools/invoke"),
  params: z.object({
    name: z.literal("module-info"),
    arguments: z.object({
      modulePath: z.string(),
    }),
  }),
});

// Schema for listing modules
const listModulesSchema = z.object({
  method: z.literal("tools/invoke"),
  params: z.object({
    name: z.literal("list-modules"),
    arguments: z.object({
      type: z.enum(["exploit", "auxiliary", "post", "payload", "encoder", "nop"]),
    }),
  }),
});

// Schema for getting Metasploit version
const getVersionSchema = z.object({
  method: z.literal("tools/invoke"),
  params: z.object({
    name: z.literal("get-version"),
    arguments: z.object({}),
  }),
});

// Schema for running nmap scan
const runNmapScanSchema = z.object({
  method: z.literal("tools/invoke"),
  params: z.object({
    name: z.literal("run-nmap-scan"),
    arguments: z.object({
      target: z.string(),
      options: z.string().optional(),
    }),
  }),
});

// Schema for vulnerability scan
const runVulnScanSchema = z.object({
  method: z.literal("tools/invoke"),
  params: z.object({
    name: z.literal("run-vuln-scan"),
    arguments: z.object({
      target: z.string(),
    }),
  }),
});

// Define the list of available tools
const toolsListSchema = z.object({
  method: z.literal("tools/list"),
});

// Set up MCP handler for tools/list request
server.setRequestHandler(toolsListSchema, async () => {
  return {
    tools: [
      {
        name: "execute-command",
        description: "Execute a raw Metasploit command",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "The Metasploit command to execute"
            }
          },
          required: ["command"]
        }
      },
      {
        name: "search-exploit",
        description: "Search for exploits by name or CVE",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (e.g., name, CVE number)"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "module-info",
        description: "Get information about a specific Metasploit module",
        inputSchema: {
          type: "object",
          properties: {
            modulePath: {
              type: "string",
              description: "Full path to the module (e.g., exploit/windows/smb/ms17_010_eternalblue)"
            }
          },
          required: ["modulePath"]
        }
      },
      {
        name: "list-modules",
        description: "List available modules by type",
        inputSchema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "Module type (exploit, auxiliary, post, payload, encoder, nop)",
              enum: ["exploit", "auxiliary", "post", "payload", "encoder", "nop"]
            }
          },
          required: ["type"]
        }
      },
      {
        name: "get-version",
        description: "Get Metasploit version information",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "run-nmap-scan",
        description: "Run a nmap scan using Metasploit",
        inputSchema: {
          type: "object",
          properties: {
            target: {
              type: "string",
              description: "Target IP or hostname"
            },
            options: {
              type: "string",
              description: "Additional nmap options"
            }
          },
          required: ["target"]
        }
      },
      {
        name: "run-vuln-scan",
        description: "Run a vulnerability scan on a target",
        inputSchema: {
          type: "object",
          properties: {
            target: {
              type: "string",
              description: "Target IP or hostname"
            }
          },
          required: ["target"]
        }
      }
    ]
  };
});

// Set up MCP handler for execute-command
server.setRequestHandler(executeCommandSchema, async (request) => {
  const { command } = request.params.arguments;
  const result = await metasploitService.executeCommand(command);
  return { result };
});

// Set up MCP handler for search-exploit
server.setRequestHandler(searchExploitSchema, async (request) => {
  const { query } = request.params.arguments;
  const result = await metasploitService.searchExploit(query);
  return { result };
});

// Set up MCP handler for module-info
server.setRequestHandler(getModuleInfoSchema, async (request) => {
  const { modulePath } = request.params.arguments;
  const result = await metasploitService.getModuleInfo(modulePath);
  return { result };
});

// Set up MCP handler for list-modules
server.setRequestHandler(listModulesSchema, async (request) => {
  const { type } = request.params.arguments;
  const result = await metasploitService.listModules(type);
  return { result };
});

// Set up MCP handler for get-version
server.setRequestHandler(getVersionSchema, async () => {
  const result = await metasploitService.getVersion();
  return { result };
});

// Set up MCP handler for run-nmap-scan
server.setRequestHandler(runNmapScanSchema, async (request) => {
  const { target, options = "" } = request.params.arguments;
  const result = await metasploitService.runNmapScan(target, options);
  return { result };
});

// Set up MCP handler for run-vuln-scan
server.setRequestHandler(runVulnScanSchema, async (request) => {
  const { target } = request.params.arguments;
  const result = await metasploitService.runVulnScan(target);
  return { result };
});

// Set up the STDIO transport and connect the server
const transport = new StdioServerTransport();
server.connect(transport)
  .then(() => {
    console.log("Metasploit MCP server running...");
  })
  .catch((error) => {
    console.error("Failed to start Metasploit MCP server:", error);
    process.exit(1);
  });