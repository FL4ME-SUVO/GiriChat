// Email testing utility
import { sendVerificationEmail } from './utils/email.js';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');
  
  // Check if email is configured
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-real-email@gmail.com') {
    console.log('❌ Email not configured yet!');
    console.log('📝 Please update server/.env with your actual Gmail credentials:');
    console.log('   EMAIL_USER=youremail@gmail.com');
    console.log('   EMAIL_PASS=your-16-char-app-password');
    console.log('   EMAIL_FROM=ChatApp <youremail@gmail.com>');
    console.log('\n📖 See EMAIL_SETUP.md for detailed instructions');
    return;
  }
  
  console.log('📧 Email Configuration:');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM}`);
  console.log('');
  
  // Test email
  const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
  const testCode = '123456';
  
  try {
    console.log(`📤 Sending test verification email to ${testEmail}...`);
    await sendVerificationEmail(testEmail, 'Test User', testCode);
    console.log('✅ Email sent successfully!');
    console.log('📬 Check your inbox for the verification email');
    console.log(`🔢 Test verification code: ${testCode}`);
  } catch (error) {
    console.log('❌ Email sending failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Common fixes:');
    console.log('   1. Check your Gmail app password is correct');
    console.log('   2. Ensure 2-Factor Authentication is enabled');
    console.log('   3. Verify your Gmail address is correct');
    console.log('   4. Check your internet connection');
  }
}

// Run the test
testEmail().then(() => {
  console.log('\n🏁 Email test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});