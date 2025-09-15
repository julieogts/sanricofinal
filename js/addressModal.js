// Address Modal Management System
class AddressModalManager {
    constructor() {
        this.GEOAPIFY_API_KEY = 'a85e803098a1455da0da79145e5ca8e1';
        this.GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';
        this.autocompleteCache = new Map();
        this.isModalInitialized = false;
        this.onAddressSaved = null; // Callback function
    }

    // Initialize the modal (create if doesn't exist)
    init() {
        console.log('AddressModal.init() called, isModalInitialized:', this.isModalInitialized);
        if (this.isModalInitialized) return;
        
        try {
            this.createModal();
            this.setupEventListeners();
            this.isModalInitialized = true;
            console.log('AddressModal initialized successfully');
        } catch (error) {
            console.error('Error initializing address modal:', error);
        }
    }

    // Create the modal HTML structure
    createModal() {
        console.log('Creating address modal HTML...');
        
        // Check if modal already exists
        if (document.getElementById('addressModal')) {
            console.log('Address modal already exists in DOM');
            return;
        }
        
        const modalHTML = `
            <div class="modal address-modal" id="addressModal" style="z-index: 10000;">
                <div class="modal-content" style="max-width: 600px; width: 90%;">
                    <button class="modal-close" id="closeAddressModal">×</button>
                    <h3 id="modalTitle">Add Address</h3>
                    
                    <form class="address-form" id="addressForm">
                        <div class="form-group">
                            <label for="addressLabel">Address Label *</label>
                            <input type="text" id="addressLabel" class="form-control" placeholder="e.g., Home, Office, etc." required>
                        </div>

                        <div class="form-group">
                            <label for="streetAddress">Street Address (House Number and Street) *</label>
                            <input type="text" id="streetAddress" class="form-control" placeholder="Enter house number and street name" required>
                        </div>

                        <div class="form-group">
                            <label for="barangay">Barangay *</label>
                            <input type="text" id="barangay" class="form-control" placeholder="Enter barangay" required>
                        </div>

                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label for="city">City/Municipality *</label>
                                <input type="text" id="city" class="form-control" placeholder="Enter city or municipality" required>
                            </div>
                            <div class="form-group">
                                <label for="postalCode">Postal Code *</label>
                                <input type="text" id="postalCode" class="form-control" placeholder="Enter 4-digit postal code" pattern="[0-9]{4}" maxlength="4" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="province">Province/Region *</label>
                            <input type="text" id="province" class="form-control" placeholder="Enter province or region" required>
                        </div>

                        <div class="form-group default-address-row">
                            <input type="checkbox" id="setAsDefault" style="accent-color: #e53935; width: 20px; height: 20px; margin-right: 10px;">
                            <label for="setAsDefault" style="font-weight: 500; color: #222; font-size: 1rem; cursor: pointer;">Set as default address</label>
                        </div>

                        <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                            <button type="button" class="btn-cancel" id="cancelAddressBtn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Cancel</button>
                            <button type="submit" class="btn-save" id="saveAddressBtn" style="background: #e63946; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                                <span class="btn-text">Save Address</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add modal styles if they don't exist
        if (!document.getElementById('addressModalStyles')) {
            console.log('Adding address modal styles...');
            const styles = document.createElement('style');
            styles.id = 'addressModalStyles';
            styles.textContent = `
                .address-modal .modal-content {
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                
                .address-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding-right: 8px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .form-group label {
                    font-weight: 600;
                    color: #333;
                }
                
                .autocomplete-container {
                    position: relative;
                }
                
                .autocomplete-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    display: none;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .suggestion-item {
                    padding: 0.75rem;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    transition: background 0.2s ease;
                }
                
                .suggestion-item:hover,
                .suggestion-item.highlighted {
                    background: #f8f9fa;
                }
                
                .suggestion-item:last-child {
                    border-bottom: none;
                }
                
                .suggestion-main {
                    font-weight: 500;
                    color: #333;
                }
                
                .suggestion-sub {
                    font-size: 0.9rem;
                    color: #666;
                    margin-top: 0.25rem;
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #e63946;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 0.5rem;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .btn-cancel:hover {
                    background: #5a6268 !important;
                }
                
                .btn-save:hover {
                    background: #dc2626 !important;
                }
                
                .btn-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Custom scrollbar for the modal */
                .address-modal .modal-content::-webkit-scrollbar {
                    width: 8px;
                }

                .address-modal .modal-content::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }

                .address-modal .modal-content::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }

                .address-modal .modal-content::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                /* Firefox scrollbar */
                .address-modal .modal-content {
                    scrollbar-width: thin;
                    scrollbar-color: #c1c1c1 #f1f1f1;
                }
                
                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr !important;
                    }
                    
                    .address-modal .modal-content {
                        max-height: 85vh;
                        width: 95%;
                    }
                }
            `;
            document.head.appendChild(styles);
            console.log('Address modal styles added to head');
        }

        // Create a temporary div to hold the modal HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        const modalElement = tempDiv.firstElementChild;
        
        // Append to body
        document.body.appendChild(modalElement);
        console.log('Address modal HTML appended to body');
        
        // Verify the modal was added
        const addedModal = document.getElementById('addressModal');
        console.log('Address modal verification:', {
            found: !!addedModal,
            className: addedModal ? addedModal.className : 'not found',
            style: addedModal ? addedModal.style.cssText : 'not found'
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Modal close buttons
        document.getElementById('closeAddressModal').addEventListener('click', () => this.close());
        document.getElementById('cancelAddressBtn').addEventListener('click', () => this.close());

        // Form submission
        document.getElementById('addressForm').addEventListener('submit', (e) => this.handleSubmit(e));

        // Postal code validation
        document.getElementById('postalCode').addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    // Show the modal
    show(isPostLogin = false) {
        console.log('AddressModal.show() called with isPostLogin:', isPostLogin);
        this.init();
        const modal = document.getElementById('addressModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('addressForm');
        
        console.log('Modal elements found:', {
            modal: !!modal,
            title: !!title,
            form: !!form
        });
        
        if (isPostLogin) {
            title.textContent = 'Add Your First Address';
            // Check if user already has addresses (skip if they do)
            if (this.userHasAddresses()) {
                console.log('User already has addresses, skipping modal display');
                return; // Don't show modal if user already has addresses
            }
        } else {
            title.textContent = 'Add Address';
        }
        
        form.reset();
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        console.log('Modal show class added, modal classList:', modal.classList.toString());
        
        // Reset scroll position to top
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.getElementById('addressLabel');
            if (firstInput) {
                firstInput.focus();
                console.log('Focus set to first input');
            } else {
                console.error('First input not found');
            }
        }, 100);
    }

    // Close the modal
    close() {
        const modal = document.getElementById('addressModal');
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.getElementById('addressForm').reset();
        
        // Clear all autocomplete suggestions
        document.querySelectorAll('.autocomplete-suggestions').forEach(container => {
            container.style.display = 'none';
        });
    }

    // Handle form submission
    async handleSubmit(e) {
        console.log('DEBUG: handleSubmit called');
        e.preventDefault();
        
        const submitBtn = document.getElementById('saveAddressBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            btnText.innerHTML = '<span class="loading-spinner"></span>Saving...';
            
            const currentUser = Auth.getCurrentUser();
            const addressData = {
                id: this.generateId(),
                label: document.getElementById('addressLabel').value.trim(),
                streetAddress: document.getElementById('streetAddress').value.trim(),
                barangay: document.getElementById('barangay').value.trim(),
                city: document.getElementById('city').value.trim(),
                postalCode: document.getElementById('postalCode').value.trim(),
                province: document.getElementById('province').value.trim(),
                isDefault: document.getElementById('setAsDefault').checked,
                email: currentUser.email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            console.log('DEBUG: addressData to save:', addressData);

            // Validate required fields
            const requiredFields = ['label', 'streetAddress', 'barangay', 'city', 'postalCode', 'province'];
            for (const field of requiredFields) {
                if (!addressData[field]) {
                    throw new Error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
                }
            }

            // Validate postal code
            if (!/^\d{4}$/.test(addressData.postalCode)) {
                throw new Error('Postal code must be exactly 4 digits');
            }

            // Save address
            await this.saveAddress(addressData);
            
            showToast('Address added successfully!', 'success');
            this.close();
            
            // Call callback if provided
            if (this.onAddressSaved) {
                this.onAddressSaved(addressData);
            }
            
        } catch (error) {
            console.error('Error saving address:', error);
            showToast(error.message || 'Failed to save address', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.textContent = originalText;
        }
    }

    // Save address to storage/database
    async saveAddress(addressData) {
        console.log('DEBUG: saveAddress called with:', addressData);
        try {
            const currentUser = Auth.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not logged in');
            }

            // Use the backend server URL for API requests
            const apiBaseUrl = 'http://localhost:3000'; // Change this if your backend runs elsewhere
            console.log('DEBUG: Sending fetch to ' + apiBaseUrl + '/api/user-addresses');
            const response = await fetch(apiBaseUrl + '/api/user-addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, addressData })
            });
            const result = await response.json();
            console.log('DEBUG: Response from ' + apiBaseUrl + '/api/user-addresses:', result);
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to save address to server');
            }
        } catch (error) {
            console.error('Error saving address to storage:', error);
            throw error;
        }
    }

    // Check if user has addresses
    userHasAddresses() {
        try {
            const currentUser = Auth.getCurrentUser();
            if (!currentUser) return false;
            
            const stored = localStorage.getItem(`user_addresses_${currentUser.id}`);
            const userAddresses = stored ? JSON.parse(stored) : [];
            return userAddresses.length > 0;
        } catch (error) {
            return false;
        }
    }

    // Generate unique ID
    generateId() {
        return 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Set callback for when address is saved
    setOnAddressSaved(callback) {
        this.onAddressSaved = callback;
    }
}

// Create global instance
window.AddressModal = new AddressModalManager();

// Global function to show address modal (for post-login)
window.showAddressModal = function(isPostLogin = false) {
    window.AddressModal.show(isPostLogin);
};

// Global function to check if user has addresses
window.hasAddresses = function() {
    return window.AddressModal.userHasAddresses();
};

// Global test function for debugging
window.testAddressModal = function() {
    console.log('Testing address modal...');
    console.log('window.AddressModal:', typeof window.AddressModal);
    console.log('window.showAddressModal:', typeof window.showAddressModal);
    console.log('window.hasAddresses:', typeof window.hasAddresses);
    console.log('Auth.getCurrentUser():', Auth.getCurrentUser());
    console.log('User has addresses:', window.hasAddresses());
    
    try {
        window.showAddressModal(true);
        console.log('Address modal show function called successfully');
    } catch (error) {
        console.error('Error calling showAddressModal:', error);
    }
}; 