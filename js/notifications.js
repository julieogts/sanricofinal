document.addEventListener('DOMContentLoaded', function() {
// Notification functionality
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.badge = document.querySelector('.notification-bell .notification-badge');
        this.list = document.querySelector('.notification-list');
        
        // Initialize with empty notifications - no more fake/test notifications
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.unreadCount++;
        this.updateBadge();
        this.renderNotifications();
    }

    markAsRead(index) {
        if (this.notifications[index] && !this.notifications[index].read) {
            this.notifications[index].read = true;
            this.unreadCount--;
            this.updateBadge();
            this.renderNotifications();
        }
    }

    updateBadge() {
        if (this.badge) {
            this.badge.textContent = this.unreadCount;
            this.badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
    }

    renderNotifications() {
        if (!this.list) return;
        
        this.list.innerHTML = '';

        if (this.notifications.length === 0) {
            this.list.innerHTML = `
                <div class="no-notifications">
                    <img src="images/ruined-building-house-home-broken-house-svgrepo-com.svg" alt="No notifications">
                    <p>No current notifications</p>
                </div>
            `;
            return;
        }

        this.notifications.forEach((notification, index) => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? '' : 'unread'}`;
            item.innerHTML = `
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTime(notification.time)}</div>
                </div>
            `;
            
            item.addEventListener('click', () => this.markAsRead(index));
            this.list.appendChild(item);
        });
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }
        
        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        
        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        
        // Less than 7 days
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        
        // Otherwise show the date
        return date.toLocaleDateString();
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

    // Notification dropdown open/close logic for main pages (support multiple bells/dropdowns)
    const notificationBells = document.querySelectorAll('.notification-bell');
    const notificationDropdowns = document.querySelectorAll('.notification-dropdown');

    let bellClicked = false;

    notificationBells.forEach((bell, idx) => {
        const dropdown = bell.nextElementSibling && bell.nextElementSibling.classList.contains('notification-dropdown')
            ? bell.nextElementSibling
            : null;
        if (dropdown) {
            bell.addEventListener('click', function (e) {
                e.stopPropagation();
                bellClicked = true;
                // Close all other dropdowns first
                notificationDropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
                dropdown.classList.toggle('show');
            });
        }
    });

    document.addEventListener('click', function (e) {
        if (bellClicked) {
            bellClicked = false;
            return;
        }
        notificationDropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });

    // Notification logic (copied from staff-dashboard)
    let notifications = [];
    
    // Load notifications (check for user-specific notifications first)
    function loadNotifications() {
        // Try to get user-specific notifications if user is logged in
        if (typeof Auth !== 'undefined' && Auth.isLoggedIn && Auth.isLoggedIn()) {
            const currentUser = Auth.getCurrentUser();
            if (currentUser && currentUser.id) {
                const userNotificationKey = `notifications_${currentUser.id}`;
                const userNotifications = JSON.parse(localStorage.getItem(userNotificationKey) || '[]');
                
                // Merge with general notifications, prioritizing user-specific ones
                const generalNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
                
                // Filter general notifications to only include ones for this user or system-wide ones
                const relevantGeneralNotifications = generalNotifications.filter(notification => 
                    !notification.userId || notification.userId === currentUser.id
                );
                
                // Combine and deduplicate notifications based on ID
                const allNotifications = [...userNotifications, ...relevantGeneralNotifications];
                const uniqueNotifications = allNotifications.filter((notification, index, self) =>
                    self.findIndex(n => n.id === notification.id) === index
                );
                
                // Sort by time (newest first)
                notifications = uniqueNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
                return;
            }
        }
        
        // Fallback to general notifications
        notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    }
    
    // Initialize notifications
    loadNotifications();

    function updateNotifications() {
        const badge = document.getElementById('notificationBadge');
        const list = document.getElementById('notificationList');
        const unreadCount = notifications.filter(n => !n.read).length;
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
        if (list) {
            if (notifications.length === 0) {
                list.innerHTML = '<div class="no-notifications">No notifications</div>';
            } else {
                list.innerHTML = notifications.map((notification, idx) => `
                    <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                        <div class="notification-content">
                            <div class="notification-title">${notification.title}</div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-time">${formatTime(notification.time)}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff/60000)} minute(s) ago`;
        if (diff < 86400000) return `${Math.floor(diff/3600000)} hour(s) ago`;
        if (diff < 604800000) return `${Math.floor(diff/86400000)} day(s) ago`;
        return date.toLocaleDateString();
    }

    document.getElementById('notificationBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('notificationDropdown')?.classList.toggle('show');
    });
    document.addEventListener('click', () => {
        document.getElementById('notificationDropdown')?.classList.remove('show');
    });
    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        // Clear both general and user-specific notifications
        notifications = [];
        
        // Clear general notifications
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Clear user-specific notifications if logged in
        if (typeof Auth !== 'undefined' && Auth.isLoggedIn && Auth.isLoggedIn()) {
            const currentUser = Auth.getCurrentUser();
            if (currentUser && currentUser.id) {
                const userNotificationKey = `notifications_${currentUser.id}`;
                localStorage.setItem(userNotificationKey, JSON.stringify([]));
            }
        }
        
        updateNotifications();
    });
    document.getElementById('notificationList')?.addEventListener('click', (e) => {
        const item = e.target.closest('.notification-item');
        if (item) {
            const idx = Array.from(item.parentNode.children).indexOf(item);
            if (notifications[idx]) {
                const notification = notifications[idx];
                
                // Mark as read
                if (!notification.read) {
                    notifications[idx].read = true;
                    
                    // Save to the correct localStorage key
                    if (typeof Auth !== 'undefined' && Auth.isLoggedIn && Auth.isLoggedIn()) {
                        const currentUser = Auth.getCurrentUser();
                        if (currentUser && currentUser.id) {
                            const userNotificationKey = `notifications_${currentUser.id}`;
                            const userNotifications = JSON.parse(localStorage.getItem(userNotificationKey) || '[]');
                            
                            // Find and update the notification in user-specific storage
                            const userNotifIndex = userNotifications.findIndex(n => n.id === notification.id);
                            if (userNotifIndex !== -1) {
                                userNotifications[userNotifIndex].read = true;
                                localStorage.setItem(userNotificationKey, JSON.stringify(userNotifications));
                            }
                        }
                    } else {
                        // Fallback to general notifications
                        localStorage.setItem('notifications', JSON.stringify(notifications));
                    }
                    
                    updateNotifications();
                }
                
                // Handle click actions for different notification types
                if (notification.clickAction === 'view_order' && notification.orderNumber) {
                    // For order success/approved notifications - navigate to order history
                    sessionStorage.setItem('focusOrderNumber', notification.orderNumber);
                    window.location.href = 'order-history.html';
                } else if (notification.type === 'order_denial') {
                    // For order denial notifications - could navigate to FAQ or contact page
                    // For now, just show a helpful message
                    if (notification.denialReason) {
                        alert(`Order ${notification.orderNumber} was denied.\n\nReason: ${notification.denialReason}\n\nPlease contact us if you have any questions.`);
                    } else {
                        alert(`Order ${notification.orderNumber} was denied. Please contact us if you have any questions.`);
                    }
                }
            }
        }
    });

    // Listen for storage changes to update notifications in real-time
    window.addEventListener('storage', function(e) {
        // Check if it's a notification update
        if (e.key && (e.key.startsWith('notifications_') || e.key === 'notifications')) {
            console.log('📬 Notification storage changed, reloading notifications');
            loadNotifications();
            updateNotifications();
        }
    });

    // Also listen for custom notification events
    window.addEventListener('notificationAdded', function(e) {
        console.log('📬 Custom notification event received');
        loadNotifications();
        updateNotifications();
    });

    // Remove hardcoded test notifications - start with clean state
    updateNotifications();

// Example usage:
// notificationManager.addNotification({
//     title: 'New Order',
//     message: 'Your order #12345 has been confirmed',
//     time: new Date(),
//     read: false
// }); 
}); 