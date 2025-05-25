# Metasploit MCP Server

This Model Context Protocol (MCP) server enables AI assistants to interact with and execute Metasploit Framework commands through a standardized interface. The server wraps Metasploit functionality into MCP tools that can be discovered and used by compatible clients like Claude.

## Features

- **Execute raw Metasploit commands** directly through the MCP interface
- **Search for exploits** by name, CVE, or other criteria
- **Get detailed module information** for any Metasploit module
- **List available modules** by type (exploits, auxiliaries, payloads, etc.)
- **Run network scans** using Nmap through Metasploit
- **Execute vulnerability scans** on target systems
- **Get version information** for your Metasploit installation

## Requirements

- Node.js 16.x or higher
- Metasploit Framework installed and accessible from the command line
- MCP compatible client (like Claude Desktop)

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

Start the MCP server:

```bash
npm start
```

The server uses STDIO transport for communication, making it compatible with MCP clients that support this transport method.


## Available Tools

This MCP server exposes the following tools:

| Tool Name | Description | Required Arguments | Optional Arguments |
|-----------|-------------|-------------------|-------------------|
| `execute-command` | Execute a raw Metasploit command | `command` (string) | None |
| `search-exploit` | Search for exploits by name or CVE | `query` (string) | None |
| `module-info` | Get information about a specific module | `modulePath` (string) | None |
| `list-modules` | List modules by type | `type` (enum: exploit, auxiliary, post, payload, encoder, nop) | None |
| `get-version` | Get Metasploit version information | None | None |
| `run-nmap-scan` | Run a network scan using Nmap | `target` (string) | `options` (string) |
| `run-vuln-scan` | Run a vulnerability scan on a target | `target` (string) | None |

## Example Usage

When connected to an MCP-compatible client like Claude Desktop, you can use natural language to interact with Metasploit:

- "Search for exploits related to Apache Log4j"
- "Show me information about the EternalBlue exploit"
- "List all available payloads in Metasploit"
- "Run an Nmap scan against 192.168.1.100"
- "Perform a vulnerability scan on 10.0.0.25"
- "What version of Metasploit am I running?"

## Architecture

This server follows a clean architecture pattern:

- `src/index.js` - Main MCP server implementation that defines tools and their handlers
- `src/services/metasploit-service.js` - Service layer that interacts with the Metasploit Framework

## Configuration

The server uses the following configuration from package.json:

```json
{
  "name": "metasploit-mcp-server",
  "version": "1.0.0",
  "description": "Model Context Protocol server for Metasploit Framework",
  "type": "module",
  "main": "src/index.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "zod": "^3.22.4"
  }
}
```

## Security Considerations

This MCP server executes commands on your system through Metasploit. Please be aware of the following security considerations:

- The server will execute any valid Metasploit command provided to it
- Consider running this in a controlled environment
- By default, this server uses no authentication - consider adding authentication for production use
- Be cautious when allowing remote connections to this server
- Metasploit's functionality can include scanning and exploiting systems - ensure you have proper authorization

## Development

Run tests:

```bash
npm test

```

## Integration with VS Code

For VS Code integration, the configuration is in `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "metasploit-mcp-server": {
      "command": "npm",
      "args": [
        "start",
        "metasploit-mcp-server",
        "--prefix",
        "your/path/metasploit-mcp-server"
      ],
      "env": {
        "MCP_SERVER_PORT": "3003"
      }
    }
  }
}
```

### Adding New Tools

To add a new Metasploit capability:

1. Add a method to the `MetasploitService` class
2. Define a schema in `index.js` for the new tool
3. Add the tool to the tools list in the `tools/list` handler
4. Implement the request handler for the new tool

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.