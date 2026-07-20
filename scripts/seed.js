require('./dnsSet');
require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Plan = require('../models/admin/Plan');
const PaymentMethod = require('../models/admin/PaymentMethod');
const Setting = require('../models/admin/Setting');
const Admin = require('../models/admin/Admin');
const Legal = require('../models/admin/Legal');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

// ── Connect ──────────────────────────────────────────
const connect = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexguard';
  await mongoose.connect(uri);
  console.log(`[DB] Connected: ${uri}\n`);
};

// ── Show Menu ───────────────────────────────────────
const showMenu = () => {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│           NEXGUARD SEEDER                   │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│  1. Seed All                                │');
  console.log('│  2. Seed Plans                              │');
  console.log('│  3. Seed Payment Methods                    │');
  console.log('│  4. Seed Settings                           │');
  console.log('│  5. Seed YARA Rules (placeholder)           │');
  console.log('│  6. Seed Legal Docs                         │');
  console.log('│  7. Seed Admin Account                      │');
  console.log('│  0. Exit                                    │');
  console.log('└─────────────────────────────────────────────┘');
};

// ── Seed Plans ──────────────────────────────────────
const seedPlans = async () => {
  const count = await Plan.countDocuments();
  if (count > 0) {
    const overwrite = await question(`Plans collection has ${count} document(s). Overwrite? (y/n): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipped plans.\n');
      return;
    }
    await Plan.deleteMany({});
  }

await Plan.insertMany([
  {
    name: 'Free Trial',
    pricing: { monthly: 0, yearly: 0, oneTime: 0 },
    currency: 'USD',
    trialDays: 30,
    deviceLimit: 1,
    scansPerDay: 5,
    vpnIncluded: false,
    bandwidthLimitGB: 0,
    features: ['Real-time Protection', 'File Scanning', '5 Scans/Day', 'Basic Firewall'],
    isActive: true,
    isPopular: false,
    sortOrder: 1,
  },
  {
    name: 'Pro',
    pricing: { monthly: 9.99, yearly: 99.99, oneTime: 199.99 },
    currency: 'USD',
    deviceLimit: 3,
    scansPerDay: 100,
    vpnIncluded: true,
    bandwidthLimitGB: 100,
    features: ['Unlimited Scans', 'VPN Included', 'Advanced Firewall', 'Process Scanner', '100GB VPN Bandwidth', 'Priority Support'],
    isActive: true,
    isPopular: true,
    sortOrder: 2,
  },
  {
    name: 'Enterprise',
    pricing: { monthly: 29.99, yearly: 299.99, oneTime: 499.99 },
    currency: 'USD',
    deviceLimit: 10,
    scansPerDay: 999,
    vpnIncluded: true,
    bandwidthLimitGB: 500,
    features: ['Unlimited Everything', 'VPN + Kill Switch', 'AI Threat Analysis', 'Dedicated Support', '500GB VPN Bandwidth', 'API Access', 'Custom Rules'],
    isActive: true,
    isPopular: false,
    sortOrder: 3,
  },
]);
  console.log('✅ Plans seeded (Free Trial, Pro, Enterprise).\n');
};

// ── Seed Payment Methods ─────────────────────────────
const seedPaymentMethods = async () => {
  const count = await PaymentMethod.countDocuments();
  if (count > 0) {
    const overwrite = await question(`PaymentMethods has ${count} document(s). Overwrite? (y/n): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipped payment methods.\n');
      return;
    }
    await PaymentMethod.deleteMany({});
  }

  await PaymentMethod.insertMany([
    {
      name: 'Stripe',
      type: 'stripe',
      isActive: true,
      requireProof: false,
      config: {
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
        mode: 'sandbox',
      },
      displayName: 'Credit/Debit Card',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
    },
    {
      name: 'PayPal',
      type: 'paypal',
      isActive: true,
      requireProof: false,
      config: {
        publicKey: '',
        secretKey: '',
        mode: 'sandbox',
      },
      displayName: 'PayPal',
      supportedCurrencies: ['USD', 'EUR'],
    },
    {
      name: 'M-Pesa STK Push',
      type: 'mpesa_stk_push',
      isActive: true,
      requireProof: false,
      config: {
        publicKey: '',
        secretKey: '',
        passkey: '',
        shortcode: '174379',
        mode: 'sandbox',
      },
      displayName: 'M-Pesa STK Push',
      supportedCurrencies: ['KES'],
    },
    {
      name: 'M-Pesa Send Money',
      type: 'mpesa_send_money',
      isActive: true,
      requireProof: true,
      config: {
        phoneNumber: '',
        mode: 'live',
      },
      displayName: 'M-Pesa Send Money',
      supportedCurrencies: ['KES'],
    },
    {
      name: 'M-Pesa Paybill',
      type: 'mpesa_paybill',
      isActive: true,
      requireProof: true,
      config: {
        businessNumber: '',
        accountNumber: '',
        mode: 'live',
      },
      displayName: 'M-Pesa Paybill',
      supportedCurrencies: ['KES'],
    },
    {
      name: 'M-Pesa Till',
      type: 'mpesa_till',
      isActive: true,
      requireProof: true,
      config: {
        businessNumber: '',
        mode: 'live',
      },
      displayName: 'M-Pesa Till',
      supportedCurrencies: ['KES'],
    },
  ]);

  console.log('✅ Payment methods seeded (6 methods).\n');
};

// ── Seed Settings ────────────────────────────────────
const seedSettings = async () => {
  const count = await Setting.countDocuments();
  if (count > 0) {
    const overwrite = await question(`Settings has ${count} document(s). Overwrite? (y/n): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipped settings.\n');
      return;
    }
    await Setting.deleteMany({});
  }

  await Setting.create({
    appName: process.env.APP_NAME || 'NexGuard',
    supportEmail: 'support@nexguard.io',
    supportPhone: '+254 700 000 000',
    currency: 'USD',
    rateLimitWindow: 15,
    rateLimitMax: 100,
    maintenanceMode: false,
    features: {
      vpn: true,
      firewall: true,
      realtimeProtection: true,
      twoFactorAuth: false,
    },
    ai: {
      masterToggle: false,
      name: 'NexGuard AI',
      defaultGreeting: 'Hello! I am NexGuard AI. How can I help you secure your system today?',
      baseUrl: process.env.HDM_AI_URL || 'https://hdmaiserver.pxxl.click/api/v1',
      apiKey: process.env.HDMAI_API_KEY || '',
      model: 'vault',
      rateLimitPerMinute: 10,
      color: '#00c48c',
      toggles: {
        landingPage: false,
        clientDashboard: false,
        fileUploadAnalysis: false,
      },
    },
    email: {
      senderName: process.env.HDM_FROM_NAME || 'NexGuard',
      senderEmail: process.env.HDM_FROM_EMAIL || 'noreply@nexguard.io',
      toggles: {
        welcomeEmail: true,
        verifyEmail: true,
        passwordReset: true,
        passwordChanged: true,
        newDeviceLogin: true,
        accountLocked: true,
        accountDeleted: true,
        accountSuspended: true,
        accountReactivated: true,
        accountDeactivated: true,
        trialRegistration: true,
        trialExpiring: true,
        trialExpired: true,
        paymentReceived: true,
        paymentApproved: true,
        vpnConnected: true,
        backupCompleted: true,
        systemHealthAlert: true,
        criticalThreatAlert: true,
        newUserRegistration: true,
        paymentPendingApproval: true,
      },
    },
  });

  console.log('✅ Settings seeded (AI, Email, Features, Toggles).\n');
};

// ── Seed Legal Docs ──────────────────────────────────
const seedLegal = async () => {
  const count = await Legal.countDocuments();
  if (count > 0) {
    const overwrite = await question(`Legal docs has ${count} document(s). Overwrite? (y/n): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipped legal docs.\n');
      return;
    }
    await Legal.deleteMany({});
  }

  await Legal.insertMany([
    {
      type: 'tos',
      title: 'Terms of Service',
      content: '<h1>Terms of Service</h1><p>Welcome to NexGuard. By using our services, you agree to these terms...</p>',
      version: '1.0.0',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      type: 'privacy',
      title: 'Privacy Policy',
      content: '<h1>Privacy Policy</h1><p>NexGuard is committed to protecting your privacy...</p>',
      version: '1.0.0',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      type: 'gdpr',
      title: 'GDPR Compliance',
      content: '<h1>GDPR Compliance</h1><p>Your rights under GDPR...</p>',
      version: '1.0.0',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      type: 'refund',
      title: 'Refund Policy',
      content: '<h1>Refund Policy</h1><p>We offer a 30-day money-back guarantee...</p>',
      version: '1.0.0',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      type: 'acceptable_use',
      title: 'Acceptable Use Policy',
      content: '<h1>Acceptable Use Policy</h1><p>Users agree not to misuse NexGuard services...</p>',
      version: '1.0.0',
      isPublished: true,
      publishedAt: new Date(),
    },
  ]);

  console.log('✅ Legal docs seeded (TOS, Privacy, GDPR, Refund, AUP).\n');
};

// ── Seed YARA (Placeholder) ──────────────────────────
const seedYara = async () => {
  console.log('ℹ️  YARA rules are loaded from NexGuard API on startup.');
  console.log('   No local seed needed. The server fetches rules from Rust API.\n');
};

// ── Seed Admin ───────────────────────────────────────
const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@nexguard.io';
  const existing = await Admin.findOne({ email });

  if (existing) {
    const overwrite = await question(`Admin "${email}" already exists. Reset password? (y/n): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipped admin.\n');
      return;
    }
    const password = await question('New password: ');
    existing.password = await bcrypt.hash(password, 12);
    await existing.save();
    console.log(`✅ Admin password reset: ${email}\n`);
  } else {
    const name = await question('Admin name (default: NexGuard Admin): ') || 'NexGuard Admin';
    const password = await question('Admin password: ') || 'Admin123!';
    const hashed = await bcrypt.hash(password, 12);
    await Admin.create({
      name,
      email,
      password: hashed,
      role: 'super_admin',
      permissions: {
        users: true,
        payments: true,
        plans: true,
        settings: true,
        backups: true,
        legal: true,
        admins: true,
      },
    });
    console.log(`✅ Admin created: ${email}\n`);
  }
};

// ── Seed All ─────────────────────────────────────────
const seedAll = async () => {
  console.log('\n🌱 Seeding all...\n');
  await seedPlans();
  await seedPaymentMethods();
  await seedSettings();
  await seedYara();
  await seedLegal();
  await seedAdmin();
  console.log('✅ All seeding complete!\n');
};

// ── Main ─────────────────────────────────────────────
const main = async () => {
  await connect();

  while (true) {
    showMenu();
    const choice = await question('\nChoose an option: ');

    switch (choice) {
      case '1': await seedAll(); break;
      case '2': await seedPlans(); break;
      case '3': await seedPaymentMethods(); break;
      case '4': await seedSettings(); break;
      case '5': await seedYara(); break;
      case '6': await seedLegal(); break;
      case '7': await seedAdmin(); break;
      case '0':
        console.log('\nExiting...\n');
        await mongoose.disconnect();
        rl.close();
        process.exit(0);
      default:
        console.log('\n❌ Invalid option.\n');
    }
  }
};

main();