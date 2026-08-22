const bcrypt = require('bcryptjs');
const User = require('./models/User');

/**
 * Seeds two demo accounts if they don't already exist.
 * Account 1: demo@chatsync.com / demo123
 * Account 2: demo2@chatsync.com / demo123
 */
async function seedDemoAccount() {
  try {
    const accounts = [
      { name: 'Demo User 1', email: 'demo@chatsync.com', password: 'demo123' },
      { name: 'Demo User 2', email: 'demo2@chatsync.com', password: 'demo123' },
    ];

    for (const acc of accounts) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(acc.password, salt);
        
        await User.create({
          name: acc.name,
          email: acc.email,
          password: hashedPassword,
          role: 'user',
        });
        console.log(`✅ Demo account created: ${acc.email} / ${acc.password}`);
      } else {
        console.log(`ℹ️ Demo account already exists: ${acc.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to seed demo accounts:', error);
  }
}

module.exports = { seedDemoAccount };
