require('./dnsSet');
require('dotenv').config();
const mongoose = require('mongoose');

const cleanup = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexguard';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({ status: 'deactivated' }).toArray();
  const userIds = users.map(u => u._id);

  if (userIds.length > 0) {
    await db.collection('users').deleteMany({ status: 'deactivated' });
    await db.collection('subscriptions').deleteMany({ user: { $in: userIds } });
    await db.collection('payments').deleteMany({ user: { $in: userIds } });
    await db.collection('pendingapprovals').deleteMany({ user: { $in: userIds } });
    await db.collection('usersessions').deleteMany({ user: { $in: userIds } });
    await db.collection('licenses').deleteMany({ user: { $in: userIds } });
    console.log(`Deleted ${users.length} inactive accounts and related data`);
  } else {
    console.log('No inactive accounts found');
  }

  await mongoose.disconnect();
  process.exit(0);
};

cleanup();