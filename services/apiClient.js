const grpc = require('@grpc/grpc-js');
const { scanClient, firewallClient, vpnClient, bootstrapClient } = require('../config/grpc');

// ── Scan ─────────────────────────────────────────────
const scanFile = (payload) => {
  return new Promise((resolve, reject) => {
    scanClient().ScanFile(payload, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

const matchHash = (hash, signatureDb) => {
  return new Promise((resolve, reject) => {
    scanClient().MatchHash({ hash, signatureDb }, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

const runYara = (fileContent, compiledRules, timeoutMs) => {
  return new Promise((resolve, reject) => {
    scanClient().RunYara(
      { fileContent, compiledRules, timeoutMs },
      (error, response) => {
        if (error) return reject(error);
        resolve(response);
      }
    );
  });
};

// ── Firewall ─────────────────────────────────────────
const evaluateConnection = (connection, rules) => {
  return new Promise((resolve, reject) => {
    firewallClient().EvaluateConnection(
      { connection, rules },
      (error, response) => {
        if (error) return reject(error);
        resolve(response);
      }
    );
  });
};

const compileFirewallRules = (rules) => {
  return new Promise((resolve, reject) => {
    firewallClient().CompileRules({ rules }, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

// ── VPN ──────────────────────────────────────────────
const generateKeypair = () => {
  return new Promise((resolve, reject) => {
    vpnClient().GenerateKeypair({}, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

const generateClientConfig = (payload) => {
  return new Promise((resolve, reject) => {
    vpnClient().GenerateClientConfig(payload, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

const generateGatewayConfig = (payload) => {
  return new Promise((resolve, reject) => {
    vpnClient().GenerateGatewayConfig(payload, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

// ── Bootstrap ────────────────────────────────────────
const bootstrap = (payload) => {
  return new Promise((resolve, reject) => {
    bootstrapClient().Bootstrap(payload, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

const updateRules = (payload) => {
  return new Promise((resolve, reject) => {
    bootstrapClient().UpdateRules(payload, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

const healthCheck = () => {
  return new Promise((resolve, reject) => {
    bootstrapClient().HealthCheck({}, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

module.exports = {
  scanFile,
  matchHash,
  runYara,
  evaluateConnection,
  compileFirewallRules,
  generateKeypair,
  generateClientConfig,
  generateGatewayConfig,
  bootstrap,
  updateRules,
  healthCheck,
};