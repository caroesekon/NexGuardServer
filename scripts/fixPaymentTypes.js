require('./dnsSet');
require('dotenv').config();
const mongoose = require('mongoose');

const fix = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexguard';
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const result = await db.collection('paymentmethods').updateMany(
    { type: 'mpesa' },
    { $set: { type: 'mpesa_stk_push' } }
  );

  console.log(`Updated ${result.modifiedCount} payment method(s)`);
  await mongoose.disconnect();
  process.exit(0);
};

fix();