import Redis from "ioredis";

// enableOfflineQueue: false é o que faz o fallback do cache-aside (ver
// ListOrdemdeServicoService.getTotais) valer a pena de verdade: sem isso, um
// comando emitido enquanto o Redis está fora do ar fica na fila e só falha
// depois de várias tentativas de reconexão (~20-30s, achado rodando o E2E de
// listagem contra este ambiente sem Redis) — na prática, "derrubava a rota"
// mesmo com o try/catch, só que por timeout em vez de erro. Com a fila
// desligada, o comando falha na hora, o try/catch cai pro banco imediatamente,
// e o cliente continua tentando reconectar em segundo plano (retryStrategy
// padrão) pro próximo request já achar o Redis de volta, se ele voltar.
const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  enableOfflineQueue: false,
});

export default redisClient;
