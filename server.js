const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
const port = 3000;

let bot;
let botStarted = false;

app.use(express.static('public')); // Serve arquivos estáticos da pasta 'public'

// Rota para controlar o estado do bot
app.get('/toggle-bot', (req, res) => {
  console.log('Recebido pedido para alternar o bot...'); // Log para verificar se a rota está sendo chamada
  if (botStarted) {
    console.log('Bot já está iniciado, desconectando...');
    bot.quit(); // Desconecta o bot
    botStarted = false;
    res.json({ status: 'stopped' });
  } else {
    console.log('Iniciando o bot...');
    bot = mineflayer.createBot({
      host: 'survival_b1p.aternos.me', // IP do servidor
      port: 14892, // Porta do servidor
      username: 'AFK_B1p', // Nome do bot
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
