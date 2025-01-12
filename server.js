const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mineflayer = require('mineflayer');

// Configuração do servidor Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Variáveis globais
let bot; // Instância do bot
let botRunning = false; // Status do bot

// Servindo arquivos estáticos (HTML)
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Comunicação via WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Envia o status atual do bot ao cliente
  socket.emit('botStatus', botRunning ? 'ON' : 'OFF');

  // Lógica para alternar o bot
  socket.on('toggleBot', (status) => {
    if (status === 'ON' && !botRunning) {
      startBot();
    } else if (status === 'OFF' && botRunning) {
      stopBot();
    }

    // Atualiza o status para todos os clientes
    io.emit('botStatus', botRunning ? 'ON' : 'OFF');
  });
});

// Função para iniciar o bot
function startBot() {
  console.log('Iniciando o bot...');
  bot = mineflayer.createBot({
    host: 'survival_b1p.aternos.me', // Substitua pelo IP do servidor
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
    console.log('Bot desconectado.');
  });

  bot.on('kicked', (reason) => console.log(`Fui expulso! Motivo: ${reason}`));
  bot.on('error', (err) => console.log(`Erro: ${err}`));

  botRunning = true;
}

// Função para parar o bot
function stopBot() {
  if (bot) {
    console.log('Desconectando o bot...');
    bot.quit();
    botRunning = false;
  }
}

// Função para manter o bot AFK
function manterAFK() {
  setInterval(() => {
    if (bot && botRunning) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 1000);
      bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI); // Olhar em direções aleatórias
    }
  }, 30000); // A cada 30 segundos
}

// Inicia o servidor na porta 3000
server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
