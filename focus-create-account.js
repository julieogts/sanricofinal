// Helper function to focus on create account link
function focusCreateAccountLink() {
    // Try different selectors for the create account link
    const selectors = [
        '.signup-link',
        'button[onclick*="showRegistrationModal"]',
        'a[onclick*="showRegistrationModal"]',
        '.create-account-link',
        '.register-link'
    ];
    
    let createAccountLink = null;
    
    // Find the create account link using various selectors
    for (const selector of selectors) {
        createAccountLink = document.querySelector(selector);
        if (createAccountLink) {
            console.log(`Found create account link with selector: ${selector}`);
            break;
        }
    }
    
    if (createAccountLink) {
        // Focus and highlight the link
        createAccountLink.focus();
        
        // Add visual highlighting with animation
        createAccountLink.style.outline = '2px solid #3498db';
        createAccountLink.style.outlineOffset = '2px';
        createAccountLink.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        createAccountLink.style.borderRadius = '4px';
        createAccountLink.style.transition = 'all 0.3s ease';
        
        // Add a gentle pulse animation
        let pulseCount = 0;
        const pulseInterval = setInterval(() => {
            if (pulseCount < 3) {
                createAccountLink.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    createAccountLink.style.transform = 'scale(1)';
                }, 150);
                pulseCount++;
            } else {
                clearInterval(pulseInterval);
            }
        }, 300);
        
        // Remove highlight after 4 seconds
        setTimeout(() => {
            createAccountLink.style.outline = '';
            createAccountLink.style.outlineOffset = '';
            createAccountLink.style.backgroundColor = '';
            createAccountLink.style.transition = '';
        }, 4000);
        
        return true;
    } else {
        console.warn('Create account link not found');
        return false;
    }
}

// Make it globally available
window.focusCreateAccountLink = focusCreateAccountLink;