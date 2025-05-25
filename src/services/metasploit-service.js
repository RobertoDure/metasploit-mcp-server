import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Service class for interacting with Metasploit Framework via command line
 */
export class MetasploitService {
  constructor() {
    // Base command for msfconsole with quiet mode and non-interactive mode
    this.msfCommand = 'msfconsole -q -n';
  }

  /**
   * Execute a Metasploit command
   * @param {string} command - The Metasploit command to execute
   * @returns {Promise<object>} - The result of the command execution
   */
  async executeCommand(command) {
    try {
      const fullCommand = `${this.msfCommand} -x "${command}" -x "exit"`;
      const { stdout, stderr } = await execAsync(fullCommand);
      
      if (stderr && stderr.trim() !== '') {
        return {
          success: false,
          output: stderr,
          error: 'Command execution failed'
        };
      }
      
      return {
        success: true,
        output: stdout
      };
    } catch (error) {
      return {
        success: false,
        output: error.message,
        error: 'Command execution failed'
      };
    }
  }

  /**
   * Search for exploits by name or CVE
   * @param {string} query - Search query
   * @returns {Promise<object>} - Search results
   */
  async searchExploit(query) {
    return this.executeCommand(`search ${query}`);
  }

  /**
   * Get information about a specific module
   * @param {string} modulePath - Full path to the module (e.g., exploit/windows/smb/ms17_010_eternalblue)
   * @returns {Promise<object>} - Module information
   */
  async getModuleInfo(modulePath) {
    return this.executeCommand(`info ${modulePath}`);
  }

  /**
   * List available modules by type
   * @param {string} type - Module type (exploit, auxiliary, post, payload, encoder, nop)
   * @returns {Promise<object>} - List of modules
   */
  async listModules(type) {
    if (!['exploit', 'auxiliary', 'post', 'payload', 'encoder', 'nop'].includes(type)) {
      return {
        success: false,
        error: 'Invalid module type',
        output: 'Valid types: exploit, auxiliary, post, payload, encoder, nop'
      };
    }
    
    return this.executeCommand(`show ${type}`);
  }

  /**
   * Get Metasploit version information
   * @returns {Promise<object>} - Version information
   */
  async getVersion() {
    return this.executeCommand('version');
  }

  /**
   * Run a nmap scan using Metasploit
   * @param {string} target - Target IP or hostname
   * @param {string} options - Additional nmap options
   * @returns {Promise<object>} - Scan results
   */
  async runNmapScan(target, options = '') {
    const command = `db_nmap ${options} ${target}`;
    return this.executeCommand(command);
  }

  /**
   * Run a vulnerability scan on a target
   * @param {string} target - Target IP or hostname
   * @returns {Promise<object>} - Scan results
   */
  async runVulnScan(target) {
    // This uses the auxiliary/scanner/smb/smb_ms17_010 module as an example
    const command = `use auxiliary/scanner/smb/smb_ms17_010; set RHOSTS ${target}; run; back`;
    return this.executeCommand(command);
  }
}