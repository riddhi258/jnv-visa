// Help Center specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initFAQFunctionality();
    initSearchFunctionality();
});

// FAQ functionality
function initFAQFunctionality() {
    const faqCategories = document.querySelectorAll('.faq-category');
    const faqItems = document.querySelectorAll('.faq-items');
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Category switching
    faqCategories.forEach(category => {
        category.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // Update active category
            faqCategories.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide FAQ items
            faqItems.forEach(item => {
                if (item.id === targetCategory) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
    
    // FAQ question toggling
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// Search functionality
function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        // Search button click
        searchBtn.addEventListener('click', performSearch);
        
        // Enter key press
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Real-time search suggestions (optional)
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (query.length > 2) {
                highlightSearchResults(query);
            } else {
                clearSearchHighlights();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length === 0) {
        alert('Please enter a search term');
        return;
    }
    
    // Clear previous highlights
    clearSearchHighlights();
    
    // Search through FAQ items
    const faqItems = document.querySelectorAll('.faq-item');
    let foundResults = false;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
        
        if (question.includes(query) || answer.includes(query)) {
            highlightFAQItem(item);
            foundResults = true;
        }
    });
    
    // Search through help cards
    const helpCards = document.querySelectorAll('.help-card');
    helpCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(query) || description.includes(query)) {
            highlightHelpCard(card);
            foundResults = true;
        }
    });
    
    if (!foundResults) {
        showNoResultsMessage();
    } else {
        // Scroll to first result
        const firstResult = document.querySelector('.search-highlight');
        if (firstResult) {
            firstResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function highlightSearchResults(query) {
    // This function could implement real-time search highlighting
    // For now, we'll keep it simple
}

function clearSearchHighlights() {
    document.querySelectorAll('.search-highlight').forEach(element => {
        element.classList.remove('search-highlight');
    });
    
    // Remove no results message if it exists
    const noResultsMsg = document.querySelector('.no-results-message');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function highlightFAQItem(item) {
    item.classList.add('search-highlight');
    
    // Show the FAQ category that contains this item
    const faqContainer = item.closest('.faq-items');
    if (faqContainer && faqContainer.classList.contains('hidden')) {
        // Find and activate the corresponding category
        const categoryId = faqContainer.id;
        const categoryButton = document.querySelector(`[data-category="${categoryId}"]`);
        if (categoryButton) {
            categoryButton.click();
        }
    }
    
    // Expand the FAQ item
    item.classList.add('active');
}

function highlightHelpCard(card) {
    card.classList.add('search-highlight');
}

function showNoResultsMessage() {
    const searchSection = document.querySelector('.help-search');
    const existingMessage = document.querySelector('.no-results-message');
    
    if (!existingMessage) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results-message';
        noResultsDiv.innerHTML = `
            <div class="container">
                <div style="text-align: center; padding: 2rem; background-color: var(--bg-secondary); border-radius: var(--radius-md); margin-top: 1rem;">
                    <i class="fas fa-search" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No results found</h3>
                    <p style="color: var(--text-secondary);">Try different keywords or contact our support team for assistance.</p>
                </div>
            </div>
        `;
        searchSection.appendChild(noResultsDiv);
    }
}

// Add CSS for search highlighting
const searchCSS = document.createElement('style');
searchCSS.textContent = `
    .search-highlight {
        background-color: var(--primary-green-light) !important;
        border: 2px solid var(--primary-green) !important;
        animation: searchPulse 2s ease-in-out;
    }
    
    [data-theme="dark"] .search-highlight {
        background-color: var(--primary-blue-dark) !important;
        border: 2px solid var(--secondary-blue) !important;
    }
    
    @keyframes searchPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    .no-results-message {
        animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(searchCSS);