// Initial quotes
let quotes = [
    { text: "Success is not final, failure is not fatal.", category: "Motivation" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" },
    { text: "Life is short. Smile while you still have teeth.", category: "Humor" }
];

// DOM references
const categorySelect = document.getElementById("categorySelect");
const quoteDisplay = document.getElementById("quoteDisplay");

// Add initial categories to dropdown
function updateCategorySelect() {
    const categories = [...new Set(quotes.map(q => q.category))];
    categorySelect.innerHTML = '<option value="all">All</option>';
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Show a random quote
function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    const filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available.";
        return;
    }

    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.textContent = randomQuote.text;
}

// Add a new quote
function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value.trim();
    const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (!newQuoteText || !newQuoteCategory) {
        alert("Please enter both quote and category.");
        return;
    }

    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    updateCategorySelect();
    document.getElementById("newQuoteText").value = '';
    document.getElementById("newQuoteCategory").value = '';
}

// Event listener for the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize category list
updateCategorySelect();
