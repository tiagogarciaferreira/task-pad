import http from 'k6/http';
import { check, sleep } from 'k6';

// Carrega os IPs do arquivo
const ips = open('../hosts.txt')
  .split('\n')
  .map((ip) => ip.trim())
  .filter(Boolean);

export const options = {
  vus: 100, // Simula 100 usuários simultâneos
  duration: '120s', // Mantém a carga por 120 segundos
};

export default function () {
  // Monta as requisições GET para todos os IPs da lista
  const requests = ips.map((ip) => ({
    method: 'GET',
    url: `${ip}/login`,
  }));

  // Dispara as requisições em paralelo (lote)
  const responses = http.batch(requests);

  // Valida se a página carregou com sucesso (HTTP 200) em todos os IPs
  responses.forEach((res) => {
    check(res, { 'status is 200': (r) => r.status === 200 });
  });

  // Pausa de 1 segundo antes do usuário virtual iniciar um novo ciclo
  sleep(1);
}
