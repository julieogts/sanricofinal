# 🔗 Apply Gmail Credentials to Your Email Workflow

## 📋 **After Creating the Credential:**

### **1. Open Your Email Workflow**
- Go back to **"Workflows"** (workflow icon in left sidebar)
- Click on your **"Email Verification Workflow"**
- You should see the workflow with multiple nodes

### **2. Configure "Send Verification Email" Node**
- **Click on** the **"Send Verification Email"** node (Gmail icon)
- In the **"Credentials"** dropdown
- Select: **"Sanrico Gmail OAuth2"** (the one you just created)
- **Save** the node (click checkmark or press Enter)

### **3. Configure "Send Password Reset Email" Node**
- **Click on** the **"Send Password Reset Email"** node
- In the **"Credentials"** dropdown  
- Select: **"Sanrico Gmail OAuth2"** (same credential)
- **Save** the node

### **4. Ensure Workflow is Active**
- Look for the **toggle switch** at the top right of the workflow
- It should be **ON** (blue/green color)
- If it's OFF (grey), click it to activate
- Status should show: **"Active"**

### **5. Check Webhook URL**
- Click on the **"Webhook"** node (first node)
- Note the **"Production URL"** - should be:
  `http://localhost:5678/webhook/send-verification-email`
- This matches what your auth server expects!

## ✅ **Visual Success Indicators:**

### **Gmail Nodes:**
- ✅ No red error triangles on nodes
- ✅ Credentials dropdown shows "Sanrico Gmail OAuth2"
- ✅ Node headers show connected status

### **Workflow:**
- ✅ Toggle switch is ON (active)
- ✅ All nodes connected with lines
- ✅ Webhook shows production URL

### **Overall:**
- ✅ No error messages in n8n
- ✅ All nodes have required credentials
- ✅ Workflow status: "Active"

## 🧪 **Test the Setup:**
Once credentials are applied to both Gmail nodes and workflow is active:

```bash
node test-n8n-email.js
```

**Expected Output:**
```
✅ Success! Email sent successfully
📧 Check your inbox for the verification email
```

## 🚨 **Common Issues:**

**❌ Still getting JSON error:**
- Make sure BOTH Gmail nodes have credentials assigned
- Verify workflow is Active (toggle switch ON)
- Check that webhook URL is accessible

**❌ "Credentials not found":**
- Refresh the n8n page
- Recreate the credential if needed
- Ensure you saved the credential properly

**❌ OAuth error still:**
- Double-check Google Cloud OAuth consent screen
- Verify test user is added: sanricomercantileofficial@gmail.com
- Try the OAuth flow again