// Quote data structure
let quotes = [];

// DOM elements
const categoryFilter = document.getElementById('categoryFilter');
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportBtn');
const notification = document.getElementById('notification');

// Initialize app
function init() {
    loadQuotesFromLocalStorage();
    populateCategories();
    restoreLastSelectedCategory();
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportBtn.addEventListener('click', exportQuotes);
    showRandomQuote(); // Show first quote on load
    fetchQuotesFromServer(); // Start fetching quotes from server
    setInterval(fetchQuotesFromServer, 30000); // Fetch new quotes every 30 seconds
}

// Load quotes from local storage
function loadQuotesFromLocalStorage() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = categories.map(cat => 
        `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
    ).join('');
}

// Show random quote from selected category
function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(q => q.category === selectedCategory);
        
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available in this category.";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastSelectedCategory', selectedCategory); // Save selected category
    showRandomQuote(); // Update displayed quote based on filter
}

// Restore last selected category from local storage
function restoreLastSelectedCategory() {
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory');
    if (lastSelectedCategory) {
        categoryFilter.value = lastSelectedCategory;
    }
}

// Add new quote to collection
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    
    if (!text || !category) {
        alert('Please enter both quote text and category');
        return;
    }
    
    quotes.push({ text, category });
    saveQuotes(); // Save to local storage
    populateCategories(); // Update categories in dropdown
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');
    showRandomQuote();
}

// Export quotes to JSON file
function exportQuotes() {
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes(); // Save to local storage
        populateCategories(); // Update categories in dropdown
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts'); // Mock API
        const serverQuotes = await response.json();
        
        // Simulate conflict resolution
        const newQuotes = serverQuotes.map(q => ({
            text: q.title, // Using title as quote text
            category: 'General' // Assigning a default category
        }));

        // Check for conflicts and update local storage
        if (JSON.stringify(newQuotes) !== JSON.stringify(quotes)) {
            quotes = newQuotes; // Update local quotes with server data
            saveQuotes(); // Save updated quotes to local storage
            showNotification('Quotes updated from server.');
            populateCategories(); // Update categories in dropdown
            showRandomQuote(); // Show a new random quote
        }
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// Show notification to user
function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000); // Hide notification after 5 seconds
}

// Start the application
init();
