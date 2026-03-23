// proxy.conf.js
// ============================================
// 1. DEFINIÇÃO DO PROXY
// ============================================
module.exports = {
  // Toda requisição que começar com /api será redirecionada
  '/api': {
    target: 'http://localhost:4000', // Para onde vai redirecionar
    secure: false, // Não exige HTTPS (usamos HTTP)
    changeOrigin: true, // Muda a origem da requisição
    logLevel: 'debug', // Mostra logs no terminal
  },
};
