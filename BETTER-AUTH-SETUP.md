# 🔐 Better Auth Setup Guide for Sanrico Mercantile

This guide will help you set up a complete authentication system using Better Auth with email verification through n8n.

## 📋 Prerequisites

- Node.js (v16 or higher)
- n8n instance running on port 5678
- Gmail account for sending emails (sanricomercantileofficial@gmail.com)

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `better-auth` - Modern authentication library
- `better-sqlite3` - SQLite database adapter
- `express` - Web server framework

### 2. Create Environment Variables

Create a `.env` file in your project root with the following content:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your_32_character_secret_key_here_123456789
BETTER_AUTH_URL=http://localhost:3000

# Email Configuration for n8n
SENDER_EMAIL=sanricomercantileofficial@gmail.com
N8N_WEBHOOK_URL=http://localhost:5678/webhook/send-verification-email

# Database Configuration
DATABASE_URL=./database.db
```

**Important:** Replace `your_32_character_secret_key_here_123456789` with a secure random string.

### 3. Initialize Database

Run the database migration to create required tables:

```bash
npm run setup-db
```

### 4. Set Up n8n Email Workflow

1. Import the workflow from `n8n-workflow-config.json` into your n8n instance
2. Configure Gmail OAuth2 credentials:
   - Go to Google Cloud Console
   - Enable Gmail API
   - Create OAuth2 credentials
   - Add credentials to n8n as "Sanrico Gmail OAuth2"
3. Activate the workflow

### 5. Start the Authentication Server

```bash
npm run auth-server
```

Or for development with auto-restart:

```bash
npm run dev-auth
```

## 🎯 Features Implemented

### ✅ User Registration
- Real-time form validation
- Password strength checking
- Email verification with 4-digit codes
- Automatic account creation in UserCredentials collection

### ✅ User Login
- Email/password authentication
- Unverified email detection
- Automatic verification dialog popup
- Session management with cookies

### ✅ Email Verification
- 4-digit verification codes
- Beautiful responsive dialog
- Resend functionality
- 10-minute expiration

### ✅ Staff Authentication
- Separate staff login
- Role-based access control
- Admin dashboard redirection

### ✅ Password Recovery
- Forgot password functionality
- Secure reset tokens
- Email-based recovery flow

## 🔧 Technical Architecture

### Database Structure
The system uses Better Auth's schema with additional fields:
- `fullName` - User's full name
- `isStaff` - Boolean for staff accounts
- `createdAt` - Account creation timestamp
- `emailVerified` - Email verification status

### API Endpoints
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/send-verification-email` - Resend verification
- `POST /api/auth/send-password-reset` - Password reset
- `GET /api/auth/get-session` - Session check

### File Structure
```
├── lib/
│   └── auth.js                 # Better Auth configuration
├── js/
│   ├── auth-client.js          # Client-side authentication
│   ├── login.js                # Enhanced login handlers
│   └── validation.js           # Form validation
├── css/
│   ├── verification-dialog.css # Email verification styles
│   └── forms.css              # Enhanced form styles
├── api/
│   └── auth/
│       └── route.js           # API route handlers
├── server-auth.js             # Authentication server
├── auth-config.js             # Configuration module
└── n8n-workflow-config.json   # n8n workflow template
```

## 📧 Email Templates

The system sends two types of emails:

### Verification Email
- 4-digit verification code
- Professional Sanrico Mercantile branding
- 10-minute expiration notice

### Password Reset Email
- Secure reset link
- 1-hour expiration
- Professional styling

## 🛡️ Security Features

- Secure password hashing with Better Auth
- CSRF protection
- Rate limiting on auth endpoints
- Secure session cookies
- Email verification requirement
- Password strength validation

## 🎨 User Experience

### Modal System
- Separate login and registration modals
- Smooth animations and transitions
- Responsive design for all devices
- Real-time validation feedback

### Verification Dialog
- Elegant popup design
- 4-digit code input
- Auto-focus and Enter key support
- Resend functionality with cooldown

## 🚦 Testing the System

1. **Registration Flow:**
   - Open any page and click "Log In"
   - Click "Create one today"
   - Fill registration form
   - Check email for verification code
   - Enter code in dialog

2. **Login Flow:**
   - Try logging in with unverified email
   - Verification dialog should appear
   - After verification, login should succeed

3. **Password Reset:**
   - Click "Forgot your password?"
   - Enter email address
   - Check email for reset link

## 🔍 Troubleshooting

### Common Issues

1. **n8n webhook not receiving data:**
   - Check n8n is running on port 5678
   - Verify webhook URL in .env file
   - Ensure workflow is activated

2. **Gmail authentication fails:**
   - Verify OAuth2 credentials in n8n
   - Check Gmail API is enabled
   - Ensure correct sender email

3. **Database errors:**
   - Run `npm run setup-db` again
   - Check database file permissions
   - Verify SQLite installation

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📞 Support

For issues or questions:
1. Check console errors in browser
2. Review server logs
3. Verify n8n workflow execution
4. Test email connectivity

## 🎉 Success!

Once set up, you'll have a complete authentication system with:
- ✅ Secure user registration
- ✅ Email verification
- ✅ Professional login experience
- ✅ Staff access control
- ✅ Password recovery
- ✅ Beautiful UI/UX

Users will be stored in the database with proper credentials management and email verification workflows!