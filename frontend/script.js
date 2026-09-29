// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// Global state
let currentMethod = 'traditional';
let lastResults = null;

// Sample texts
const sampleTexts = {
    1: "Saya sedang belajar preprocessing text untuk tugas kuliah Kecerdasan Buatan. Preprocessing adalah langkah penting dalam Natural Language Processing!",
    2: "Indonesia memiliki 17.504 pulau dan merupakan negara kepulauan terbesar di dunia. Pada tahun 2024, jumlah penduduk Indonesia mencapai 275 juta jiwa.",
    3: "Machine Learning dan Deep Learning adalah cabang dari Artificial Intelligence yang sangat populer saat ini. Banyak aplikasi menggunakan teknologi ini seperti ChatGPT, Google Translate, dan lain-lain.",
    4: "gue lagi belajar NLP nih, bgt seru! gk nyangka bisa buat aplikasi preprocessing text sendiri. pengen bgt ngembangin ini utk tugas kuliah."
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAPIStatus();
    // Check API status every 30 seconds
    setInterval(checkAPIStatus, 30000);
});

// Check API Status
async function checkAPIStatus() {
    const statusElement = document.getElementById('apiStatus');
    const statusIcon = document.getElementById('apiStatusIcon');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            statusElement.textContent = 'Online';
            statusIcon.className = 'fas fa-circle online';
        } else {
            statusElement.textContent = 'Offline';
            statusIcon.className = 'fas fa-circle offline';
        }
    } catch (error) {
        statusElement.textContent = 'Offline';
        statusIcon.className = 'fas fa-circle offline';
    }
}

// Switch tabs
function switchTab(method) {
    currentMethod = method;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update options panels
    document.querySelectorAll('.options-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const panelId = method + 'Options';
    document.getElementById(panelId).classList.add('active');
}

// Load sample text
function loadSample(number) {
    document.getElementById('inputText').value = sampleTexts[number];
}

// Clear input
function clearInput() {
    document.getElementById('inputText').value = '';
}

// Get traditional options
function getTraditionalOptions() {
    return {
        normalize_slang: document.getElementById('normalizeSlang').checked,
        lowercase: document.getElementById('lowercase').checked,
        remove_punctuation: document.getElementById('removePunctuation').checked,
        remove_numbers: document.getElementById('removeNumbers').checked,
        remove_stopwords: document.getElementById('removeStopwords').checked,
        stemming: document.getElementById('stemming').checked
    };
}

// Process text
async function processText() {
    const text = document.getElementById('inputText').value.trim();
    
    if (!text) {
        alert('Masukkan teks terlebih dahulu!');
        return;
    }
    
    // Show loading
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    
    try {
        let result;
        
        if (currentMethod === 'traditional') {
            result = await processTraditional(text);
        } else if (currentMethod === 'indobert') {
            result = await processIndoBERT(text);
        } else if (currentMethod === 'both') {
            result = await processBoth(text);
        }
        
        lastResults = result;
        displayResults(result);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan: ' + error.message);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// Process with traditional method
async function processTraditional(text) {
    const options = getTraditionalOptions();
    
    const response = await fetch(`${API_BASE_URL}/api/preprocess/traditional`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, options })
    });
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    return await response.json();
}

// Process with IndoBERT
async function processIndoBERT(text) {
    const maxLength = parseInt(document.getElementById('maxLength').value);
    
    const response = await fetch(`${API_BASE_URL}/api/preprocess/indobert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, max_length: maxLength })
    });
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    return await response.json();
}

// Process with both methods
async function processBoth(text) {
    const traditionalOptions = getTraditionalOptions();
    const maxLength = parseInt(document.getElementById('maxLength').value);
    
    const response = await fetch(`${API_BASE_URL}/api/preprocess/both`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            text, 
            traditional_options: traditionalOptions,
            max_length: maxLength 
        })
    });
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    return await response.json();
}

// Display results
function displayResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    // Hide all result cards first
    document.getElementById('traditionalResults').style.display = 'none';
    document.getElementById('indobertResults').style.display = 'none';
    document.getElementById('bothResults').style.display = 'none';
    document.getElementById('slangInfo').style.display = 'none';
    
    if (data.method === 'traditional') {
        displayTraditionalResults(data.result);
    } else if (data.method === 'indobert') {
        displayIndoBERTResults(data.result);
    } else if (data.method === 'both') {
        displayBothResults(data.result);
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Display traditional results
function displayTraditionalResults(result) {
    const card = document.getElementById('traditionalResults');
    card.style.display = 'block';
    
    // Display texts
    document.getElementById('originalText').textContent = result.original_text;
    document.getElementById('processedText').textContent = result.processed_text;
    
    // Display steps
    const stepsContainer = document.getElementById('stepsApplied');
    stepsContainer.innerHTML = result.steps_applied
        .map(step => `<span class="step-badge"><i class="fas fa-check"></i> ${step}</span>`)
        .join('');
    
    // Display slang info if available
    if (result.slang_info) {
        displaySlangInfo(result.slang_info);
    }
    
    // Display statistics
    displayStatistics(result.statistics);
}

// Display IndoBERT results
function displayIndoBERTResults(result) {
    const card = document.getElementById('indobertResults');
    card.style.display = 'block';
    
    // Display tokens
    const tokensContainer = document.getElementById('tokens');
    tokensContainer.innerHTML = result.tokens
        .map(token => {
            const isSpecial = token.startsWith('[') && token.endsWith(']');
            return `<span class="token ${isSpecial ? 'special' : ''}">${token}</span>`;
        })
        .join('');
    
    // Display token IDs
    document.getElementById('tokenIds').textContent = result.token_ids.join(', ');
    
    // Display special tokens
    const specialTokensHtml = `
        <div><strong>CLS Token:</strong> ${result.special_tokens.cls_token}</div>
        <div><strong>SEP Token:</strong> ${result.special_tokens.sep_token}</div>
        <div><strong>PAD Token:</strong> ${result.special_tokens.pad_token}</div>
        <div><strong>UNK Token:</strong> ${result.special_tokens.unk_token}</div>
    `;
    document.getElementById('specialTokens').innerHTML = specialTokensHtml;
    
    // Display statistics
    displayStatistics(result.statistics);
}

// Display both results
function displayBothResults(result) {
    const card = document.getElementById('bothResults');
    card.style.display = 'block';
    
    const html = `
        <div style="margin-bottom: 30px;">
            <h4 style="color: var(--primary-color); margin-bottom: 15px;">Traditional Preprocessing</h4>
            <div class="text-box" style="margin-bottom: 10px;">
                <strong>Original:</strong><br>${result.traditional.original_text}
            </div>
            <div class="text-box processed">
                <strong>Processed:</strong><br>${result.traditional.processed_text}
            </div>
            <div style="margin-top: 10px;">
                <strong>Steps:</strong>
                <div class="steps-list" style="margin-top: 10px;">
                    ${result.traditional.steps_applied.map(step => 
                        `<span class="step-badge">${step}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h4 style="color: var(--primary-color); margin-bottom: 15px;">IndoBERT Tokenization (Original Text)</h4>
            <div class="tokens-container" style="margin-bottom: 10px;">
                ${result.indobert_original.tokens.map(token => {
                    const isSpecial = token.startsWith('[') && token.endsWith(']');
                    return `<span class="token ${isSpecial ? 'special' : ''}">${token}</span>`;
                }).join('')}
            </div>
            <div class="info-box">
                <strong>Total Tokens:</strong> ${result.indobert_original.statistics.total_tokens}
            </div>
        </div>
        
        <div>
            <h4 style="color: var(--primary-color); margin-bottom: 15px;">IndoBERT Tokenization (After Preprocessing)</h4>
            <div class="tokens-container" style="margin-bottom: 10px;">
                ${result.indobert_preprocessed.tokens.map(token => {
                    const isSpecial = token.startsWith('[') && token.endsWith(']');
                    return `<span class="token ${isSpecial ? 'special' : ''}">${token}</span>`;
                }).join('')}
            </div>
            <div class="info-box">
                <strong>Total Tokens:</strong> ${result.indobert_preprocessed.statistics.total_tokens}
            </div>
        </div>
    `;
    
    document.getElementById('bothResultsContent').innerHTML = html;
    
    // Display combined statistics
    const stats = {
        'Original Words': result.traditional.statistics.original_word_count,
        'Processed Words': result.traditional.statistics.processed_word_count,
        'Original Tokens': result.indobert_original.statistics.total_tokens,
        'Processed Tokens': result.indobert_preprocessed.statistics.total_tokens
    };
    displayStatistics(stats);
}

// Display statistics
function displayStatistics(stats) {
    const statsContainer = document.getElementById('statistics');
    
    let html = '';
    for (const [label, value] of Object.entries(stats)) {
        // Format label: convert snake_case to Title Case
        const formattedLabel = label
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        html += `
            <div class="stat-item">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${formattedLabel}</div>
            </div>
        `;
    }
    
    statsContainer.innerHTML = html;
}

// Display slang info
function displaySlangInfo(slangInfo) {
    if (slangInfo.slang_count === 0) {
        return; // Don't show if no slang found
    }
    
    const slangCard = document.getElementById('slangInfo');
    const slangContent = document.getElementById('slangContent');
    const aiModelInfo = document.getElementById('aiModelInfo');
    
    slangCard.style.display = 'block';
    
    // Display AI Model Info if available
    if (lastResults.result.ai_info) {
        const aiInfo = lastResults.result.ai_info;
        aiModelInfo.innerHTML = `
            <div class="ai-badge-container">
                <div class="ai-badge ${aiInfo.ai_enabled ? 'ai-active' : 'ai-inactive'}">
                    <i class="fas fa-robot"></i>
                    <div>
                        <strong>AI Model: ${aiInfo.model}</strong>
                        <p>${aiInfo.method}</p>
                        <small>Status: ${aiInfo.ai_enabled ? '✓ Active' : '✗ Disabled'}</small>
                    </div>
                </div>
            </div>
        `;
    }
    
    let html = `
        <div class="info-card" style="margin: 20px 0;">
            <i class="fas fa-info-circle"></i>
            <div>
                <strong>Found ${slangInfo.slang_count} word(s) normalized</strong>
                <p>
                    Dictionary-based: ${slangInfo.dictionary_count || 0} words | 
                    AI-predicted: ${slangInfo.ai_predicted_count || 0} words
                </p>
            </div>
        </div>
        <div class="slang-content">
    `;
    
    if (slangInfo.details && slangInfo.details.length > 0) {
        slangInfo.details.forEach(detail => {
            const confidenceBadge = detail.ai_confidence > 0 
                ? `<span class="confidence-badge confidence-${getConfidenceClass(detail.ai_confidence)}">
                     <i class="fas fa-robot"></i> ${detail.ai_confidence}%
                   </span>`
                : '';
            
            const typeBadge = detail.type === 'ai_predicted'
                ? '<span class="type-badge ai-predicted"><i class="fas fa-brain"></i> AI Predicted</span>'
                : '<span class="type-badge dictionary"><i class="fas fa-book"></i> Dictionary</span>';
            
            html += `
                <div class="slang-item-enhanced">
                    <div class="slang-words">
                        <span class="slang">${detail.original}</span>
                        <span class="arrow"><i class="fas fa-arrow-right"></i></span>
                        <span class="formal">${detail.normalized}</span>
                    </div>
                    <div class="slang-badges">
                        ${typeBadge}
                        ${confidenceBadge}
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    slangContent.innerHTML = html;
}

function getConfidenceClass(confidence) {
    if (confidence >= 90) return 'high';
    if (confidence >= 70) return 'medium';
    return 'low';
}

// Download results
function downloadResults() {
    if (!lastResults) {
        alert('Tidak ada hasil untuk didownload!');
        return;
    }
    
    const dataStr = JSON.stringify(lastResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preprocessing-results-${Date.now()}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}
