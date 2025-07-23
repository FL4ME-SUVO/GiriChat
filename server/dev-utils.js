// Development utilities for managing test data
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';

export async function clearAllUsers() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('users').deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} users from database`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error clearing users:', error);
    throw error;
  } finally {
    await client.close();
  }
}

export async function listAllUsers() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const users = await db.collection('users').find({}, {
      projection: { username: 1, email: 1, isEmailVerified: 1, createdAt: 1 }
    }).toArray();
    
    console.log(`📋 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.isEmailVerified ? '✅ Verified' : '❌ Not Verified'}`);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Error listing users:', error);
    throw error;
  } finally {
    await client.close();
  }
}

export async function createTestUser(username, email, password = 'test123') {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      console.log(`❌ User already exists: ${existingUser.username} (${existingUser.email})`);
      return null;
    }
    
    // Create user (password will be hashed by the model)
    const user = {
      username,
      email,
      password, // This should be hashed in a real implementation
      isEmailVerified: true, // Auto-verify for test users
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(user);
    console.log(`✅ Created test user: ${username} (${email})`);
    return result;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// CLI interface
if (process.argv[1].endsWith('dev-utils.js')) {
  const command = process.argv[2];
  
  switch (command) {
    case 'clear':
      clearAllUsers().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'list':
      listAllUsers().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'create':
      const username = process.argv[3];
      const email = process.argv[4];
      const password = process.argv[5] || 'test123';
      if (!username || !email) {
        console.log('Usage: node dev-utils.js create <username> <email> [password]');
        process.exit(1);
      }
      createTestUser(username, email, password).then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    default:
      console.log(`
🛠️  Development Utilities

Commands:
  node dev-utils.js clear                    - Clear all users
  node dev-utils.js list                     - List all users  
  node dev-utils.js create <user> <email>    - Create test user

Examples:
  node dev-utils.js clear
  node dev-utils.js list
  node dev-utils.js create john john@test.com
      `);
      process.exit(0);
  }
}