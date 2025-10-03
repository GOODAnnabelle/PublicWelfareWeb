// Event handling

// Bind category switch events
function bindCategoryEvents() {
    document.querySelector('.categories').addEventListener('click', function(e) {
        const categoryItem = e.target.closest('li');
        if (!categoryItem) return;
        
        const categoryId = categoryItem.dataset.category;
        currentState.currentCategory = categoryId;
        
        // Update UI
        document.querySelectorAll('.categories li').forEach(li => {
            li.classList.remove('active');
        });
        categoryItem.classList.add('active');
        
        updateCategoryTitle();
        renderMenuItems();
    });
}

// Bind search event
function bindSearchEvent() {
    const searchInput = document.getElementById('search-input');
    const debouncedSearch = debounce(function() {
        currentState.searchQuery = searchInput.value;
        renderMenuItems();
    }, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
}

// Bind add to order events
function bindAddToOrderEvents() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            addToOrder(itemId);
            renderOrderItems();
            updateOrderTotal();
            
            // Show add success feedback
            const itemCard = e.target.closest('.item-card');
            itemCard.style.transform = 'scale(1.05)';
            setTimeout(() => {
                itemCard.style.transform = '';
            }, 300);
        }
    });
}

// Bind order item events
function bindOrderItemEvents() {
    document.getElementById('order-items-container').addEventListener('click', function(e) {
        const orderItem = e.target.closest('.order-item');
        if (!orderItem) return;
        
        const itemId = parseInt(orderItem.dataset.id);
        
        if (e.target.classList.contains('minus') || e.target.closest('.minus')) {
            updateOrderItemQuantity(itemId, -1);
        } else if (e.target.classList.contains('plus') || e.target.closest('.plus')) {
            updateOrderItemQuantity(itemId, 1);
        } else if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            removeOrderItem(itemId);
        }
        
        renderOrderItems();
        updateOrderTotal();
    });
}

// Bind checkout events
function bindCheckoutEvents() {
    document.getElementById('submit-order').addEventListener('click', function() {
        if (currentState.orderItems.length === 0) {
            alert('Order is empty, please add items first');
            return;
        }
        
        const total = calculateTotal(currentState.orderItems).rawTotal;
        if (confirm(`Confirm to submit order? Total: ${formatPrice(total)}`)) {
            alert('Order submitted! Kitchen is preparing your meal.');
            clearOrder();
            renderOrderItems();
            updateOrderTotal();
        }
    });
    
    document.getElementById('continue-add').addEventListener('click', function() {
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
