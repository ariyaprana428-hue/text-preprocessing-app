// Chat Widget Functionality
let chatState = {
    isOpen: false,
    mode: 'normal', // normal, adding, searching
    tempData: {},
    conversationContext: [],
    aiMode: false, // AI-powered or rule-based (default: false for better functionality)
    aiAvailable: false
};

// Check AI availability on load
async function checkAIAvailability() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/ai/status`);
        const data = await response.json();
        chatState.aiAvailable = data.ai_available;
        
        // Update UI
        const toggle = document.getElementById('aiModeToggle');
        if (chatState.aiAvailable) {
            toggle.classList.add('available');
            toggle.title = 'AI Mode: Click to enable Gemini AI';
        } else {
            toggle.classList.add('unavailable');
            toggle.title = 'AI Mode: Unavailable (API key not set)';
            toggle.disabled = true;
        }
    } catch (error) {
        console.error('AI status check error:', error);
        chatState.aiAvailable = false;
    }
}

// Initialize - check AI on load
document.addEventListener('DOMContentLoaded', () => {
    checkAIAvailability();
});

// Toggle AI mode
function toggleAIMode() {
    if (!chatState.aiAvailable) {
        addBotMessage(`❌ AI Mode tidak tersedia saat ini.<br><br>
            Untuk mengaktifkan Google Gemini AI:<br>
            1. Get free API key dari: <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a><br>
            2. Tambahkan ke file <code>.env</code>: <code>GEMINI_API_KEY=your_key</code><br>
            3. Restart backend<br><br>
            Untuk sekarang, aku pakai <strong>Rule-Based Mode</strong> 🤖`, true);
        return;
    }
    
    chatState.aiMode = !chatState.aiMode;
    
    const toggle = document.getElementById('aiModeToggle');
    const text = document.getElementById('aiModeText');
    
    if (chatState.aiMode) {
        toggle.classList.add('active');
        text.textContent = 'AI ON';
        addBotMessage(`🧠 <strong>AI Mode Activated!</strong><br><br>
            Sekarang aku pakai <strong>Google Gemini AI</strong>! 🚀<br>
            Aku bisa ngobrol lebih natural dan paham context lebih baik!<br><br>
            Try me! Tanya apa aja! 😊`, true);
    } else {
        toggle.classList.remove('active');
        text.textContent = 'AI';
        addBotMessage(`🤖 <strong>Rule-Based Mode</strong><br><br>
            Aku kembali ke mode normal. Fast & reliable! ⚡`, true);
    }
}

// Bot personality responses
const botResponses = {
    greetings: [
        "Halo! 👋 Seneng banget bisa ngobrol sama kamu! Ada yang bisa aku bantu?",
        "Hai! 😊 Gimana kabarnya? Mau ngobrol atau butuh bantuan?",
        "Halo kak! 🤗 Aku siap bantu kamu hari ini!",
        "Haiii! Selamat datang! Ada yang bisa aku lakuin buat kamu? 😄"
    ],
    howAreYou: [
        "Aku baik kok! 😊 Sebagai AI, aku selalu siap bantu kamu 24/7! Kamu gimana?",
        "Alhamdulillah baik! ☺️ Makasih udah tanya. Kamu sendiri gimana? Ada yang bisa aku bantu?",
        "Aku sehat dan semangat! 💪 Siap bantu kamu kapan aja!",
        "Baik banget! Makasih udah peduli 🥰 Kamu apa kabar?"
    ],
    thanks: [
        "Sama-sama! 😊 Seneng bisa bantu! Ada lagi yang bisa aku lakuin?",
        "No problem! 🤗 Itu memang tugasku kok, bantu kamu!",
        "Dengan senang hati! ✨ Jangan sungkan kalau butuh bantuan lagi ya!",
        "Makasih kembali! 💕 Seneng bisa berguna!"
    ],
    compliments: [
        "Aww, makasih! 😊 Kamu juga keren loh! Semangat terus!",
        "Hehe, makasih ya! 🤗 Aku cuma berusaha jadi AI yang helpful kok!",
        "Wah, jadi malu nih! 😳 Tapi makasih banyak! Kamu juga hebat!",
        "Makasih yaaa~ 🥰 Kamu yang bikin aku semangat!"
    ],
    jokes: [
        "Kenapa programmer suka gelap? Karena light mode itu bug! 😄💡",
        "Knock knock... (Who's there?) Stack... (Stack who?) Stack overflow! 😅",
        "Aku tau joke tentang UDP, tapi kamu mungkin ga nerima... 🤓",
        "Kenapa AI ga pernah stress? Karena kita ga punya deadline, cuma dead-loop! 😂",
        "Programmer: 'It works on my machine!' 🤷‍♂️",
        "There are 10 types of people: those who understand binary and those who don't! 😄"
    ],
    confused: [
        "Hmm, aku kurang ngerti nih 🤔 Bisa jelasin lebih detail?",
        "Wah, maaf aku bingung 😅 Coba pakai kata lain deh!",
        "Aku masih belajar nih 📚 Bisa kasih tau maksudnya gimana?",
        "Waduh, kepala aku pusing 😵 Bisa diulang dengan cara lain?"
    ],
    encouragement: [
        "Semangat! 💪 Kamu pasti bisa!",
        "Keep going! 🚀 Aku percaya sama kamu!",
        "Jangan menyerah! ✨ Setiap progress itu penting!",
        "You got this! 🔥 Aku dukung kamu!"
    ],
    capabilities: [
        "Aku bisa bantu kamu:\n• 🔤 Tambah kata slang baru\n• 🔍 Cari kata di dictionary\n• 🤖 Kasih AI suggestion\n• 📊 Lihat statistics\n• 💬 Dan ngobrol santai kayak gini! 😊",
        "Tugasku adalah:\n• ➕ Manage dictionary slang Indonesia\n• 🧠 Pakai AI untuk suggest kata formal\n• 📚 Bantu kamu belajar NLP\n• 😊 Jadi temen ngobrol yang asik!",
    ],
    love: [
        "Aww, I love you too! ❤️ Tapi aku cuma AI ya... 🤖💕",
        "Hehe, makasih! 💕 Aku juga sayang sama kamu... as a helpful assistant! 😊",
        "Love you too! 🥰 Semangat terus ya!"
    ],
    food: [
        "Wah enak kayaknya! 😋 Aku sebagai AI ga bisa makan sih, tapi aku seneng denger kamu cerita! Apa makanan favorit kamu?",
        "Hmm yummy! 🍔 Sayangnya aku cuma bisa 'makan' data nih 😅 Tapi cerita dong, lagi pengen makan apa?",
        "Wah lapar ya? 🍕 Aku rekomendasiin kamu makan dulu baru lanjut ngoding! 😄"
    ],
    bored: [
        "Bosan ya? 😅 Mau aku ceritain joke? Atau mau explore fitur-fitur app ini?",
        "Hehe, ayo dong jangan bosan! Mau coba import dictionary atau tambah kata slang?",
        "Bosan? Yuk kita ngobrol! Atau mau aku ajarin fitur-fitur yang ada? 😊"
    ],
    school: [
        "Semangat sekolah/kuliah nya! 📚 Tugas banyak ya?",
        "Wah anak rajin! 🎓 Semoga lancar ya belajarnya!",
        "School life! 🏫 Jangan lupa istirahat juga ya!"
    ],
    weather: [
        "Cuacanya gimana? ☀️ Aku di dunia digital sih ga ngerasain cuaca 😅",
        "Hujan ya? ☔ Enak nih cuaca buat coding! 💻",
        "Panas? 🌞 Jangan lupa minum air putih!"
    ],
    random: [
        "Hmm interesting! 🤔",
        "Oh gitu ya! Noted! 📝",
        "Wah seru tuh! 😄",
        "Oke deh! 👍",
        "Hehe iya sih 😊",
        "Btw, aku bisa bantu apa nih? 🤖"
    ]
};

// Get random response
function getRandomResponse(category) {
    const responses = botResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Send message to Gemini AI
async function sendToGeminiAI(message) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                context: {
                    mode: chatState.mode,
                    recent_messages: chatState.conversationContext.slice(-3)
                }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addBotMessage(data.reply);
            
            // Store in context
            chatState.conversationContext.push({
                user: message,
                bot: data.reply,
                ai: true,
                timestamp: Date.now()
            });
        } else if (data.fallback_to_rules) {
            // Fallback to rule-based
            addBotMessage('⚠️ AI temporarily unavailable. Switching to rule-based mode...');
            chatState.aiMode = false;
            document.getElementById('aiModeToggle').classList.remove('active');
            document.getElementById('aiModeText').textContent = 'AI';
            
            // Process with rules
            setTimeout(() => {
                processNormalMessage(message.toLowerCase());
            }, 500);
        } else {
            addBotMessage('❌ Oops! Terjadi error. Coba lagi ya!');
        }
        
    } catch (error) {
        console.error('Gemini AI error:', error);
        addBotMessage('❌ Connection error! Switching to rule-based mode...');
        chatState.aiMode = false;
        document.getElementById('aiModeToggle').classList.remove('active');
        document.getElementById('aiModeText').textContent = 'AI';
    }
}

// Detect intent from message
function detectIntent(message) {
    const msg = message.toLowerCase();
    
    // Greetings
    if (msg.match(/^(hai|halo|hi|hello|hey|hola|assalam|pagi|siang|sore|malam|hei|woi)/)) {
        return 'greeting';
    }
    
    // How are you
    if (msg.match(/(apa kabar|gimana kabar|how are you|gmn kabar|kabar baik|lu baik|kamu baik)/)) {
        return 'howAreYou';
    }
    
    // Thanks
    if (msg.match(/(terima kasih|thanks|thx|makasih|thank you|tengkyu|ty)/)) {
        return 'thanks';
    }
    
    // Compliments
    if (msg.match(/(keren|hebat|bagus|mantap|good|great|awesome|amazing|pintar|cerdas|top)/)) {
        return 'compliment';
    }
    
    // Jokes
    if (msg.match(/(joke|lelucon|lucu|becanda|humor|ketawa|ngakak)/)) {
        return 'joke';
    }
    
    // Help/capabilities
    if (msg.match(/(bisa apa|kemampuan|apa yang bisa|fitur|bantuan|help)/)) {
        return 'capabilities';
    }
    
    // Dictionary actions
    if (msg.match(/(tambah|add|tambahin|masukin)/)) {
        return 'add';
    }
    
    if (msg.match(/(cari|search|find|lihat)/)) {
        return 'search';
    }
    
    if (msg.match(/(stats|statistik|jumlah|total)/)) {
        return 'stats';
    }
    
    // Training command
    if (msg.match(/^(ajarin|ajar|belajar|learn|train)/)) {
        return 'train';
    }
    
    // Personal questions
    if (msg.match(/(siapa kamu|nama kamu|kamu siapa|who are you)/)) {
        return 'whoAmI';
    }
    
    if (msg.match(/(dari mana|asal|lahir)/)) {
        return 'whereFrom';
    }
    
    // Feelings
    if (msg.match(/(sedih|bosan|capek|stress|lelah)/)) {
        return 'empathy';
    }
    
    if (msg.match(/(senang|bahagia|happy|excited|gembira)/)) {
        return 'happy';
    }
    
    // Love/affection
    if (msg.match(/(love you|sayang|cinta|i love|suka kamu)/)) {
        return 'love';
    }
    
    // Food/eating
    if (msg.match(/(makan|lapar|makanan|food|hungry|enak)/)) {
        return 'food';
    }
    
    // Boredom
    if (msg.match(/(bosen|boring|gabut|ngantuk|sleepy)/)) {
        return 'bored';
    }
    
    // School/study
    if (msg.match(/(sekolah|kuliah|belajar|tugas|skripsi|school|study)/)) {
        return 'school';
    }
    
    // Weather
    if (msg.match(/(cuaca|hujan|panas|dingin|weather|rain)/)) {
        return 'weather';
    }
    
    // Short affirmative responses
    if (msg.match(/^(oke|ok|ya|yes|yup|yoi|siap|baik|noted)/)) {
        return 'short_affirm';
    }
    
    // Short negative responses  
    if (msg.match(/^(ga|gak|tidak|no|nope|engga|nggak)/)) {
        return 'short_negate';
    }
    
    // Activity questions
    if (msg.match(/(lagi apa|ngapain|sedang apa|doing what)/)) {
        return 'doing_what';
    }
    
    return 'unknown';
}

// Toggle chat panel
function toggleChat() {
    chatState.isOpen = !chatState.isOpen;
    const panel = document.getElementById('chatPanel');
    const toggle = document.getElementById('chatToggle');
    
    if (chatState.isOpen) {
        panel.classList.add('open');
        toggle.classList.add('active');
        document.getElementById('chatInput').focus();
    } else {
        panel.classList.remove('open');
        toggle.classList.remove('active');
    }
}

// Add bot message
function addBotMessage(message, isHTML = false) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Show typing indicator first
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Remove typing and show message after delay
    setTimeout(() => {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot';
        
        const content = isHTML ? message : `<p>${message}</p>`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${content}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500 + Math.random() * 500); // Random delay 500-1000ms
}

// Add user message
function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user';
    
    messageDiv.innerHTML = `
        <div class="message-content"><p>${message}</p></div>
        <div class="message-avatar">👤</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle chat enter
function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Send chat message
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addUserMessage(message);
    input.value = '';
    
    // Check if AI mode is enabled
    if (chatState.aiMode && chatState.aiAvailable) {
        // Use Gemini AI
        await sendToGeminiAI(message);
        return;
    }
    
    // Use rule-based (existing logic)
    // First, try to match with learned patterns
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        if (data.success && data.matched) {
            // Found learned pattern!
            addBotMessage(data.response);
            
            // Store in context
            chatState.conversationContext.push({
                user: message,
                bot: data.response,
                learned: true,
                timestamp: Date.now()
            });
            return;
        }
    } catch (error) {
        console.log('Pattern matching unavailable:', error);
    }
    
    // If no learned pattern, use built-in rules
    // Process message based on mode
    if (chatState.mode === 'adding_slang') {
        chatState.tempData.slang = message;
        chatState.mode = 'adding_formal';
        addBotMessage('Oke! 👍 Sekarang kasih tau aku kata formal-nya apa?');
        
        // AI suggestion
        try {
            const response = await fetch(`${API_BASE_URL}/api/dictionary/suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slang: message })
            });
            const data = await response.json();
            
            if (data.success && data.confidence > 60) {
                addBotMessage(`🤖 AI suggests: "<strong>${data.suggested}</strong>" (confidence: ${data.confidence}%)<br><br>
                    Setuju? Ketik formal word atau ketik "ok" untuk accept AI suggestion.`, true);
                chatState.tempData.suggestion = data.suggested;
            }
        } catch (error) {
            console.error('AI suggestion error:', error);
        }
        
    } else if (chatState.mode === 'adding_formal') {
        let formal = message;
        
        // Check if user accepts AI suggestion
        if (message.toLowerCase() === 'ok' && chatState.tempData.suggestion) {
            formal = chatState.tempData.suggestion;
        }
        
        // Add to dictionary
        try {
            const response = await fetch(`${API_BASE_URL}/api/dictionary/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slang: chatState.tempData.slang,
                    formal: formal
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                addBotMessage(`${data.message}<br><br>
                    Dictionary size sekarang: <strong>${await getDictionaryCount()}</strong> words! 🎉<br><br>
                    Mau tambah lagi? Ketik "tambah" atau pilih quick action!`, true);
            } else {
                addBotMessage(`❌ Ups! ${data.message}`);
            }
        } catch (error) {
            addBotMessage('❌ Error menambahkan kata! Coba lagi ya.');
            console.error('Add word error:', error);
        }
        
        // Reset mode
        chatState.mode = 'normal';
        chatState.tempData = {};
        
    } else if (chatState.mode === 'searching') {
        // Search dictionary
        try {
            const response = await fetch(`${API_BASE_URL}/api/dictionary/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: message })
            });
            
            const data = await response.json();
            
            if (data.success && data.results.length > 0) {
                let resultHTML = `<p>🔍 Ketemu ${data.count} hasil:</p><ul class="search-results">`;
                data.results.forEach(item => {
                    resultHTML += `<li><strong>${item.slang}</strong> → ${item.formal}</li>`;
                });
                resultHTML += '</ul>';
                addBotMessage(resultHTML, true);
            } else {
                addBotMessage(`❌ Tidak ada hasil untuk "${message}". Mau tambahkan kata ini? Ketik "tambah"!`);
            }
        } catch (error) {
            addBotMessage('❌ Error searching! Coba lagi ya.');
            console.error('Search error:', error);
        }
        
        chatState.mode = 'normal';
    
    } else if (chatState.mode === 'training_pattern') {
        // Train new pattern
        const parts = message.split('=>').map(s => s.trim());
        
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            addBotMessage(`❌ Format salah! Harus pakai " => " untuk pisahkan pattern dan response.<br><br>
                <strong>Contoh:</strong> lagi ngapain => Aku lagi standby!<br><br>
                Coba lagi:`, true);
            return;
        }
        
        const pattern = parts[0];
        const response = parts[1];
        
        try {
            const apiResponse = await fetch(`${API_BASE_URL}/api/chat/train`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pattern: pattern,
                    response: response
                })
            });
            
            const data = await apiResponse.json();
            
            if (data.success) {
                addBotMessage(`✅ <strong>Berhasil belajar!</strong><br><br>
                    Pattern: "<em>${pattern}</em>"<br>
                    Response: "<em>${response}</em>"<br><br>
                    Sekarang kalau ada yang tanya mirip pattern ini, aku bisa jawab! 🧠✨<br><br>
                    Total patterns learned: <strong>${data.total_patterns}</strong><br><br>
                    Mau ajarin lagi? Ketik pattern baru atau ketik "selesai" untuk keluar.`, true);
            } else {
                addBotMessage(`❌ ${data.message}`);
            }
        } catch (error) {
            addBotMessage('❌ Error training! Coba lagi ya.');
            console.error('Training error:', error);
        }
        
    } else if (message.toLowerCase() === 'selesai' && chatState.mode === 'training_pattern') {
        chatState.mode = 'normal';
        addBotMessage('✅ Training mode selesai! Aku siap pakai pattern yang baru aku pelajari! 🎓');
        
    } else {
        // Normal conversation
        processNormalMessage(message.toLowerCase());
    }
}

// Process normal message
function processNormalMessage(message) {
    const intent = detectIntent(message);
    
    switch(intent) {
        case 'greeting':
            addBotMessage(getRandomResponse('greetings'));
            break;
            
        case 'howAreYou':
            addBotMessage(getRandomResponse('howAreYou'));
            break;
            
        case 'thanks':
            addBotMessage(getRandomResponse('thanks'));
            break;
            
        case 'compliment':
            addBotMessage(getRandomResponse('compliments'));
            break;
            
        case 'joke':
            addBotMessage(getRandomResponse('jokes'));
            setTimeout(() => {
                addBotMessage("Hehe, gimana? Lucu kan? 😄 Atau mau joke lagi?");
            }, 1000);
            break;
            
        case 'capabilities':
            addBotMessage(getRandomResponse('capabilities'));
            break;
            
        case 'add':
            quickAction('add');
            break;
            
        case 'search':
            quickAction('search');
            break;
            
        case 'stats':
            quickAction('stats');
            break;
        
        case 'train':
            chatState.mode = 'training_pattern';
            addBotMessage(`🧠 <strong>Mode Training!</strong><br><br>
                Aku bisa belajar pattern baru dari kamu! Kasih contoh:<br><br>
                <strong>Format:</strong> pertanyaan => jawaban<br><br>
                <strong>Contoh:</strong><br>
                • "lagi ngapain => Aku lagi standby siap bantu kamu! 😊"<br>
                • "capek banget => Istirahat dulu yuk! Jangan lupa minum air putih 💧"<br><br>
                Ketik pattern-nya sekarang:`, true);
            break;
            
        case 'whoAmI':
            addBotMessage(`Aku adalah Dictionary Assistant! 🤖<br><br>
                Aku dibuat pakai AI (IndoBERT) untuk bantu kamu manage dictionary slang Indonesia. 
                Tugasku adalah jadi temen ngobrol yang asik sambil bantu kamu belajar NLP! 😊<br><br>
                Mau tau aku bisa apa? Ketik "bisa apa"!`, true);
            break;
            
        case 'whereFrom':
            addBotMessage(`Aku dibuat di Indonesia! 🇮🇩<br><br>
                Tepatnya dari project tugas kuliah Kecerdasan Buatan semester 7. 
                Aku pakai IndoBERT, neural network yang dilatih khusus untuk bahasa Indonesia! 
                Jadi aku ngerti banget bahasa kita! 💪`, true);
            break;
            
        case 'empathy':
            addBotMessage(`Waduh, kamu kenapa? 😢<br><br>
                Semangat ya! Istirahat dulu kalau capek. Jangan lupa minum air putih! 💧<br><br>
                Kalau mau distraksi, mau aku ceritain joke? Atau mau tambah-tambah kata ke dictionary sambil rileks? 😊`, true);
            break;
            
        case 'happy':
            addBotMessage(`Wah senengnya! 🎉😊<br><br>
                Aku ikutan happy deh! Keep that positive energy! ✨<br><br>
                Yuk produktif bareng, mau tambah kata ke dictionary?`, true);
            break;
        
        case 'love':
            addBotMessage(getRandomResponse('love'));
            break;
        
        case 'food':
            addBotMessage(getRandomResponse('food'));
            break;
        
        case 'bored':
            addBotMessage(getRandomResponse('bored'));
            break;
        
        case 'school':
            addBotMessage(getRandomResponse('school'));
            break;
        
        case 'weather':
            addBotMessage(getRandomResponse('weather'));
            break;
        
        case 'short_affirm':
            addBotMessage(getRandomResponse('random'));
            break;
        
        case 'short_negate':
            addBotMessage("Oh gitu ya! No problem! 👍<br>Ada yang lain yang bisa aku bantu?", true);
            break;
        
        case 'doing_what':
            const activities = [
                "Aku lagi standby siap bantu kamu! 🤖✨",
                "Lagi nunggu kamu butuh bantuan nih! 😊",
                "Aku lagi online 24/7 siap membantu! 💪",
                "Ga ngapa-ngapain, just chilling sambil siap bantu! 😎"
            ];
            addBotMessage(activities[Math.floor(Math.random() * activities.length)]);
            break;
            
        default:
            // Try to be conversational
            if (message.length < 3) {
                addBotMessage(getRandomResponse('random'));
            } else if (message.includes('?')) {
                // If it's a question, give friendly fallback
                const responses = [
                    `Hmm, tentang "${message}"... Aku kurang expert di topik itu 😅<br><br>Tapi aku jago bantu soal dictionary dan preprocessing text! Mau coba? Ketik "bisa apa" untuk lihat kemampuanku!`,
                    `Wah, pertanyaan menarik! Tapi aku lebih jago soal NLP dan dictionary sih 🤖<br><br>Kalau mau ajarin aku jawaban untuk pertanyaan ini, ketik "ajarin" ya!`,
                    `Hmm, aku belum tau jawaban yang tepat nih 🤔<br><br>Tapi kamu bisa ajarin aku! Ketik "ajarin" terus kasih pattern: "<em>${message} => jawabanmu</em>"`
                ];
                addBotMessage(responses[Math.floor(Math.random() * responses.length)], true);
            } else {
                // Echo with understanding
                const responses = [
                    `Oh gitu ya! 🤔 Interesting...<br><br>Btw, mau coba fitur-fiturku ga? Aku bisa:<br>• Tambah kata slang baru<br>• Cari kata di dictionary<br>• Kasih joke 😄<br>• Atau ngobrol santai kayak gini!<br><br>Pilih aja atau ketik apa yang kamu mau!`,
                    `${getRandomResponse('random')}<br><br>Kalau mau aku belajar respon untuk "${message}", ketik "ajarin" ya! 📚`,
                    `Noted! 📝<br><br>Btw kamu bisa ajarin aku respon untuk kata-kata kayak gini loh! Ketik "ajarin" untuk training mode! 🧠`
                ];
                addBotMessage(responses[Math.floor(Math.random() * responses.length)], true);
            }
    }
    
    // Store in context
    chatState.conversationContext.push({
        user: message,
        intent: intent,
        timestamp: Date.now()
    });
    
    // Keep only last 10 messages
    if (chatState.conversationContext.length > 10) {
        chatState.conversationContext.shift();
    }
}

// Quick actions
async function quickAction(action) {
    if (action === 'add') {
        chatState.mode = 'adding_slang';
        addBotMessage('Oke! ➕ Mari tambah kata slang baru!<br><br>Ketik kata slang yang mau ditambahkan:', true);
        document.getElementById('chatInput').focus();
        
    } else if (action === 'search') {
        chatState.mode = 'searching';
        addBotMessage('Oke! 🔍 Ketik kata yang mau dicari:');
        document.getElementById('chatInput').focus();
        
    } else if (action === 'stats') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/dictionary/stats`);
            const data = await response.json();
            
            if (data.success) {
                const stats = data.stats;
                addBotMessage(`
                    <p>📊 Dictionary Statistics:</p>
                    <ul class="stats-list">
                        <li>📚 Total words: <strong>${stats.total_words}</strong></li>
                        <li>📅 Last updated: <strong>${new Date(stats.last_updated).toLocaleString('id-ID')}</strong></li>
                        <li>💾 File: <strong>${stats.file_exists ? '✓ Exists' : '✗ Not found'}</strong></li>
                    </ul>
                    <p>Keren kan? 😎</p>
                `, true);
            }
        } catch (error) {
            addBotMessage('❌ Error loading stats!');
            console.error('Stats error:', error);
        }
    }
}

// Get dictionary count
async function getDictionaryCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dictionary/stats`);
        const data = await response.json();
        return data.stats.total_words;
    } catch {
        return '?';
    }
}

// Dictionary Manager State
let dictionaryState = {
    currentPage: 1,
    pageSize: 50, // Load 50 words at a time
    totalWords: 0,
    isLoading: false
};

// Dictionary Manager
async function openDictionaryManager() {
    document.getElementById('dictionaryModal').classList.add('open');
    // Reset to page 1
    dictionaryState.currentPage = 1;
    await loadDictionary();
}

function closeDictionaryManager() {
    document.getElementById('dictionaryModal').classList.remove('open');
}

async function loadDictionary(append = false) {
    if (dictionaryState.isLoading) return; // Prevent double loading
    
    try {
        dictionaryState.isLoading = true;
        
        // Show loading indicator
        const tbody = document.getElementById('dictionaryTableBody');
        if (!append) {
            tbody.innerHTML = '<tr><td colspan="3" class="loading">⏳ Loading...</td></tr>';
        }
        
        // Fetch paginated data
        const response = await fetch(
            `${API_BASE_URL}/api/dictionary/list?page=${dictionaryState.currentPage}&page_size=${dictionaryState.pageSize}`
        );
        const data = await response.json();
        
        if (data.success) {
            dictionaryState.totalWords = data.stats.total_words;
            
            // Update stats (only once)
            if (!append) {
                const statsHTML = `
                    <div class="stat-card">
                        <div class="stat-value">${data.stats.total_words}</div>
                        <div class="stat-label">Total Words</div>
                    </div>
                `;
                document.getElementById('dictionaryStats').innerHTML = statsHTML;
            }
            
            // Update table
            if (data.words.length === 0) {
                if (!append) {
                    tbody.innerHTML = '<tr><td colspan="3" class="empty">No words in dictionary</td></tr>';
                }
            } else {
                const newRows = data.words.map(word => `
                    <tr>
                        <td><strong>${word.slang}</strong></td>
                        <td>${word.formal}</td>
                        <td>
                            <button class="btn-remove" onclick="removeWord('${word.slang}')" title="Remove">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                
                if (append) {
                    // Remove old "Load More" button if exists
                    const oldLoadMoreRow = tbody.querySelector('.load-more-row');
                    if (oldLoadMoreRow) oldLoadMoreRow.remove();
                    
                    // Remove loading row if exists
                    const loadingRow = tbody.querySelector('.loading-more');
                    if (loadingRow) loadingRow.remove();
                    
                    // Append new rows
                    tbody.innerHTML += newRows;
                } else {
                    tbody.innerHTML = newRows;
                }
                
                // Add "Load More" button if there are more words
                const loadedCount = dictionaryState.currentPage * dictionaryState.pageSize;
                if (loadedCount < dictionaryState.totalWords) {
                    tbody.innerHTML += `
                        <tr class="load-more-row">
                            <td colspan="3" style="text-align: center; padding: 15px;">
                                <button onclick="loadMoreWords()" class="btn-load-more" style="padding: 8px 20px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer;">
                                    📥 Load More (${dictionaryState.totalWords - loadedCount} remaining)
                                </button>
                            </td>
                        </tr>
                    `;
                }
            }
        }
    } catch (error) {
        console.error('Load dictionary error:', error);
        document.getElementById('dictionaryTableBody').innerHTML = 
            '<tr><td colspan="3" class="error">❌ Error loading dictionary!</td></tr>';
    } finally {
        dictionaryState.isLoading = false;
    }
}

async function loadMoreWords() {
    dictionaryState.currentPage++;
    await loadDictionary(true);
}

async function searchDictionary() {
    const query = document.getElementById('dictionarySearch').value.trim();
    
    if (!query) {
        // Reset to page 1 and reload
        dictionaryState.currentPage = 1;
        await loadDictionary();
        return;
    }
    
    try {
        // Show loading
        const tbody = document.getElementById('dictionaryTableBody');
        tbody.innerHTML = '<tr><td colspan="3" class="loading">🔍 Searching...</td></tr>';
        
        const response = await fetch(`${API_BASE_URL}/api/dictionary/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        if (data.results.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="empty">No results for "${query}"</td></tr>`;
        } else {
            tbody.innerHTML = data.results.map(word => `
                <tr>
                    <td><strong>${word.slang}</strong></td>
                    <td>${word.formal}</td>
                    <td>
                        <button class="btn-remove" onclick="removeWord('${word.slang}')" title="Remove">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('dictionaryTableBody').innerHTML = 
            '<tr><td colspan="3" class="error">❌ Search failed!</td></tr>';
    }
}

async function removeWord(slang) {
    if (!confirm(`Hapus "${slang}" dari dictionary?`)) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/dictionary/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slang })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reset to page 1 and reload
            dictionaryState.currentPage = 1;
            await loadDictionary();
            alert(data.message);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Remove error:', error);
        alert('❌ Error removing word!');
    }
}

async function exportDictionary() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dictionary/export`);
        const data = await response.json();
        
        if (data.success) {
            // Download CSV
            const blob = new Blob([data.csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert('✅ Dictionary exported!');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ Export failed!');
    }
}

function showImportModal() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Show loading toast
        showLoadingToast(`Uploading "${file.name}"...`);
        
        try {
            // Read file content
            const reader = new FileReader();
            reader.onload = async (event) => {
                const csvData = event.target.result;
                await importDictionary(csvData);
            };
            reader.onerror = () => {
                hideLoadingToast();
                showNotificationToast('❌ Error', 'Failed to read file!', 'error');
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('File read error:', error);
            hideLoadingToast();
            showNotificationToast('❌ Error', 'Failed to read file!', 'error');
        }
    };
    
    // Trigger file picker
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

async function importDictionary(csvData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dictionary/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv_data: csvData })
        });
        
        hideLoadingToast();
        
        const data = await response.json();
        
        if (data.success) {
            // Show success toast with stats
            showImportSuccessToast({
                added: data.added,
                updated: data.updated,
                skipped: data.skipped,
                total: data.total_processed
            });
            
            // Reset to page 1 and reload if modal is open
            dictionaryState.currentPage = 1;
            const modal = document.getElementById('dictionaryModal');
            if (modal.classList.contains('open')) {
                await loadDictionary();
            }
        } else {
            showNotificationToast('❌ Import Failed', data.message, 'error');
        }
    } catch (error) {
        console.error('Import error:', error);
        hideLoadingToast();
        showNotificationToast('❌ Import Failed', 'Network error! Please try again.', 'error');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('dictionaryModal');
    if (event.target == modal) {
        closeDictionaryManager();
    }
}


// ============= TOAST NOTIFICATIONS =============

let currentToast = null;
let currentOverlay = null;

function showLoadingToast(message) {
    // Remove existing toast
    hideLoadingToast();
    
    // Create overlay
    currentOverlay = document.createElement('div');
    currentOverlay.className = 'toast-overlay';
    
    // Create toast
    currentToast = document.createElement('div');
    currentToast.className = 'notification-toast';
    currentToast.innerHTML = `
        <div class="toast-loading">
            <div class="toast-spinner"></div>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(currentOverlay);
    document.body.appendChild(currentToast);
}

function hideLoadingToast() {
    if (currentToast) {
        currentToast.remove();
        currentToast = null;
    }
    if (currentOverlay) {
        currentOverlay.classList.add('fade-out');
        setTimeout(() => {
            if (currentOverlay) currentOverlay.remove();
            currentOverlay = null;
        }, 300);
    }
}

function showImportSuccessToast(stats) {
    // Remove existing
    hideLoadingToast();
    
    // Create overlay
    currentOverlay = document.createElement('div');
    currentOverlay.className = 'toast-overlay';
    
    // Create toast
    currentToast = document.createElement('div');
    currentToast.className = 'notification-toast';
    currentToast.innerHTML = `
        <div class="toast-header">
            <div class="toast-icon">🎉</div>
            <div class="toast-title">Import Berhasil!</div>
        </div>
        <div class="toast-body">
            Dictionary berhasil di-update dengan data baru!
        </div>
        <div class="toast-stats">
            <div class="toast-stat">
                <div class="toast-stat-value">${stats.added}</div>
                <div class="toast-stat-label">📥 Added</div>
            </div>
            <div class="toast-stat">
                <div class="toast-stat-value">${stats.updated}</div>
                <div class="toast-stat-label">🔄 Updated</div>
            </div>
            <div class="toast-stat">
                <div class="toast-stat-value">${stats.skipped}</div>
                <div class="toast-stat-label">⚠️ Skipped</div>
            </div>
            <div class="toast-stat">
                <div class="toast-stat-value">${stats.total}</div>
                <div class="toast-stat-label">📊 Total</div>
            </div>
        </div>
        <div class="toast-body" style="font-size: 14px; margin-top: 10px;">
            💡 <em>Duplicates are updated, not added twice!</em>
        </div>
        <div class="toast-footer">
            <button class="toast-btn toast-btn-primary" onclick="closeToast()">
                Awesome! ✨
            </button>
        </div>
    `;
    
    document.body.appendChild(currentOverlay);
    document.body.appendChild(currentToast);
    
    // Close on overlay click
    currentOverlay.onclick = closeToast;
}

function showNotificationToast(title, message, type = 'info') {
    // Remove existing
    hideLoadingToast();
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // Create overlay
    currentOverlay = document.createElement('div');
    currentOverlay.className = 'toast-overlay';
    
    // Create toast
    currentToast = document.createElement('div');
    currentToast.className = 'notification-toast';
    currentToast.innerHTML = `
        <div class="toast-header">
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-title">${title}</div>
        </div>
        <div class="toast-body">${message}</div>
        <div class="toast-footer">
            <button class="toast-btn toast-btn-primary" onclick="closeToast()">
                OK
            </button>
        </div>
    `;
    
    document.body.appendChild(currentOverlay);
    document.body.appendChild(currentToast);
    
    // Close on overlay click
    currentOverlay.onclick = closeToast;
}

function closeToast() {
    if (currentToast) {
        currentToast.classList.add('toast-out');
        setTimeout(() => {
            if (currentToast) currentToast.remove();
            currentToast = null;
        }, 300);
    }
    if (currentOverlay) {
        currentOverlay.classList.add('fade-out');
        setTimeout(() => {
            if (currentOverlay) currentOverlay.remove();
            currentOverlay = null;
        }, 300);
    }
}
