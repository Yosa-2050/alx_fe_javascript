// Core data
let quotes = [];
let autoSyncInterval = null;

// DOM elements
const categoryFilter = document.getElementById('categoryFilter');
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportBtn');
const manualSyncBtn = document.getElementById('manualSyncBtn');
const importFile = document.getElementById('importFile');
const syncNowBtn = document.getElementById('syncNowBtn');
const autoSyncToggle = document.getElementById('autoSyncToggle');
const syncIntervalSelect = document.getElementById('syncInterval');
const notification = document.getElementById('notification');
const notificationContent = document.getElementById('notificationContent');
const lastSyncTime = document.getElementById('lastSyncTime');
const syncIcon = document.getElementById('syncIcon');
const conflictPanel = document.getElementById('conflictResolution');
const localQuotesPreview = document.getElementById('localQuotesPreview');
const serverQuotesPreview = document.getElementById('serverQuotesPreview');

function init() {
    loadQuotesFromLocalStorage();
    populateCategories();
    restoreLastSelectedCategory();
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportBtn.addEventListener('click', exportQuotes);
    importFile.addEventListener('change', importFromJsonFile);
    manualSyncBtn.addEventListener('click', syncQuotes);
    syncNowBtn.addEventListener('click', syncQuotes);
    autoSyncToggle.addEventListener('change', handleAutoSync);
    syncIntervalSelect.addEventListener('change', handleAutoSync);
    document.getElementById('keepLocalBtn').addEventListener('click', () => resolveConflict('local'));
    document.getElementById('useServerBtn').addEventListener('click', () => resolveConflict('server'));
    document.getElementById('mergeBtn').addEventListener('click', () => resolveConflict('merge'));
    document.getElementById('dismissNotification').addEventListener('click', () => notification.style.display = 'none');

    handleAutoSync();
    showRandomQuote();
}

function handleAutoSync() {
    clearInterval(autoSyncInterval);
    if (autoSyncToggle.checked) {
        autoSyncInterval = setInterval(syncQuotes, parseInt(syncIntervalSelect.value));
    }
}

function loadQuotesFromLocalStorage() {
    const stored = localStorage.getItem('quotes');
    if (stored) quotes = JSON.parse(stored);
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function restoreLastSelectedCategory() {
    const last = localStorage.getItem('lastSelectedCategory');
    if (last) categoryFilter.value = last;
}

function showRandomQuote() {
    const selected = categoryFilter.value;
    const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
    if (!filtered.length) return quoteDisplay.textContent = 'No quotes available';
    const q = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = q.text;
}

function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    if (!text || !category) return alert('Enter quote and category');
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    showRandomQuote();
    postQuoteToServer({ text, category });
}

function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importFromJsonFile(event) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const imported = JSON.parse(e.target.result);
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert('Quotes imported');
    };
    reader.readAsText(event.target.files[0]);
}

async function fetchServerQuotes() {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json();
    return data.map(p => ({ text: p.title, category: 'Server' }));
}

async function postQuoteToServer(quote) {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(quote),
        headers: { 'Content-Type': 'application/json' }
    });
}

async function postQuotesToServer() {
    for (let q of quotes) {
        await postQuoteToServer(q);
    }
}

async function syncQuotes() {
    try {
        syncIcon.classList.add('syncing');
        const serverQuotes = await fetchServerQuotes();

        // Conflict detection
        const localMap = new Map(quotes.map(q => [q.text, q]));
        const serverMap = new Map(serverQuotes.map(q => [q.text, q]));

        const mergedQuotes = [...quotes];
        let newCount = 0;

        serverQuotes.forEach(serverQ => {
            if (!localMap.has(serverQ.text)) {
                mergedQuotes.push(serverQ);
                newCount++;
            }
        });

        quotes = mergedQuotes;
        saveQuotes();
        populateCategories();
        showRandomQuote();

        if (newCount > 0) {
            notificationContent.textContent = `Fetched ${newCount} new quotes from server.`;
            document.getElementById('newQuotesCount').textContent = newCount;
            document.getElementById('syncDetails').style.display = 'block';
            notification.style.display = 'block';
        }

        lastSyncTime.textContent = `Last synced at ${new Date().toLocaleTimeString()}`;
        await postQuotesToServer();
    } catch (e) {
        console.error('Sync failed', e);
    } finally {
        syncIcon.classList.remove('syncing');
    }
}

function resolveConflict(action) {
    conflictPanel.style.display = 'none';
    if (action === 'server') {
        fetchServerQuotes().then(data => {
            quotes = data;
            saveQuotes();
            populateCategories();
            showRandomQuote();
        });
    } else if (action === 'merge') {
        syncQuotes();
    } else {
        saveQuotes();
    }
    alert(`Conflict resolved using: ${action}`);
}

init();
