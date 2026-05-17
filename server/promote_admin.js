const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://localhost:27017/notifications';

async function promote() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateOne(
      { email: 'admin@example.com' },
      { role: 'admin' }
    );

    if (result.matchedCount === 0) {
      console.log('User not found');
    } else {
      console.log('Successfully promoted admin@example.com to admin');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

promote();
