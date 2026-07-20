const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const VpnSession = require('../../models/client/VpnSession');
const apiClient = require('../../services/apiClient');
const emailService = require('../../services/emailService');
const socketService = require('../../services/socketService');

const getGateways = asyncHandler(async (req, res) => {
  sendSuccess(res, [
    { id: 'us-east', name: 'US East', region: 'United States', ip: '104.x.x.x', port: 51820 },
    { id: 'eu-west', name: 'EU West', region: 'Europe', ip: '185.x.x.x', port: 51820 },
  ]);
});

const connect = asyncHandler(async (req, res) => {
  const { gatewayId } = req.body;
  const kp = await apiClient.generateKeypair();

  const config = await apiClient.generateClientConfig({
    clientPrivateKey: kp.privateKey,
    gatewayPublicKey: 'gateway-pub-key-placeholder',
    gatewayEndpoint: '104.x.x.x',
    gatewayPort: 51820,
    assignedIp: '10.10.0.45',
    dnsServers: ['1.1.1.1', '8.8.8.8'],
    allowedIps: ['0.0.0.0/0'],
    killSwitch: req.body.killSwitch || false,
  });

  const session = await VpnSession.create({
    user: req.user._id,
    gatewayId,
    gatewayName: req.body.gatewayName || 'Unknown',
    assignedIp: '10.10.0.45',
    connectedAt: new Date(),
    killSwitchEnabled: req.body.killSwitch || false,
    status: 'connected',
  });

  try {
    await emailService.send({
      type: 'vpnSessionAlert',
      to: req.user.email,
      data: {
        gateway: req.body.gatewayName || 'Unknown',
        assignedIp: '10.10.0.45',
        device: req.body.device || 'Unknown',
        killSwitch: req.body.killSwitch,
      },
    });
    console.log(`  \x1b[32m✅ VPN connected email sent to: ${req.user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send VPN email: ${err.message}\x1b[0m`);
  }

  socketService.vpnConnected(req.user._id.toString(), session);

  sendSuccess(res, { config, session });
});

const disconnect = asyncHandler(async (req, res) => {
  await VpnSession.findOneAndUpdate(
    { user: req.user._id, status: 'connected' },
    { status: 'disconnected', disconnectedAt: new Date() }
  );

  socketService.vpnDisconnected(req.user._id.toString());
  sendSuccess(res, { message: 'Disconnected' });
});

const getStatus = asyncHandler(async (req, res) => {
  const session = await VpnSession.findOne({ user: req.user._id, status: 'connected' });
  sendSuccess(res, { connected: !!session, session });
});

const getBandwidthUsage = asyncHandler(async (req, res) => {
  const sessions = await VpnSession.find({ user: req.user._id });
  const totalUp = sessions.reduce((sum, s) => sum + s.bytesUp, 0);
  const totalDown = sessions.reduce((sum, s) => sum + s.bytesDown, 0);
  sendSuccess(res, { totalUp, totalDown, totalSessions: sessions.length });
});

module.exports = { getGateways, connect, disconnect, getStatus, getBandwidthUsage };