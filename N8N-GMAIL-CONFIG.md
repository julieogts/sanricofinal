# 🔧 Configure Gmail Credentials in n8n

## 📋 **Gmail Integration Setup**

### **1. Add Gmail Credentials**
- In n8n, go to: **Settings** > **Credentials**
- Click **"+ Add Credential"**
- Search for: **"Gmail OAuth2 API"**
- Name: **"Sanrico Gmail OAuth2"**

### **2. Enter OAuth Details**
- **Client ID**: (paste from Google Cloud Console)
- **Client Secret**: (paste from Google Cloud Console)
- Click **"Connect my account"**

### **3. Authorize Gmail Access**
- Sign in with: **sanricomercantileofficial@gmail.com**
- Grant all requested permissions:
  - ✅ Send email on your behalf
  - ✅ Manage email settings
- Click **"Allow"**

### **4. Configure Workflow Nodes**
- Open your imported workflow
- Click on **"Send Verification Email"** node
- Set **Credentials** to: "Sanrico Gmail OAuth2"
- Click on **"Send Password Reset Email"** node  
- Set **Credentials** to: "Sanrico Gmail OAuth2"

### **5. Activate the Workflow**
- Toggle the workflow switch to **"Active"**
- Workflow status should show: **🟢 Active**

## ✅ **Success Indicators**
- ✅ Gmail OAuth shows **"Connected"** status
- ✅ Both email nodes have credentials assigned
- ✅ Workflow is **Active**
- ✅ Webhook URL is available

## 🔗 **Your Webhook URL**
Once active, your webhook will be:
```
http://localhost:5678/webhook/send-verification-email
```

This is exactly what your auth server expects!