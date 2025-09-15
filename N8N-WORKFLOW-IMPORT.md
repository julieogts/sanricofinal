# 📧 Import Email Workflow into n8n

## 🚀 **Step-by-Step Workflow Import**

### **1. Open n8n Dashboard**
- Start n8n (using one of the methods above)
- Open browser to: `http://localhost:5678`
- Create account if first time

### **2. Import the Workflow**
- Click **"+ New"** button (top right)
- Select **"Import from File"** 
- Choose: `n8n-email-workflow.json` (already created for you!)
- Click **"Import"**

### **3. What You'll See**
The imported workflow includes:
- 🎯 **Webhook Trigger** - Receives email requests
- 🔀 **Email Type Router** - Verification vs Password Reset
- 📧 **Gmail Verification** - Sends verification codes
- 🔐 **Gmail Password Reset** - Sends reset links
- ✅ **Success Response** - Returns confirmation

### **4. Beautiful Email Templates Included**
Your workflow contains professional email templates with:
- ✨ **Sanrico Mercantile branding**
- 🎨 **Modern gradient design**
- 📱 **Mobile responsive layout**
- 🔢 **Large verification code display**
- ⏰ **Clear expiration warnings**

## 📧 **Email Preview**
Your verification emails will look like this:

```
🏪 Sanrico Mercantile
Hardware & Mercantile Store

Email Verification Required

Hello John Doe,

Thank you for registering with Sanrico Mercantile!

┌─────────────────┐
│    1 2 3 4      │  ← Beautiful code display
└─────────────────┘

⏰ Important: This code expires in 10 minutes

Best regards,
The Sanrico Mercantile Team
```

## 🎯 **Next: Configure Gmail Credentials**
After import, you'll need to connect your Gmail account to the workflow nodes.