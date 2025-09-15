# 🔍 n8n Troubleshooting Visual Checklist

## 🎯 **Quick Visual Checks:**

### **1. Check n8n Credentials Section**
Go to: **Settings** > **Credentials**

**✅ What You Should See:**
- **"Sanrico Gmail OAuth2"** in the list
- **Green checkmark** or "Connected" status
- **Type:** Gmail OAuth2 API

**❌ If Missing:**
- No credentials listed = Need to create one
- Red error icon = OAuth connection failed
- "Disconnected" status = Need to reconnect

### **2. Check Your Workflow**
Go to: **Workflows** > **Email Verification Workflow**

**✅ Workflow Should Look Like:**
```
[Webhook] → [Check Email Type] → [Send Verification Email]
                    ↓
                [Send Password Reset Email]
                    ↓
                [Success Response]
```

**✅ Node Status Indicators:**
- **No red triangles** on any nodes
- **Gmail nodes** show credential name
- **Webhook** shows production URL
- **Toggle switch** at top right is ON (blue/green)

### **3. Check Gmail Nodes Specifically**

**Click on "Send Verification Email" node:**
- **Credentials dropdown** should show: "Sanrico Gmail OAuth2"
- **Authentication** field: "OAuth2"
- **No error messages** in red

**Click on "Send Password Reset Email" node:**
- **Same credential** assigned
- **No error indicators**

### **4. Check Webhook Configuration**

**Click on "Webhook" node:**
- **Method:** POST
- **Path:** send-verification-email
- **Production URL:** `http://localhost:5678/webhook/send-verification-email`

## 🚨 **Common Visual Problems & Fixes:**

### **Problem: "No credentials in Settings"**
**Fix:** You need to create the Gmail OAuth2 credential first
- Follow: `n8n-add-credentials-guide.md`

### **Problem: "Red triangles on Gmail nodes"**
**Fix:** Nodes missing credentials assignment
- Click each Gmail node
- Set credentials to "Sanrico Gmail OAuth2"

### **Problem: "Workflow toggle is OFF/grey"**
**Fix:** Workflow not activated
- Click the toggle switch to turn it ON
- Should turn blue/green

### **Problem: "Webhook URL different"**
**Fix:** Check webhook path settings
- Should be: `/webhook/send-verification-email`
- Method: POST

### **Problem: "Connected credential shows error"**
**Fix:** OAuth authorization issue
- Delete and recreate credential
- Make sure Google Cloud consent screen is configured
- Add sanricomercantileofficial@gmail.com as test user

## 🎯 **Step-by-Step Fix Order:**

1. **Create credential** (if missing)
2. **Assign credential** to Gmail nodes
3. **Activate workflow** (toggle ON)
4. **Test with script**

## ✅ **Success State Visual Check:**
- ✅ Settings > Credentials: "Sanrico Gmail OAuth2" with green checkmark
- ✅ Workflow: All nodes connected, no red triangles
- ✅ Gmail nodes: Both have "Sanrico Gmail OAuth2" credential assigned
- ✅ Workflow toggle: ON (blue/green)
- ✅ Test script: Returns success JSON

**Once all visual checks pass, your email system is ready! 🎉**