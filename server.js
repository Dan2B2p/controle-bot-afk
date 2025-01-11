const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mineflayer = require('mineflayer');

// Configuração do servidor Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuração do bot Mineflayer
let bot;
let botRunning = false;

// Página HTML servida pelo Express
app.use(express.static('public')); // A pasta onde ficará seu index.html

// Rota de conexão
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Comunicação via WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Controlando o bot via WebSocket
  socket.on('toggleBot', (status) => {
    if (status === 'ON' && !botRunning) {
      startBot();
    } else if (status === 'OFF' && botRunning) {
      stopBot();
    }
  });

  // Enviando mensagem ao cliente
  socket.emit('botStatus', botRunning ? 'ON' : 'OFF');
});

// Função para iniciar o bot
function startBot() {
  console.log("Bot está sendo ativado...");
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

  botRunning = true;
  io.emit('botStatus', 'ON'); // Envia o status do bot para o cliente
}

// Função para parar o bot
function stopBot() {
  if (bot) {
    bot.quit(); // Desconecta o bot
    botRunning = false;
    io.emit('botStatus', 'OFF'); // Envia o status do bot para o cliente
  }
}

// Função para manter o bot AFK
function manterAFK() {
  setInterval(() => {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 1000);
    bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI); // Olha em direções aleatórias
  }, 30000); // A cada 30 segundos
}

// Inicia o servidor na porta 3000
server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
