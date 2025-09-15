# How to Update N8N Email Workflow

## Issues Fixed in New Template:

1. **✅ Username Display**: Fixed `Hello ,` → `Hello {{ $json.userName || 'Valued Customer' }},`
2. **✅ Verification Code**: Fixed empty code box → `{{ $json.verificationCode }}`  
3. **✅ Logo**: Replaced 🏪 emoji → Real Sanrico logo image

## Steps to Update:

### Method 1: Import New Workflow (Recommended)

1. **Open n8n** in your browser (`http://localhost:5678`)
2. **Delete the old workflow** (if it exists)
3. **Import the new workflow**:
   - Click "Import from file" 
   - Select `n8n-email-workflow-fixed.json`
   - Activate the workflow

### Method 2: Manual Update (Advanced)

1. Open the existing workflow in n8n
2. Edit the Gmail nodes
3. Update the HTML templates with the fixed versions

## Key Template Changes:

### Username Greeting:
```html
<!-- OLD -->
<p class="greeting">Hello ,</p>

<!-- NEW -->  
<p class="greeting">Hello {{ $json.userName || 'Valued Customer' }},</p>
```

### Verification Code Display:
```html
<!-- OLD -->
<div class="verification-code"></div>

<!-- NEW -->
<div class="verification-code">{{ $json.verificationCode }}</div>
```

### Logo Implementation:
```html
<!-- OLD -->
<div class="company-name">🏪 Sanrico Mercantile</div>

<!-- NEW -->
<div class="logo-container">
    <img src="http://localhost:3000/images/sanrico_logo_1.png" 
         alt="Sanrico Mercantile" 
         class="logo" 
         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
    <div class="company-name" style="display:none;">Sanrico Mercantile</div>
</div>
```

## Data Format Expected:

The backend sends this data to n8n:
```json
{
  "to": "user@example.com",
  "verificationCode": "1234", 
  "userName": "John Doe",
  "type": "verification"
}
```

## Test the Fix:

1. **Complete the workflow update**
2. **Test signup process**:
   - Fill signup form
   - Check email for:
     - ✅ "Hello [Name]," instead of "Hello ,"
     - ✅ Code displayed in blue box
     - ✅ Sanrico logo (not emoji)

## Troubleshooting:

- **Logo not showing**: Make sure `http://localhost:3000` is running and serving static files
- **Variables not working**: Check n8n variable syntax and workflow connections
- **Email not sending**: Verify Gmail OAuth2 credentials are set up correctly

## Backup:

The original workflow is saved as `n8n-email-workflow.json` (keep for reference)
