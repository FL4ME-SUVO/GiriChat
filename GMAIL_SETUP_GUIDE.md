# 📧 Gmail SMTP Setup Guide

## Step 1: Enable 2-Factor Authentication

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Sign in with your Gmail account

2. **Navigate to Security**
   - Click "Security" in the left sidebar
   - Look for "2-Step Verification"

3. **Enable 2-Step Verification**
   - Click "2-Step Verification"
   - Click "Get Started"
   - Follow the prompts (you'll need your phone)
   - Complete the setup process

## Step 2: Generate App Password

1. **Go back to Security settings**
   - https://myaccount.google.com/security

2. **Find App Passwords**
   - Click "2-Step Verification" again
   - Scroll down to "App passwords"
   - Click "App passwords"

3. **Generate Password for Mail**
   - Select "Mail" from the dropdown
   - Select "Other (Custom name)" and type "ChatApp"
   - Click "Generate"

4. **Copy the Password**
   - You'll see a 16-character password like: `abcd efgh ijkl mnop`
   - **COPY THIS PASSWORD** - you'll need it for the .env file

## Step 3: Update Your .env File

Replace these values in `server/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=ChatApp <your-actual-email@gmail.com>
```

## Step 4: Test Your Setup

Run this command in the server directory:
```bash
node test-email.js
```

## Troubleshooting

### "Authentication failed"
- Make sure 2FA is enabled
- Use the app password, not your regular Gmail password
- Check that your email address is correct

### "Connection timeout"
- Check your internet connection
- Verify the host and port are correct

### "App passwords not available"
- 2FA must be enabled first
- Wait a few minutes after enabling 2FA

## Alternative: Use Mailtrap for Testing

If Gmail setup is too complex, use Mailtrap:
1. Sign up at https://mailtrap.io (free)
2. Create an inbox
3. Copy the SMTP credentials
4. Update your .env file with Mailtrap settings

## Success!

Once configured, verification emails will be sent to real email addresses instead of showing in the UI.