const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configurar o cliente OAuth2 com a URI exata do Render
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://cleanemail-backend.onrender.com/auth/google/callback'
);

// Rota para iniciar o login com o Google
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
  ];
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Força a atualização e reenvio do token se necessário
  });

  res.redirect(url);
});

// Rota de callback onde o Google devolve o código de autorização
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).send('Código de autorização não encontrado.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    console.log('Autenticação com o Google realizada com sucesso!');
    
    // Resposta amigável que tenta fechar a aba automaticamente após 2 segundos
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
          <h2>Autenticação efetuada com sucesso!</h2>
          <p>Já pode fechar esta aba e voltar ao CleanMail.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro ao autenticar com o Google:', error);
    res.status(500).send('Erro na autenticação com o Google.');
  }
});

// Rota para filtrar e apagar e-mails reais
app.post('/api/clean', async (req, res) => {
  const { days, sender, keyword } = req.body;

  try {
    if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilizador não autenticado no Gmail. Clique em Conectar Gmail primeiro.' 
      });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    let queryParts = [];
    if (sender) queryParts.push(`from:${sender}`);
    if (keyword) queryParts.push(keyword);
    
    const q = queryParts.join(' ');

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: q.length > 0 ? q : undefined,
      maxResults: 20,
    });

    const messages = response.data.messages || [];
    let deletedCount = 0;

    for (const message of messages) {
      try {
        await gmail.users.messages.trash({
          userId: 'me',
          id: message.id,
        });
        deletedCount++;
      } catch (err) {
        console.error(`Erro ao enviar mensagem ${message.id} para o lixo:`, err);
      }
    }

    console.log(`Limpeza executada: ${deletedCount} e-mails movidos para o lixo.`);

    res.json({
      success: true,
      message: `Limpeza concluída! ${deletedCount} e-mails foram enviados para o lixo.`,
      removedCount: deletedCount,
      timestamp: new Date().toLocaleString()
    });

  } catch (error) {
    console.error('Erro ao aceder à API do Gmail:', error);
    res.status(500).json({ success: false, message: 'Erro ao comunicar com a API do Gmail.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor do CleanMail a correr na porta ${PORT}`);
});
