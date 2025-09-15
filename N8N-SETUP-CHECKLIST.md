# 📧 n8n Email Setup Checklist

## 🚀 **Quick Setup Steps**

### ✅ **Phase 1: Install n8n**
```bash
npm install -g n8n
n8n start
```
- n8n will be available at: `http://localhost:5678`

### ✅ **Phase 2: Google Cloud Setup**
1. **Google Cloud Console:** https://console.cloud.google.com/
2. **Enable Gmail API** in your project
3. **Create OAuth2 Credentials:**
   - Type: Web application
   - Redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`
4. **Save Client ID & Secret**

### ✅ **Phase 3: Import Workflow**
1. Open n8n at `http://localhost:5678`
2. Import `n8n-email-workflow.json` (already created for you)
3. Beautiful email templates included! 🎨

### ✅ **Phase 4: Configure Gmail**
1. **n8n Settings > Credentials**
2. **Add Gmail OAuth2 credential:**
   - Name: "Sanrico Gmail OAuth2"
   - Add your Client ID & Secret
   - Connect with `sanricomercantileofficial@gmail.com`

### ✅ **Phase 5: Activate Workflow**
1. Open the imported workflow
2. Set Gmail credentials on both email nodes
3. **Toggle workflow to "Active"**

### ✅ **Phase 6: Test Integration**
```bash
node test-n8n-email.js
```

## 🎯 **What You'll Get**

### **Professional Email Templates:**
- ✨ **Verification Email:** Beautiful 4-digit code with Sanrico branding
- 🔐 **Password Reset:** Secure reset link with professional styling
- 📱 **Mobile Responsive:** Works perfectly on all devices

### **Webhook Endpoint:**
- **URL:** `http://localhost:5678/webhook/send-verification-email`
- **Method:** POST
- **Payload:**
```json
{
  "to": "user@example.com",
  "verificationCode": "1234", 
  "userName": "John Doe",
  "type": "verification"
}
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

**❌ n8n won't start:**
```bash
# Try alternative installation
npx n8n
```

**❌ Gmail OAuth error:**
- Check redirect URI exactly: `http://localhost:5678/rest/oauth2-credential/callback`
- Make sure Gmail API is enabled
- Use `sanricomercantileofficial@gmail.com` for OAuth

**❌ Webhook not responding:**
- Ensure workflow is **activated** (toggle switch)
- Check n8n is running on port 5678
- Verify webhook URL in your `.env` file

**❌ Emails not sending:**
- Check Gmail OAuth connection is green in n8n
- Test with `node test-n8n-email.js`
- Verify Gmail credentials in both email nodes

## 📧 **Email Preview**

Your users will receive beautiful, professional emails like this:

```
🏪 Sanrico Mercantile
Hardware & Mercantile Store

Email Verification Required

Hello John Doe,

Thank you for registering with Sanrico Mercantile! 

[  1 2 3 4  ]  ← Beautiful code display

⏰ Important: This code expires in 10 minutes

Best regards,
The Sanrico Mercantile Team
```

## 🎉 **Success Indicators**

✅ n8n dashboard shows workflow as "Active"  
✅ Gmail OAuth shows "Connected" status  
✅ Test email arrives in inbox  
✅ Webhook responds with success JSON  
✅ Authentication system can send verification codes  

## ⚡ **Quick Start Commands**

```bash
# Start n8n
n8n start

# Test email integration
node test-n8n-email.js

# Start your auth server
npm run simple-auth
```

**🎯 Once n8n is running, your authentication system will automatically send professional verification emails!**