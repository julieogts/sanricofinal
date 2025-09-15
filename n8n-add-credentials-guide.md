# 🔐 Add Gmail Credentials to n8n - Step by Step

## 🎯 **Why You're Getting the Error:**
The error "Unexpected end of JSON input" means n8n can't send emails because Gmail credentials aren't configured yet.

## 📋 **Step-by-Step Credential Setup:**

### **1. Access n8n Credentials**
- Open n8n: `http://localhost:5678`
- Click **"Settings"** (gear icon in left sidebar)
- Click **"Credentials"**

### **2. Create New Gmail Credential**
- Click **"+ Add new"** (blue button)
- In the search box, type: **"gmail"**
- Select: **"Gmail OAuth2 API"**
- Click on it to select

### **3. Configure the Credential**
**Name:** `Sanrico Gmail OAuth2`

**Client ID:** `99722758196-bqf2n13g79gi8vq5hpu1jch24q062v17.apps.googleusercontent.com`

**Client Secret:** `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`

**Scopes:** Leave default (should include gmail.send)

### **4. Authorize Gmail Account**
- Click **"Connect my account"** (blue button)
- **Browser will open** for Google OAuth
- **Sign in with:** `sanricomercantileofficial@gmail.com`
- **You'll see a warning:** "Google hasn't verified this app"
- Click **"Advanced"**
- Click **"Go to Sanrico Mercantile Email System (unsafe)"**
- **Grant permissions** for Gmail access
- **Return to n8n** - credential should show as "Connected"

### **5. Save the Credential**
- Click **"Save"**
- You should see it in your credentials list with a green checkmark

## ✅ **Success Indicators:**
- ✅ Credential appears in Settings > Credentials
- ✅ Status shows "Connected" with green checkmark
- ✅ No red error indicators

## 🔄 **Next: Apply to Workflow Nodes**
After creating the credential, you need to apply it to your email workflow nodes.