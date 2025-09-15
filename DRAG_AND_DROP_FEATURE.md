# Drag and Drop Feature

## Overview
The shop page now includes drag and drop functionality that allows users to drag the shopping cart icon (🛒) from product cards directly to the cart tab, providing an intuitive and modern shopping experience. The feature includes stock validation to prevent adding out-of-stock items to the cart.

## How It Works

### For Users:
1. **Browse Products**: Navigate to the shop page and browse the product grid
2. **Drag Cart Icons**: Click and drag the shopping cart icon (🛒) on any product card to the cart tab on the right side of the screen
3. **Stock Validation**: 
   - Products with stock ≥ 1 show a shopping cart icon (🛒) and are draggable
   - Products with stock < 1 show a red X icon (❌) and cannot be dragged
4. **Visual Feedback**: 
   - Cart icons show grab cursor and scale up on hover (in-stock items)
   - Out-of-stock items show "not-allowed" cursor and red styling
   - Cart tab highlights when dragging over it
   - Success animation appears when item is added
5. **Cart Opens**: The cart tab automatically opens when you drop an item
6. **Item Added**: The product is added to your cart with quantity 1 (or increments if already present)

### Visual Indicators:
- **In-Stock Cart Icons (🛒)**: 
  - Show grab cursor on hover
  - Scale up and change color on hover
  - Become semi-transparent and rotated when dragging
  - Positioned in the top-right corner of each product card
- **Out-of-Stock Icons (❌)**:
  - Show "not-allowed" cursor
  - Red background color
  - Reduced opacity
  - Cannot be dragged
- **Cart Tab**:
  - Changes color and shows dashed border when dragging over
  - Scales up slightly for better visibility
  - Opens automatically when item is dropped

## Stock Validation

### Frontend Validation:
- **Visual Indicators**: Out-of-stock products display a red X icon (❌) instead of the shopping cart icon (🛒)
- **Draggable State**: Only products with stock ≥ 1 are marked as draggable
- **Event Listeners**: Drag event listeners are only attached to in-stock items
- **CSS Styling**: Out-of-stock items have distinct red styling and "not-allowed" cursor

### Backend Validation:
- **Drop Validation**: When an item is dropped, the system checks stock quantity before adding to cart
- **Error Feedback**: If an out-of-stock item somehow gets dropped, an error message is shown
- **Prevention**: Out-of-stock items are prevented from being added to the cart

## Technical Implementation

### Files Modified:
1. **`js/shop.js`**:
   - Added stock validation to product card generation
   - Conditional rendering of cart icons based on stock quantity
   - Added `draggable` attribute only for in-stock items
   - Added stock quantity to drag data
   - Event listeners only attached to in-stock drag handles

2. **`js/cart-tab.js`**:
   - Added stock validation in drop handler
   - Added error feedback for out-of-stock items
   - Integrated with existing cart system

3. **`css/cart-tab.css`**:
   - Added drag-over states for cart tab
   - Added drop feedback animations
   - Enhanced visual feedback for drag operations

4. **`shop.html`**:
   - Added drag handle styles for cart icons
   - Added out-of-stock styles with red background and "not-allowed" cursor
   - Removed draggable properties from product cards
   - Added visual indicators for draggable cart icons

### Key Features:
- **Stock Validation**: Prevents adding out-of-stock items to cart
- **Clear Visual Feedback**: Different icons and styling for in-stock vs out-of-stock items
- **Seamless Integration**: Works with existing cart system
- **User Feedback**: Toast notifications and visual animations
- **Accessibility**: Proper ARIA labels and keyboard support
- **Cross-browser**: Works on modern browsers with HTML5 drag and drop

## Browser Support
This feature uses the HTML5 Drag and Drop API and works in all modern browsers:
- Chrome 4+
- Firefox 3.5+
- Safari 3.1+
- Edge 12+

## Usage Tips
- Only drag the cart icon (🛒) from products that are in stock
- Out-of-stock products will show a red X icon (❌) and cannot be dragged
- Drag the cart icon to either the cart tab button or the open cart content
- The cart will automatically open when you drop an item
- If an item is already in your cart, dropping it again will increment the quantity
- You can still click on product cards to view product details
- The drag operation doesn't interfere with normal product navigation
- The cart icon is clearly visible and positioned consistently on all product cards 