import app from './app';
import { config } from './config';

const PORT = config.server.port || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Iniciado!`);
});
