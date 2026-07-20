const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', 'proto');

const packageDefinition = protoLoader.loadSync(
  [
    'common.proto',
    'scan.proto',
    'firewall.proto',
    'vpn.proto',
    'bootstrap.proto',
  ].map((f) => path.join(PROTO_PATH, f)),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const nexguard = grpc.loadPackageDefinition(packageDefinition).nexguard;

const getClient = (service) => {
  const endpoint = process.env.NEXGUARD_GRPC_ENDPOINT || 'localhost:50051';
  const ServiceClient = nexguard[service];
  return new ServiceClient(endpoint, grpc.credentials.createInsecure());
};

const scanClient = () => getClient('ScanEngine');
const firewallClient = () => getClient('FirewallEngine');
const vpnClient = () => getClient('VpnEngine');
const bootstrapClient = () => getClient('BootstrapService');

module.exports = { scanClient, firewallClient, vpnClient, bootstrapClient };