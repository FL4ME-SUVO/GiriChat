# 📧 Email Configuration Guide for ChatApp

## Overview
ChatApp uses email for user verification and password reset functionality. This guide will help you set up email service for development and production.

## 🚀 Quick Setup for Development

### Option 1: Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update server/.env file**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=ChatApp <your-gmail@gmail.com>
```

### Option 2: Mailtrap (Testing Environment)

1. **Sign up at [Mailtrap.io](https://mailtrap.io)**
2. **Create a new inbox**
3. **Get SMTP credentials**
4. **Update server/.env file**:
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=ChatApp <noreply@chatapp.com>
```

### Option 3: Ethereal Email (Development Only)

1. **Visit [Ethereal Email](https://ethereal.email)**
2. **Create a test account**
3. **Update server/.env file**:
```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your-ethereal-username
EMAIL_PASS=your-ethereal-password
EMAIL_FROM=ChatApp <noreply@chatapp.com>
```

## 🔧 Development Mode (No Email Setup)

If you don't configure email, the app will work in **development mode**:

- ✅ Registration works normally
- ✅ Verification codes are displayed in the UI and server console
- ✅ Password reset codes are shown directly
- ✅ All authentication features work

**Console Output Example:**
```
Email not configured. Verification code for user@example.com: 123456
```

## 🏭 Production Setup

### Recommended Services:

1. **SendGrid**
2. **AWS SES**
3. **Mailgun**
4. **Postmark**

### Environment Variables:
```env
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASS=your-smtp-password
EMAIL_FROM=ChatApp <noreply@yourdomain.com>
NODE_ENV=production
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check username/password
   - Ensure 2FA is enabled for Gmail
   - Use app password, not regular password

2. **"Connection timeout"**
   - Check EMAIL_HOST and EMAIL_PORT
   - Verify firewall settings

3. **"Email not sent"**
   - Check server console for detailed error
   - Verify EMAIL_FROM format

### Testing Email Configuration:

1. **Start the server**: `npm run dev:server`
2. **Register a new account**
3. **Check console output** for verification codes
4. **Check your email** if configured properly

## 📝 Email Templates

The app includes beautiful HTML email templates for:
- ✉️ Email verification
- 🔐 Password reset
- 🎨 Responsive design with gradients
- 📱 Mobile-friendly layout

## 🔒 Security Notes

- Never commit real email credentials to version control
- Use environment variables for all sensitive data
- Enable 2FA on email accounts
- Use app passwords instead of regular passwords
- Consider rate limiting for production

## 🆘 Need Help?

If you're still having issues:
1. Check the server console for detailed error messages
2. Verify your .env file configuration
3. Test with a simple email service like Mailtrap first
4. Ensure your firewall allows SMTP connections

---

**Happy Coding! 🚀**