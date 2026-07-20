const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const apiClient = require('../../services/apiClient');

// ── Bootstrap Engine (Rust API calls this on startup) ─
const bootstrapEngine = asyncHandler(async (req, res) => {
  // Return rules, signatures, config directly — no gRPC callback
  sendSuccess(res, {
    yara_rules: {
      version: '0.1.0',
      compiled: [],
      cache_current: false,
    },
    signature_db: {
      version: '0.1.0',
      database: null,
      cache_current: false,
    },
    heuristic_rules: {
      suspicious_extensions: ['.scr', '.pif', '.vbs', '.exe', '.bat', '.cmd', '.com', '.msi'],
      suspicious_patterns: [
        'powershell -enc',
        'eval(base64_decode',
        'cmd.exe /c',
        'CreateObject("WScript.Shell")',
        'system32\\',
      ],
      suspicious_domains: [],
      risk_threshold: 0.5,
      enable_pe_analysis: true,
      enable_macro_analysis: true,
      enable_script_analysis: true,
    },
    config: {
      max_file_size_mb: 500,
      scan_timeout_ms: 30000,
      enable_heuristic_ai: false,
    },
  });
});

// ── Scan File ────────────────────────────────────────
const scanFile = asyncHandler(async (req, res) => {
  const { file_content, file_name, file_path, signature_db, compiled_yara_rules, heuristic_config, options } = req.body;

  const result = await apiClient.scanFile({
    fileContent: Buffer.from(file_content, 'base64'),
    fileName: file_name,
    filePath: file_path,
    signatureDb: signature_db,
    compiledYaraRules: compiled_yara_rules || [],
    heuristicConfig: heuristic_config,
    options: options,
  });

  sendSuccess(res, result);
});

// ── Match Hash ───────────────────────────────────────
const matchHash = asyncHandler(async (req, res) => {
  const { hash, signature_db } = req.body;

  const result = await apiClient.matchHash(hash, signature_db);
  sendSuccess(res, result);
});

// ── Run YARA ─────────────────────────────────────────
const runYara = asyncHandler(async (req, res) => {
  const { file_content, compiled_rules, timeout_ms } = req.body;

  const result = await apiClient.runYara(
    Buffer.from(file_content, 'base64'),
    compiled_rules || [],
    timeout_ms || 10000
  );

  sendSuccess(res, result);
});

// ── Analyze Process ──────────────────────────────────
const analyzeProcess = asyncHandler(async (req, res) => {
  const { memory_dump, process_id, process_name, compiled_yara_rules } = req.body;

  const result = await apiClient.scanFile({
    fileContent: Buffer.from(memory_dump, 'base64'),
    fileName: process_name,
    filePath: `process:${process_id}`,
    compiledYaraRules: compiled_yara_rules || [],
  });

  sendSuccess(res, result);
});

// ── Evaluate Firewall Connection ─────────────────────
const evaluateConnection = asyncHandler(async (req, res) => {
  const { connection, rules } = req.body;

  const result = await apiClient.evaluateConnection(connection, rules);
  sendSuccess(res, result);
});

// ── Compile Firewall Rules ───────────────────────────
const compileFirewallRules = asyncHandler(async (req, res) => {
  const { rules } = req.body;

  const result = await apiClient.compileFirewallRules(rules);
  sendSuccess(res, result);
});

// ── Generate VPN Keypair ─────────────────────────────
const generateVpnKeypair = asyncHandler(async (req, res) => {
  const result = await apiClient.generateKeypair();
  sendSuccess(res, result);
});

// ── Generate VPN Client Config ───────────────────────
const generateVpnClientConfig = asyncHandler(async (req, res) => {
  const result = await apiClient.generateClientConfig(req.body);
  sendSuccess(res, result);
});

// ── Generate VPN Gateway Config ──────────────────────
const generateVpnGatewayConfig = asyncHandler(async (req, res) => {
  const result = await apiClient.generateGatewayConfig(req.body);
  sendSuccess(res, result);
});

// ── Update Rules (Server pushes updates to Rust API) ─
const updateRules = asyncHandler(async (req, res) => {
  const result = await apiClient.updateRules(req.body);
  sendSuccess(res, result);
});

// ── Health Check ─────────────────────────────────────
const healthCheck = asyncHandler(async (req, res) => {
  const result = await apiClient.healthCheck();
  sendSuccess(res, result);
});

module.exports = {
  bootstrapEngine,
  scanFile,
  matchHash,
  runYara,
  analyzeProcess,
  evaluateConnection,
  compileFirewallRules,
  generateVpnKeypair,
  generateVpnClientConfig,
  generateVpnGatewayConfig,
  updateRules,
  healthCheck,
};