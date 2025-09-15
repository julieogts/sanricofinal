# 🎯 Simple Authentication Setup Guide

**✅ PROBLEM SOLVED!** No more Windows compilation issues - this uses your existing MongoDB setup!

## 🚀 **What You Get**

- ✅ **Email verification with 4-digit codes** sent via n8n using `sanricomercantileofficial@gmail.com`
- ✅ **Beautiful verification dialog** (same modern UI as before)
- ✅ **Users stored in MongoDB `UserCredentials` collection** as requested
- ✅ **No native compilation** - pure JavaScript, no Windows build tools needed
- ✅ **Professional authentication flow** with secure password hashing
- ✅ **Staff authentication** with role-based access control

## 📁 **Files Created**

### Core Authentication Files:
- `simple-auth-setup.js` - Authentication server
- `js/simple-auth-client.js` - Client-side authentication
- `js/simple-login-handlers.js` - Enhanced login handlers
- `css/verification-dialog.css` - Email verification UI (already exists)

## 🛠️ **Setup Instructions**

### 1. **Update MongoDB Connection**

Edit `simple-auth-setup.js` line 19-24:

```javascript
// Replace with your actual MongoDB connection
MongoClient.connect('mongodb://localhost:27017/your-database-name')
    .then(client => {
        db = client.db('your-database-name');
        console.log('📊 Connected to MongoDB');
    });
```

### 2. **Create Environment File**

Create a `.env` file in your project root:

```env
# JWT Secret for session tokens
JWT_SECRET=your_super_secure_jwt_secret_key_here

# n8n webhook for sending emails
N8N_WEBHOOK_URL=http://localhost:5678/webhook/send-verification-email

# Email configuration
SENDER_EMAIL=sanricomercantileofficial@gmail.com

# MongoDB connection (optional, can hardcode in simple-auth-setup.js)
MONGODB_URI=mongodb://localhost:27017/your-database-name
```

### 3. **Install Dependencies**

```bash
npm install
```

**Note**: No compilation issues! We removed the problematic Better Auth dependencies.

### 4. **Set Up n8n Email Workflow**

1. Import the workflow from `n8n-workflow-config.json` into your n8n instance
2. Configure Gmail OAuth2 credentials for `sanricomercantileofficial@gmail.com`
3. Activate the workflow to handle email sending

### 5. **Start the Authentication Server**

```bash
npm run simple-auth
```

Or for development with auto-restart:

```bash
npm run dev-simple
```

## 🎯 **API Endpoints**

Your authentication server provides these endpoints:

### Registration & Login
- `POST /api/simple-auth/register` - User registration
- `POST /api/simple-auth/login` - User login
- `GET /api/simple-auth/session` - Check current session
- `POST /api/simple-auth/logout` - Logout user

### Email Verification
- `POST /api/simple-auth/verify-email` - Verify email with 4-digit code
- `POST /api/simple-auth/resend-verification` - Resend verification code

### Password Recovery
- `POST /api/simple-auth/forgot-password` - Send password reset email

## 📧 **Email Verification Flow**

### Registration Process:
1. User fills registration form
2. **Account created in MongoDB `UserCredentials` collection**
3. **4-digit verification code generated and emailed**
4. **Beautiful verification dialog appears**
5. User enters code → **Email verified & account activated**

### Login Process:
1. User attempts login with unverified email
2. **Verification dialog appears automatically**
3. User enters code → **Email verified & login succeeds**

## 🎨 **User Interface**

The system uses your existing beautiful modal system:
- **Modern verification dialog** with glass morphism effects
- **Real-time validation** with color-coded feedback
- **Responsive design** that works on all devices
- **Professional animations** and transitions

## 💾 **Database Structure**

Users are stored in MongoDB `UserCredentials` collection:

```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  password: "hashed_password",
  fullName: "John Doe",
  isStaff: false,
  emailVerified: true,
  createdAt: Date,
  verificationCode: "1234",  // Temporary, removed after verification
  verificationExpires: Date  // Temporary, removed after verification
}
```

## 🔐 **Security Features**

- **Secure password hashing** with bcryptjs (12 rounds)
- **JWT session tokens** with 7-day expiration
- **Email verification requirement** before account activation
- **Verification code expiration** (10 minutes)
- **Rate limiting** and validation on all endpoints
- **Staff role verification** for admin access

## 🧪 **Testing the System**

### Test Registration:
1. Open any page and click "Log In"
2. Click "Create one today"
3. Fill out the registration form
4. **Check your email for 4-digit code**
5. Enter code in the verification dialog

### Test Login:
1. Try logging in with unverified email
2. **Verification dialog should appear automatically**
3. Enter verification code
4. Login should succeed

## 🚀 **Going Live**

For production:
1. Replace hardcoded MongoDB URI with environment variable
2. Use Redis instead of in-memory storage for verification codes
3. Set up proper SSL certificates
4. Configure production n8n instance
5. Update JWT secret to a secure random string

## 🎉 **Success!**

You now have a complete authentication system that:
- ✅ **Works on Windows** (no compilation issues)
- ✅ **Uses your existing MongoDB** setup
- ✅ **Stores users in `UserCredentials` collection** as requested
- ✅ **Sends emails via n8n** using `sanricomercantileofficial@gmail.com`
- ✅ **Beautiful email verification** with 4-digit codes
- ✅ **Professional user experience** with modern UI

## 🔄 **Comparison: Simple Auth vs Better Auth**

| Feature | Simple Auth ✅ | Better Auth ❌ |
|---------|---------------|----------------|
| Windows Support | ✅ No compilation | ❌ Requires Visual Studio |
| MongoDB Integration | ✅ Native support | ❌ Requires SQLite |
| Email Verification | ✅ 4-digit codes via n8n | ✅ Built-in |
| User Storage | ✅ `UserCredentials` collection | ❌ Custom schema |
| Setup Complexity | ✅ Simple & straightforward | ❌ Complex dependencies |
| Performance | ✅ Lightweight | ❌ Heavy framework |

**The Simple Auth approach is perfect for your needs!** 🎯