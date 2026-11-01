/** @type {import('@mandate-game/steamworks-electron')} */
const steamworks = require('@mandate-game/steamworks-electron');
const client = steamworks.init(480);

const playerName = client.localplayer.getName()
document.getElementById('name').innerText = playerName

document.getElementById('activateOverlay').addEventListener('click', function() {
    client.overlay.activateToWebPage('https://www.example.com/')
})
