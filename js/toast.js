// Toast notification functionality
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    
    if (!toast) {
        console.error('Toast element not found. Make sure you have a div with id="toast" in your HTML.');
        // Fallback to alert if toast element isn't available
        alert(message);
        return;
    }
    
    // If type is a number (old duration parameter), treat it as duration
    if (typeof type === 'number') {
        duration = type;
        type = 'info';
    }
    
    toast.textContent = message;
    
    // Remove any existing type classes (using the CSS class names that exist in styles.css)
    toast.classList.remove('show', 'success', 'error', 'warning', 'info');
    
    // Add type-specific class (using the CSS class names that exist in styles.css)
    switch(type) {
        case 'success':
            toast.classList.add('success');
            break;
        case 'error':
            toast.classList.add('error');
            break;
        case 'warning':
            toast.classList.add('warning');
            break;
        case 'info':
        default:
            toast.classList.add('info');
            break;
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Function to show a confirmation dialog
// This is a placeholder that will be overridden by the custom implementation in profile.html
function showConfirm(message) {
    return confirm(message);
}

// Loading utilities
window.LoadingUtils = {
    show: function(text = 'LOADING', type = 'default') {
        // Ensure BODY exists; if not, defer until DOM is ready
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => {
                try { window.LoadingUtils.show(text, type); } catch (e) {}
            }, { once: true });
            return;
        }
        const overlayId = type === 'dashboard' ? 'dashboardLoading' : 'loadingOverlay';
        let overlay = document.getElementById(overlayId);
        if (!overlay) {
            // Dynamically create the overlay if it's missing on this page
            overlay = document.createElement('div');
            overlay.id = overlayId;
            overlay.className = type === 'dashboard' ? 'dashboard-loading' : 'loading-overlay';
            overlay.innerHTML = `
                <div class="${type === 'dashboard' ? 'dashboard-spinner' : 'loading-spinner'}">
                    <div class="spinner"></div>
                    <div class="loading-text">LOADING</div>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            let loadingText = overlay.querySelector('.loading-text');
            if (!loadingText) {
                loadingText = document.createElement('div');
                loadingText.className = 'loading-text';
                const spinnerContainer = overlay.querySelector('.loading-spinner, .dashboard-spinner');
                (spinnerContainer || overlay).appendChild(loadingText);
            }
            loadingText.textContent = 'LOADING';
        }
        overlay.classList.add('show');
    },
    
    hide: function(type = 'default') {
        const overlay = document.getElementById(type === 'dashboard' ? 'dashboardLoading' : 'loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    },
    
    updateText: function(text, type = 'default') {
        const overlay = document.getElementById(type === 'dashboard' ? 'dashboardLoading' : 'loadingOverlay');
        if (overlay) {
            const loadingText = overlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'LOADING';
            }
        }
    }
}; 