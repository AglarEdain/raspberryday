// Main JavaScript for RaspberryDay PWA

const app = document.getElementById('app');

// Simple state management
let state = {
    user: null,
    screen: 'login',
    mediaPreview: null,
    recentUploads: []
};

// Render functions
function render() {
    switch(state.screen) {
        case 'login':
            renderLogin();
            break;
        case 'main':
            renderMain();
            break;
        case 'sendMedia':
            renderSendMedia();
            break;
        case 'confirmation':
            renderConfirmation();
            break;
        case 'history':
            renderHistory();
            break;
        default:
            app.innerHTML = '<p>Écran inconnu</p>';
    }
}

function renderLogin() {
    app.innerHTML = `
        <h1>RaspberryDay</h1>
        <p>Partagez vos photos avec votre famille</p>
        <label for="username">Nom d'utilisateur</label>
        <input type="text" id="username" />
        <label for="password">Mot de passe</label>
        <input type="password" id="password" />
        <button id="loginBtn">Se connecter</button>
        <div id="loginMessage" class="message"></div>
    `;
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if(username && password) {
            // Simulate login
            state.user = { name: username };
            state.screen = 'main';
            render();
        } else {
            document.getElementById('loginMessage').textContent = 'Veuillez entrer un nom d\'utilisateur et un mot de passe.';
        }
    });
}

function renderMain() {
    app.innerHTML = `
        <h1>Bonjour, ${state.user.name}</h1>
        <button id="sendPhotoBtn">Envoyer une photo</button>
        <button id="sendVideoBtn">Envoyer une vidéo</button>
        <button id="recentUploadsBtn">Mes envois récents</button>
        <button id="logoutBtn">Se déconnecter</button>
    `;
    document.getElementById('sendPhotoBtn').addEventListener('click', () => {
        state.screen = 'sendMedia';
        state.mediaType = 'photo';
        render();
    });
    document.getElementById('sendVideoBtn').addEventListener('click', () => {
        state.screen = 'sendMedia';
        state.mediaType = 'video';
        render();
    });
    document.getElementById('recentUploadsBtn').addEventListener('click', () => {
        state.screen = 'history';
        render();
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
        state.user = null;
        state.screen = 'login';
        render();
    });
}

function renderSendMedia() {
    app.innerHTML = `
        <h1>Envoyer une ${state.mediaType === 'photo' ? 'photo' : 'vidéo'}</h1>
        <button id="backBtn">← Retour</button>
        <input type="file" id="mediaInput" accept="${state.mediaType === 'photo' ? 'image/*' : 'video/*'}" />
        <div id="preview"></div>
        <label for="caption">Ajouter une légende</label>
        <textarea id="caption" rows="3"></textarea>
        <label for="category">Catégorie</label>
        <select id="category">
            <option value="vacances">Vacances</option>
            <option value="famille">Famille</option>
            <option value="evenements">Événements</option>
            <option value="autres">Autres</option>
        </select>
        <label><input type="checkbox" id="showOnTV" /> Afficher immédiatement sur TV</label>
        <button id="sendBtn">Envoyer</button>
        <div id="sendMessage" class="message"></div>
    `;

    document.getElementById('backBtn').addEventListener('click', () => {
        state.screen = 'main';
        render();
    });

    const mediaInput = document.getElementById('mediaInput');
    const preview = document.getElementById('preview');

    mediaInput.addEventListener('change', () => {
        const file = mediaInput.files[0];
        if(file) {
            const url = URL.createObjectURL(file);
            state.mediaPreview = url;
            if(state.mediaType === 'photo') {
                preview.innerHTML = `<img src="${url}" alt="Prévisualisation" style="max-width: 100%; height: auto;" />`;
            } else {
                preview.innerHTML = `<video controls src="${url}" style="max-width: 100%; height: auto;"></video>`;
            }
        } else {
            preview.innerHTML = '';
            state.mediaPreview = null;
        }
    });

    document.getElementById('sendBtn').addEventListener('click', () => {
        const caption = document.getElementById('caption').value.trim();
        const category = document.getElementById('category').value;
        const showOnTV = document.getElementById('showOnTV').checked;

        if(!state.mediaPreview) {
            document.getElementById('sendMessage').textContent = 'Veuillez sélectionner un fichier média.';
            return;
        }

        // Simulate sending media
        state.recentUploads.push({
            type: state.mediaType,
            url: state.mediaPreview,
            caption,
            category,
            showOnTV,
            date: new Date().toLocaleString()
        });

        state.screen = 'confirmation';
        render();
    });
}

function renderConfirmation() {
    app.innerHTML = `
        <h1>Envoi réussi</h1>
        <p>Votre ${state.mediaType === 'photo' ? 'photo' : 'vidéo'} a été envoyée avec succès !</p>
        <button id="sendAnotherBtn">Envoyer un autre média</button>
        <button id="backToMainBtn">Retour à l'accueil</button>
    `;

    document.getElementById('sendAnotherBtn').addEventListener('click', () => {
        state.screen = 'sendMedia';
        render();
    });

    document.getElementById('backToMainBtn').addEventListener('click', () => {
        state.screen = 'main';
        render();
    });
}

function renderHistory() {
    app.innerHTML = `
        <h1>Mes envois récents</h1>
        <button id="backBtn">← Retour</button>
        <ul>
            ${state.recentUploads.map(upload => `
                <li>
                    <strong>${upload.type === 'photo' ? 'Photo' : 'Vidéo'}</strong> - ${upload.caption || 'Sans légende'} - ${upload.category} - ${upload.date}
                </li>
            `).join('')}
        </ul>
    `;

    document.getElementById('backBtn').addEventListener('click', () => {
        state.screen = 'main';
        render();
    });
}

// Initial render
render();

// Register service worker for PWA offline support
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}
