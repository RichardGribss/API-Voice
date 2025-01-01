require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');

// Configuração do AWS SDK
AWS.config.update({
  region: 'sa-east-1', // Região do Polly
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Credenciais via variáveis de ambiente
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const polly = new AWS.Polly();
const app = express();
const PORT = 3000;

// Habilitar CORS para permitir requisições de origens diferentes (importante para o React Native)
app.use(cors());

// Rota para gerar o áudio
app.get('/synthesize', (req, res) => {
  const text = req.query.text || 'Olá, mundo! Este é um exemplo de texto para fala.';
  const params = {
    Text: text,
    OutputFormat: 'mp3',   // Formato de saída do áudio
    VoiceId: 'Vitoria',    // Voz em português do Brasil (pode escolher outras vozes)
  };

  // Chamada ao Amazon Polly para sintetizar o áudio
  polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
      console.error('Erro ao usar o Polly:', err);
      return res.status(500).send('Erro ao gerar áudio');
    }

    if (data.AudioStream instanceof Buffer) {
      res.set('Content-Type', 'audio/mpeg'); // Define o tipo do conteúdo como áudio MP3
      res.send(data.AudioStream); // Envia o áudio gerado como resposta
    } else {
      return res.status(500).send('Erro ao processar o áudio');
    }
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
