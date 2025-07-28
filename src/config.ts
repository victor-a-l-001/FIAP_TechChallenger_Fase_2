import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV; 
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

console.log('Executando em:', env);

const { JWT_SECRET, PORT, NODE_ENV } = process.env;

if (!JWT_SECRET) {
  throw new Error('Variável JWT_SECRET não definida em process.env');
}

if (!PORT) {
  console.warn('PORT não definida; usando 3000 como padrão');
}

export const config = {
  jwt: {
    secret: JWT_SECRET,
    algorithm: 'HS256' as const,
    expiresIn: '1h',
  },
  server: {
    port: Number(PORT) || 3000, 
    env: NODE_ENV,
  },
};
