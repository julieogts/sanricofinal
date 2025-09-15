# 🔑 n8n Modern Credentials Setup (New UI)

## 🎯 **Your n8n Version Uses Node-Based Credentials**

Since "Credentials" isn't in Settings, your n8n manages credentials through the workflow nodes directly.

## 📋 **Step-by-Step Setup:**

### **1. Open Your Email Workflow**
- Go to **"Workflows"** (main tab)
- Click your **"Email Verification Workflow"**
- You should see your imported workflow with Gmail nodes

### **2. Configure First Gmail Node**
- **Click on "Send Verification Email"** node
- In the node panel (right side), find **"Credentials"** field
- **Click the dropdown** → You'll see **"+ Create New"** option
- **Select "Create New"**

### **3. Choose Credential Type**
- A popup will appear with credential types
- **Search for:** "Gmail"
- **Select:** "Gmail OAuth2 API"
- **Click to select it**

### **4. Enter Your Credentials**
**Credential Name:** `Sanrico Gmail OAuth2`

**Configuration:**
- **Client ID:** `99722758196-bqf2n13g79gi8vq5hpu1jch24q062v17.apps.googleusercontent.com`
- **Client Secret:** `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`

### **5. OAuth Authorization**
- **Click "Connect my account"** or similar button
- **Browser opens** → Sign in with `sanricomercantileofficial@gmail.com`
- **Accept the "unverified app" warning:**
  - Click **"Advanced"**
  - Click **"Go to Sanrico Mercantile Email System (unsafe)"**
- **Grant Gmail permissions**
- **Return to n8n** → Credential should be connected

### **6. Save and Apply**
- **Save the credential**
- **Save the node configuration**
- The node should now show your credential name

### **7. Apply to Second Gmail Node**
- **Click on "Send Password Reset Email"** node
- **Credentials dropdown** → Select **"Sanrico Gmail OAuth2"** (the one you just created)
- **Save the node**

### **8. Activate Workflow**
- **Toggle the workflow to "Active"** (switch at top)
- **Status should show:** 🟢 Active

## 🎯 **Alternative: Look for Credentials Tab**

If node method doesn't work, check these locations:
- **Top navigation bar** → Look for "Credentials" tab
- **Main menu** → Check if "Credentials" is a main section
- **User menu** → Click your profile icon → Look for Credentials

## ✅ **Success Indicators:**
- ✅ Gmail nodes show credential name in dropdown
- ✅ No red error triangles on nodes
- ✅ Workflow is Active
- ✅ Test email script works

## 🧪 **Test After Setup:**
```bash
node test-n8n-email.js
```

**Should return:**
```
✅ Success! Email sent successfully
📧 Check your inbox for the verification email
```