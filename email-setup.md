# Email Verification Setup Guide

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer dotenv
```

### 2. Gmail App Password Setup (Updated 2024)

**Step 1: Enable 2-Step Verification FIRST**
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **"Security"** in the left sidebar
3. Under **"How you sign in to Google"**, click **"2-Step Verification"**
4. Click **"Get started"** and follow the setup process
5. **IMPORTANT**: You MUST complete 2-Step Verification setup first

**Step 2: Generate App Password**
1. After 2-Step Verification is enabled, go back to [myaccount.google.com](https://myaccount.google.com)
2. Click **"Security"** in the left sidebar
3. Under **"How you sign in to Google"**, you should now see **"App passwords"**
   - If you don't see it, try this direct link: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Click **"App passwords"**
5. You may need to sign in again
6. Click **"Select app"** dropdown and choose **"Mail"**
7. Click **"Select device"** dropdown and choose **"Other (custom name)"**
8. Type: **"Sanrico Mercantile Email"**
9. Click **"Generate"**
10. Copy the 16-character password (it looks like: `abcd efgh ijkl mnop`)

**Alternative Method if App Passwords is Hidden:**
1. Go directly to: [security.google.com/settings/security/apppasswords](https://security.google.com/settings/security/apppasswords)
2. Sign in if prompted
3. Follow steps 6-10 above

**Troubleshooting:**
- ❌ **Can't see "App passwords"?** → 2-Step Verification is not fully enabled
- ❌ **"App passwords" is grayed out?** → Wait 5-10 minutes after enabling 2SV
- ❌ **Getting errors?** → Try the direct link above
- ❌ **Still not working?** → Contact me with a screenshot of your Security page

### 3. Environment Variables
Create a `.env` file in your project root:
```env
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop
JWT_SECRET=your-jwt-secret-key-here
MONGODB_URI=your-mongodb-connection-string
```

### 4. Gmail Account Requirements
- ✅ Gmail account: `sanricomercantileofficial@gmail.com`
- ✅ 2-Factor Authentication enabled
- ✅ App Password generated (NOT regular password)
- ✅ "Less secure app access" is NOT needed (that's the old method)

## 🚀 How It Works

### Registration Flow:
1. User fills registration form
2. System generates 5-digit code
3. Code stored in localStorage
4. Email sent to user with code
5. User enters code in verification modal
6. System validates against localStorage
7. Account created and user logged in

### Security Features:
- ✅ 5-digit random codes
- ✅ 15-minute expiration
- ✅ Maximum 5 attempts
- ✅ Professional email template
- ✅ 60-second resend cooldown
- ✅ localStorage validation
- ✅ Automatic cleanup

### Frontend Components:
- Email verification modal
- Professional styling
- Real-time validation
- Loading states
- Error handling
- Mobile responsive

### Backend Endpoints:
- `POST /api/auth/send-verification` - Send verification email
- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/complete-registration` - Complete registration

## 📧 Email Template Features
- Professional Sanrico Mercantile branding
- Clear verification code display
- Security warnings
- Mobile-friendly design
- Automated sending

## 🔒 Security Considerations
- Codes expire after 15 minutes
- Limited to 5 attempts per session
- Email validation before sending
- Secure password hashing
- JWT token generation
- Rate limiting recommended

## 📱 User Experience
- Facebook-style verification flow
- Clean, professional interface
- Clear feedback messages
- Intuitive button states
- Mobile optimization

## ⚡ Quick Start
1. Enable 2-Step Verification on Gmail
2. Generate App Password using steps above
3. Add to `.env`: `EMAIL_PASSWORD=your-16-char-password`
4. Run: `npm install`
5. Start server: `npm start`
6. Test registration on your website!

## 🆘 Still Having Issues?
If you can't find the App Password option:
1. Make sure you're signed into the correct Gmail account
2. Wait 10-15 minutes after enabling 2-Step Verification
3. Try this direct link: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Clear browser cache and try again
5. Contact me with a screenshot if still stuck! 