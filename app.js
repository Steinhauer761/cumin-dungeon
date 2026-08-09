// CONFIGURATION: Put your WhatsApp Business phone number below (numbers only, include country code)
const ADMIN_PHONE = "1234567890";

// Directory Seed Data
const models = [
    { id: 1, name: "Ruby Rose", age: 22, location: "Toronto", tags: ["#Webcam", "#OnlyFans"], bio: "0% platform fees here! Chat with me directly or unlock my premium channels below.", verified: true },
    { id: 2, name: "Bella V", age: 25, location: "Vancouver", tags: ["#Dates"], bio: "Looking for generous connections and premium dinner dates. Send a message!", verified: false }
];

let messageCount = 0;
const maxFreeMessages = 3;

function renderFeed(filter = 'all') {
    const feed = document.getElementById('directory-feed');
    feed.innerHTML = '';
    
    const filtered = filter === 'all' ? models : models.filter(m => m.tags.includes(filter));
    
    filtered.forEach(model => {
        const card = document.createElement('div');
        card.className = "bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg";
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-lg font-bold text-white">${model.name}, <span class="text-gray-400 font-normal">${model.age}</span></h2>
                    <p class="text-xs text-pink-400 font-mono mt-0.5">${model.location}</p>
                </div>
                ${model.verified ? '<span class="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded border border-pink-500/50">★ Verified Creator</span>' : ''}
            </div>
            <p class="text-sm text-gray-300 mt-2">${model.bio}</p>
            <div class="flex gap-1 mt-3">
                ${model.tags.map(t => `<span class="bg-gray-900 text-gray-400 px-2 py-0.5 rounded text-xs font-mono">${t}</span>`).join('')}
            </div>
            <button onclick="openChat(${model.id}, '${model.name}')" class="w-full mt-4 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 rounded text-xs transition">
                Message Free
            </button>
        `;
        feed.appendChild(card);
    });
}

function filterTags(tag) { renderFeed(tag); }
function openChat(id, name) {
    document.getElementById('chat-header-title').innerText = `Chat with ${name}`;
    document.getElementById('chat-modal').classList.remove('hidden');
    checkPaywall();
}
function closeChat() { document.getElementById('chat-modal').classList.add('hidden'); }

function openCreatorForm() { document.getElementById('creator-modal').classList.remove('hidden'); }
function closeCreatorForm() { document.getElementById('creator-modal').classList.add('hidden'); }

function checkPaywall() {
    if (messageCount >= maxFreeMessages) {
        document.getElementById('paywall-lock').classList.remove('hidden');
        document.getElementById('chat-input-area').classList.add('premium-blur');
        document.getElementById('user-balance').innerText = "Premium Required";
        document.getElementById('user-balance').className = "text-xs bg-red-900 text-red-200 px-3 py-1.5 rounded-full font-semibold";
        
        const textMessage = encodeURIComponent("Hi Admin, I hit my chat limit on Connex and want to unlock Premium Access ($5)!");
        document.getElementById('paywall-link').href = `https://wa.me{ADMIN_PHONE}?text=${textMessage}`;
    }
}

function sendMessage() {
    if (messageCount >= maxFreeMessages) return;
    const input = document.getElementById('message-input');
    if (input.value.trim() === '') return;

    const stream = document.getElementById('message-stream');
    const msg = document.createElement('div');
    msg.className = "text-right";
    msg.innerHTML = `<span class="inline-block bg-pink-600 text-white text-xs px-3 py-1.5 rounded-lg max-w-[80%]">${input.value}</span>`;
    stream.appendChild(msg);
    
    input.value = '';
    messageCount++;
    
    document.getElementById('user-balance').innerText = `${maxFreeMessages - messageCount} Free Messages Left`;
    stream.scrollTop = stream.scrollHeight;
    checkPaywall();
}

function submitCreatorForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('form-name').value;
    const age = document.getElementById('form-age').value;
    const location = document.getElementById('form-location').value;
    const tags = document.getElementById('form-tags').value;
    const bio = document.getElementById('form-bio').value;
    
    const messageText = `New Creator Application on Connex:\n\n` +
                        `Name: ${name}\n` +
                        `Age: ${age}\n` +
                        `Location: ${location}\n` +
                        `Tags: ${tags}\n` +
                        `Bio: ${bio}`;
                        
    const encodedMessage = encodeURIComponent(messageText);
    window.open(`https://wa.me{ADMIN_PHONE}?text=${encodedMessage}`, '_blank');
    closeCreatorForm();
}

renderFeed();
