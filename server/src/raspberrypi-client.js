const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_URL = 'http://localhost:3000'; // URL du serveur central
const MEDIA_DIR = __dirname + '/media'; // Dossier local pour stocker les médias

// Fonction pour synchroniser les médias depuis le serveur
async function syncMedia() {
  try {
    const response = await axios.get(`${SERVER_URL}/api/media`);
    const mediaList = response.data;

    if (!fs.existsSync(MEDIA_DIR)) {
      fs.mkdirSync(MEDIA_DIR, { recursive: true });
    }

    for (const media of mediaList) {
      const localPath = path.join(MEDIA_DIR, media.filename);
      if (!fs.existsSync(localPath)) {
        // Télécharger le média
        const writer = fs.createWriteStream(localPath);
        const mediaResponse = await axios({
          url: `${SERVER_URL}/media/${media.filename}`,
          method: 'GET',
          responseType: 'stream'
        });
        mediaResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        console.log(`Média téléchargé: ${media.filename}`);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des médias:', error.message);
  }
}

// Fonction pour lancer Chromium en mode kiosk
function launchChromium() {
  const url = `file://${MEDIA_DIR}/index.html`;
  exec(`chromium-browser --noerrdialogs --kiosk ${url}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur lancement Chromium: ${error.message}`);
      return;
    }
    console.log('Chromium lancé en mode kiosk');
  });
}

const Lirc = require('lirc_node');

// Initialisation de lirc
Lirc.init();

// Gestion des commandes télécommande
Lirc.addListener((data) => {
  console.log('Commande télécommande reçue :', data);
  switch(data.button) {
    case 'KEY_RIGHT':
      console.log('Commande: Média suivant');
      // TODO: Implémenter la commande média suivant
      break;
    case 'KEY_LEFT':
      console.log('Commande: Média précédent');
      // TODO: Implémenter la commande média précédent
      break;
    case 'KEY_PLAY':
    case 'KEY_PAUSE':
      console.log('Commande: Pause/Play');
      // TODO: Implémenter la commande pause/play
      break;
    case 'KEY_VOLUMEUP':
      console.log('Commande: Volume +');
      // TODO: Implémenter la commande volume +
      break;
    case 'KEY_VOLUMEDOWN':
      console.log('Commande: Volume -');
      // TODO: Implémenter la commande volume -
      break;
    default:
      console.log('Commande non gérée');
  }
});

const WebSocket = require('ws');

// Serveur WebSocket pour communication avec la page locale
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client WebSocket connecté');
  ws.on('message', (message) => {
    console.log('Message reçu du client:', message);
  });
});

// Fonction pour envoyer une commande à tous les clients WebSocket connectés
function broadcastCommand(command) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(command);
    }
  });
}

// Mise à jour de la gestion des commandes télécommande
Lirc.addListener((data) => {
  console.log('Commande télécommande reçue :', data);
  switch(data.button) {
    case 'KEY_RIGHT':
      console.log('Commande: Média suivant');
      broadcastCommand('next');
      break;
    case 'KEY_LEFT':
      console.log('Commande: Média précédent');
      broadcastCommand('previous');
      break;
    case 'KEY_PLAY':
    case 'KEY_PAUSE':
      console.log('Commande: Pause/Play');
      broadcastCommand('togglePlay');
      break;
    case 'KEY_VOLUMEUP':
      console.log('Commande: Volume +');
      broadcastCommand('volumeUp');
      break;
    case 'KEY_VOLUMEDOWN':
      console.log('Commande: Volume -');
      broadcastCommand('volumeDown');
      break;
    default:
      console.log('Commande non gérée');
  }
});

// Fonction principale
async function main() {
  await syncMedia();
  launchChromium();
}

main();

