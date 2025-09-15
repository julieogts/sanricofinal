
## 📝 **Step-by-Step Google Cloud Configuration**

### **1. Access Google Cloud Console**
- Go to: https://console.cloud.google.com/
- Sign in with your Google account

### **2. Create or Select Project**
- Click "Select a project" at the top
- Either create new project or select existing one
- Project name suggestion: "Sanrico Mercantile Auth"

### **3. Enable Gmail API**
- Go to **"APIs & Services"** > **"Library"**
- Search for: **"Gmail API"**
- Click on "Gmail API" result
- Click **"Enable"** button

### **4. Create OAuth2 Credentials**
- Go to **"APIs & Services"** > **"Credentials"**
- Click **"+ CREATE CREDENTIALS"**
- Select **"OAuth 2.0 Client IDs"**

### **5. Configure OAuth Consent Screen (if prompted)**
- User Type: **"External"**
- App name: **"Sanrico Mercantile Email System"**
- User support email: **sanricomercantileofficial@gmail.com**
- Developer contact: **sanricomercantileofficial@gmail.com**
- Scopes: Add **"Gmail API"** scope

### **6. OAuth 2.0 Client ID Settings**
- Application type: **"Web application"**
- Name: **"Sanrico n8n Integration"**
- Authorized JavaScript origins: 
  - `http://localhost:5678`
- Authorized redirect URIs:
  - `http://localhost:5678/rest/oauth2-credential/callback`

### **7. Save Credentials**
- Copy the **Client ID**
- Copy the **Client Secret**
- Keep these safe for n8n configuration

## ✅ **Success Indicators**
- ✅ Gmail API shows "Enabled" status
- ✅ OAuth 2.0 Client ID created
- ✅ Client ID and Secret copied
- ✅ Redirect URI includes n8n callback

## 🎯 **What's Next**
Once you have the Client ID and Secret, you'll add them to n8n in the next step!