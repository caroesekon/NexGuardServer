require('./dnsSet');
require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Admin = require('../models/admin/Admin');
const Backup = require('../models/admin/Backup');
const PaymentMethod = require('../models/admin/PaymentMethod');
const Payment = require('../models/admin/Payment');
const PendingApproval = require('../models/admin/PendingApproval');
const Client = require('../models/admin/Client');
const Setting = require('../models/admin/Setting');
const AuditLog = require('../models/admin/AuditLog');
const Plan = require('../models/admin/Plan');
const Legal = require('../models/admin/Legal');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const collections = {
  admins: Admin,
  backups: Backup,
  paymentmethods: PaymentMethod,
  payments: Payment,
  pendingapprovals: PendingApproval,
  clients: Client,
  settings: Setting,
  auditlogs: AuditLog,
  plans: Plan,
  legals: Legal,
};

// ── Connect ──────────────────────────────────────────
const connect = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexguard';
  await mongoose.connect(uri);
  console.log(`[DB] Connected: ${uri}\n`);
};

// ── Show Menu ───────────────────────────────────────
const showMenu = () => {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│           NEXGUARD ADMIN CLI                │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│  1. List Admins                             │');
  console.log('│  2. Create Admin                            │');
  console.log('│  3. Manage Admin (role/permissions)         │');
  console.log('│  4. Delete Admin                            │');
  console.log('│  5. List DB Collections                     │');
  console.log('│  6. Drop a Collection                       │');
  console.log('│  7. Drop Entire Database                    │');
  console.log('│  0. Exit                                    │');
  console.log('└─────────────────────────────────────────────┘');
};

// ── List Admins ──────────────────────────────────────
const listAdmins = async () => {
  const admins = await Admin.find().select('-password');
  if (admins.length === 0) {
    console.log('\nNo admins found.');
    return;
  }
  console.log(`\n┌────────────────────────────────────────────────────────────────┐`);
  console.log(`│                         ADMIN LIST                             │`);
  console.log(`├────┬────────────────────┬────────────────────────┬─────────────┤`);
  console.log(`│ #  │ Name               │ Email                  │ Role        │`);
  console.log(`├────┼────────────────────┼────────────────────────┼─────────────┤`);
  admins.forEach((a, i) => {
    console.log(`│ ${String(i + 1).padEnd(2)} │ ${a.name.padEnd(18)} │ ${a.email.padEnd(22)} │ ${a.role.padEnd(11)} │`);
  });
  console.log(`└────┴────────────────────┴────────────────────────┴─────────────┘`);
  console.log(`Total: ${admins.length}\n`);
};

// ── Create Admin ─────────────────────────────────────
const createAdmin = async () => {
  console.log('\n┌─────────────────────────────────────┐');
  console.log('│         CREATE NEW ADMIN            │');
  console.log('└─────────────────────────────────────┘\n');

  const name = await question('Name: ');
  const email = await question('Email: ');
  const password = await question('Password: ');

  console.log('\nRoles: 1. super_admin  2. moderator  3. billing_admin');
  const roleChoice = await question('Choose role (1-3): ');
  const roles = ['super_admin', 'moderator', 'billing_admin'];
  const role = roles[parseInt(roleChoice) - 1] || 'moderator';

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`\n❌ Admin with email "${email}" already exists.\n`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await Admin.create({ name, email, password: hashedPassword, role });

  console.log(`\n✅ Admin created: ${name} (${email}) — ${role}`);

  // ── Send Welcome Email ────────────────────────────
  const sendEmail = await question('\nSend welcome email? (y/n): ');

  if (sendEmail.toLowerCase() === 'y') {
    try {
      const emailService = require('../services/emailService');
      await emailService.send({
        type: 'adminWelcome',
        to: email,
        data: {
          name,
          email,
          role,
        },
      });
      console.log(`✅ Welcome email sent to ${email}\n`);
    } catch (err) {
      console.log(`⚠ Email failed: ${err.message}`);
      console.log(`✅ Admin still created successfully.\n`);
    }
  } else {
    console.log('Skipped email.\n');
  }
};

// ── Manage Admin ─────────────────────────────────────
const manageAdmin = async () => {
  await listAdmins();
  const email = await question('\nEnter admin email to manage: ');

  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.log(`\n❌ Admin not found.\n`);
    return;
  }

  console.log(`\nManaging: ${admin.name} (${admin.email}) — Current role: ${admin.role}`);
  console.log('\n1. Change Role');
  console.log('2. Toggle Permissions');
  const choice = await question('Choose: ');

  if (choice === '1') {
    console.log('\nRoles: 1. super_admin  2. moderator  3. billing_admin');
    const r = await question('New role (1-3): ');
    const roles = ['super_admin', 'moderator', 'billing_admin'];
    admin.role = roles[parseInt(r) - 1] || admin.role;
    await admin.save();
    console.log(`✅ Role updated to: ${admin.role}\n`);
  } else if (choice === '2') {
    console.log('\nPermissions:');
    const perms = ['users', 'payments', 'plans', 'settings', 'backups', 'legal', 'admins'];
    for (const p of perms) {
      const val = await question(`  ${p} (y/n, current: ${admin.permissions[p] ? 'y' : 'n'}): `);
      if (val.toLowerCase() === 'y') admin.permissions[p] = true;
      if (val.toLowerCase() === 'n') admin.permissions[p] = false;
    }
    await admin.save();
    console.log('✅ Permissions updated.\n');
  }
};

// ── Delete Admin ─────────────────────────────────────
const deleteAdmin = async () => {
  await listAdmins();
  const email = await question('\nEnter admin email to delete: ');

  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.log(`\n❌ Admin not found.\n`);
    return;
  }

  const confirm = await question(`\n⚠ Delete "${admin.name}" (${admin.email})? Type YES to confirm: `);
  if (confirm === 'YES') {
    await Admin.deleteOne({ email });
    console.log('✅ Admin deleted.\n');
  } else {
    console.log('Cancelled.\n');
  }
};

// ── List Collections ─────────────────────────────────
const listCollections = async () => {
  const names = Object.keys(collections);
  console.log('\n┌─────────────────────────────────────┐');
  console.log('│         DB COLLECTIONS              │');
  console.log('├──────┬──────────────────────────────┤');
  console.log('│  #   │ Collection                   │');
  console.log('├──────┼──────────────────────────────┤');

  for (let i = 0; i < names.length; i++) {
    const count = await collections[names[i]].countDocuments();
    console.log(`│ ${String(i + 1).padEnd(4)} │ ${names[i].padEnd(28)} │ (${count})`);
  }
  console.log('└──────┴──────────────────────────────┘\n');
};

// ── Drop Collection ──────────────────────────────────
const dropCollection = async () => {
  await listCollections();
  const name = await question('Collection name to drop: ');

  if (!collections[name]) {
    console.log(`\n❌ Collection "${name}" not found.\n`);
    return;
  }

  const confirm = await question(`\n⚠ Drop "${name}"? Type YES to confirm: `);
  if (confirm === 'YES') {
    await collections[name].deleteMany({});
    console.log(`✅ Collection "${name}" dropped.\n`);
  } else {
    console.log('Cancelled.\n');
  }
};

// ── Drop Entire DB ──────────────────────────────────
const dropDatabase = async () => {
  console.log('\n⚠ WARNING: This will delete ALL data permanently!');
  const confirm = await question('Type DELETE EVERYTHING to confirm: ');

  if (confirm === 'DELETE EVERYTHING') {
    const db = mongoose.connection.db;
    await db.dropDatabase();
    console.log('✅ Database dropped completely.\n');
  } else {
    console.log('Cancelled.\n');
  }
};

// ── Main ─────────────────────────────────────────────
const main = async () => {
  await connect();

  while (true) {
    showMenu();
    const choice = await question('\nChoose an option: ');

    switch (choice) {
      case '1': await listAdmins(); break;
      case '2': await createAdmin(); break;
      case '3': await manageAdmin(); break;
      case '4': await deleteAdmin(); break;
      case '5': await listCollections(); break;
      case '6': await dropCollection(); break;
      case '7': await dropDatabase(); break;
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