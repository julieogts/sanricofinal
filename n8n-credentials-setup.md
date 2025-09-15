# 🔐 n8n Gmail Credentials Setup

## 📋 **Your Google Cloud Credentials**
- **Client ID:** `99722758196-bqf2n13g79gi8vq5hpu1jch24q062v17.apps.googleusercontent.com`
- **Client Secret:** `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`

## 🔧 **Configure in n8n:**

### **1. Add Gmail OAuth2 Credential**
- In n8n: **Settings** > **Credentials**
- Click **"+ Add Credential"**
- Search: **"Gmail OAuth2 API"**
- Name: **"Sanrico Gmail OAuth2"**

### **2. Enter Your Credentials**
- **Client ID:** `99722758196-bqf2n13g79gi8vq5hpu1jch24q062v17.apps.googleusercontent.com`
- **Client Secret:** `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`

### **3. Authorize Access**
- Click **"Connect my account"**
- Sign in with: **sanricomercantileofficial@gmail.com**
- **IMPORTANT:** You'll see a warning about "unverified app"
- Click **"Advanced"** 
- Click **"Go to Sanrico Mercantile Email System (unsafe)"**
- Grant all permissions for Gmail

### **4. Apply to Workflow Nodes**
- Open your email workflow
- **"Send Verification Email"** node → Set credentials to "Sanrico Gmail OAuth2"
- **"Send Password Reset Email"** node → Set credentials to "Sanrico Gmail OAuth2"

### **5. Activate Workflow**
- Toggle workflow to **"Active"**
- Status should show 🟢 **Active**

## ✅ **Success Indicators**
- ✅ Credential status: **"Connected"**
- ✅ Both email nodes have credentials assigned
- ✅ Workflow is **Active**
- ✅ No red error indicators in nodes

## 🧪 **Test Integration**
```bash
node test-n8n-email.js
```

**Expected Output:**
```
✅ Success! Email sent successfully
📧 Check your inbox for the verification email
```