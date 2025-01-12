const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
const port = 3000;

// Variável para controlar o estado do bot
let bot;
let botStarted = false;

// Configurações do servidor
app.use(express.static('public')); // Para servir o HTML

// Rota para controlar o estado do bot
app.get('/toggle-bot', (req, res) => {
  if (botStarted) {
    bot.quit(); // Desconecta o bot
    botStarted = false;
    res.json({ status: 'stopped' });
  } else {
    // Cria o bot
    bot = mineflayer.createBot({
      host: 'survival_b1p.aternos.me',
      port: 14892,
      username: 'AFK_B1p',
    });

    bot.on('login', () => {
      console.log(`Bot conectado como ${bot.username}`);
      bot.chat('Olá, estou apenas testando um bot!');
    });

    bot.once('spawn', () => {
      console.log('Bot spawnado no servidor!');
      manterAFK();
    });

    bot.on('end', () => {
      console.log('Bot foi desconectado. Tentando reconectar...');
      setTimeout(() => {
        bot.connect();
      }, 5000);
    });

    bot.on('kicked', (reason) => console.log(`Fui expulso! Motivo: ${reason}`));
    bot.on('error', (err) => console.log(`Erro: ${err}`));

    botStarted = true;
    res.json({ status: 'started' });
  }
});

function manterAFK() {
  setInterval(() => {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 1000);
    bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI); // Olha em direções aleatórias
  }, 30000); // A cada 30 segundos
}

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
