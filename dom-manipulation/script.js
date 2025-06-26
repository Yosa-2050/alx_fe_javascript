// Initial quotes
let quotes = [
    { text: "Success is not final, failure is not fatal.", category: "Motivation" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" },
    { text: "Life is short. Smile while you still have teeth.", category: "Humor" }
];

// Populate category select
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
function displayRandomQuote() {
    const selectedCategory = categorySelect.value;
    const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.textContent = randomQuote ? randomQuote.text : "No quotes available.";
}

// Add a new quote
function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value;
    const newQuoteCategory = document.getElementById("newQuoteCategory").value;
    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        updateCategorySelect(); // Update category dropdown
        document.getElementById("newQuoteText").value = ''; // Clear input
        document.getElementById("newQuoteCategory").value = ''; // Clear input
    } else {
        alert("Please enter both quote and category.");
    }
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
document.getElementById("addQuoteButton").addEventListener("click", addQuote);

// Initial population of categories
updateCategorySelect();
