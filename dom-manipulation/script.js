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

    syncQuotes(); // Initial sync with server
    setInterval(syncQuotes, 30000); // Periodically sync every 30 seconds
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
    localStorage.setItem('lastSelectedCategory', selectedCategory);
    showRandomQuote();
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
    
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');
    showRandomQuote();

    postQuoteToServer(newQuote); // Post to server
}

// Post a new quote to server (Mock)
async function postQuoteToServer(quote) {
    try {
        await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1,
            }),
        });
        console.log("Quote posted to server");
    } catch (error) {
        console.error('Error posting quote:', error);
    }
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
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Sync quotes from server and resolve conflicts
async function syncQuotes() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const serverQuotes = await response.json();

        const newQuotes = serverQuotes.map(q => ({
            text: q.title,
            category: 'General',
        }));

        // Simple conflict resolution: server data takes precedence
        if (JSON.stringify(newQuotes) !== JSON.stringify(quotes)) {
            quotes = newQuotes;
            saveQuotes();
            showNotification('Quotes updated from server (conflict resolved).');
            populateCategories();
            showRandomQuote();
        }
    } catch (error) {
        console.error('Error syncing quotes:', error);
    }
}

// Show notification to user
function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Start the application
init();
