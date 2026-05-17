const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notifications';

async function test() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const user = await User.findOne();
  if (!user) {
    console.log('No user found');
    process.exit(0);
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1d',
  });

  const res = await fetch('http://localhost:5000/api/chat/recent', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  process.exit(0);
}

test().catch(console.error);
