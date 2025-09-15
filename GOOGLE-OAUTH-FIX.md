# 🔧 Fix Google OAuth Consent Screen Error

## 🚨 **Error You're Seeing:**
```
Error 403: access_denied
Sanrico Mercantile Email System has not completed the Google verification process
```

## ✅ **Quick Fix Steps:**

### **Step 1: Configure OAuth Consent Screen**
1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Navigate to:** APIs & Services > **OAuth consent screen**
3. **If not configured yet:**
   - User Type: Select **"External"** 
   - Click **"CREATE"**

### **Step 2: Fill Out App Information**
- **App name:** `Sanrico Mercantile Email System`
- **User support email:** `sanricomercantileofficial@gmail.com`
- **App logo:** (optional, can skip)
- **App domain:** (can leave blank for testing)
- **Developer contact info:** `sanricomercantileofficial@gmail.com`
- Click **"SAVE AND CONTINUE"**

### **Step 3: Configure Scopes**
- Click **"ADD OR REMOVE SCOPES"**
- Search for and add:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.modify`
- Click **"UPDATE"**
- Click **"SAVE AND CONTINUE"**

### **Step 4: Add Test Users (CRITICAL)**
- In **"Test users"** section
- Click **"ADD USERS"**
- Add: `sanricomercantileofficial@gmail.com`
- Click **"ADD"**
- Click **"SAVE AND CONTINUE"**

### **Step 5: Review and Submit**
- Review all settings
- Click **"BACK TO DASHBOARD"**

## 🎯 **Alternative: Internal App (Easiest)**

If this is just for your business use:

1. **Change User Type to "Internal"** (if you have Google Workspace)
2. This skips the verification process entirely
3. Only users in your organization can use it

## ✅ **Verification Steps**

After configuration:
1. **OAuth consent screen** should show "Testing" status
2. **Test users** should include your email
3. **Scopes** should include Gmail permissions

## 🔄 **Try Again:**
- Go back to n8n Gmail OAuth setup
- Try connecting again with `sanricomercantileofficial@gmail.com`
- You should now see a warning but can proceed by clicking **"Advanced"** > **"Go to Sanrico Mercantile Email System (unsafe)"**

## 🚨 **Important Notes:**
- In "Testing" mode, only added test users can authorize
- App will work perfectly for your needs
- For production, you'd need Google verification (takes 1-6 weeks)
- For now, testing mode is perfect!