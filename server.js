// server.js
// ============================================
// 1. IMPORTAÇÃO DOS MÓDULOS
// ============================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// 2. CARREGA VARIÁVEIS DE AMBIENTE
dotenv.config();

// 3. CRIA A APLICAÇÃO EXPRESS
const app = express();

// 4. DEFINE A PORTA
const PORT = process.env.PORT || 4000;

// 5. MIDDLEWARES GLOBAIS
app.use(helmet());      // Segurança: adiciona headers HTTP protetores
app.use(cors());        // Permite requisições de outros domínios (Angular na porta 4200)
app.use(express.json()); // Permite receber JSON no corpo das requisições

// 6. ROTA DE TESTE - HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});


// 7. ROTA DE TESTE COM PARÂMETRO
app.get('/api/hello/:nome', (req, res) => {
  const { nome } = req.params;
  res.json({
    message: `Olá ${nome}! Sua API está funcionando.`,
    timestamp: new Date().toISOString()
  });
});

// 8. INICIA O SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 API health: http://localhost:${PORT}/api/health`);
  console.log(`👋 API hello: http://localhost:${PORT}/api/hello/SeuNome`);
});
