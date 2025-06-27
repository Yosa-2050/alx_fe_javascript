// Quote data structure
let quotes = [];

// DOM elements
const categorySelect = document.getElementById('categorySelect');
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportBtn');

// Initialize app

function init() {
    loadQuotesFromLocalStorage();
    updateCategorySelect();
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportBtn.addEventListener('click', exportQuotes);

    // ✅ Trigger file input on import button click
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    showRandomQuote(); // Optional: show a quote on first load
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

// Populate category dropdown
function updateCategorySelect() {
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
    ).join('');
}

// Show random quote from selected category
function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(q => q.category === selectedCategory);
        
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available in this category.";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = filteredQuotes[randomIndex].text;

    // Store last viewed quote in session storage
    sessionStorage.setItem('lastViewedQuote', filteredQuotes[randomIndex].text);
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
    updateCategorySelect();
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
        updateCategorySelect();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Start the application
init();
