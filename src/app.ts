import express, { ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { setupSwagger, swaggerSpec } from './swagger';
import postRoutes from './routes/post';
import { authMiddleware } from './middlewares/Authenticate';
import authRoutes from './routes/auth';

const app = express();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições! Tente novamente mais tarde.',
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Algo deu errado' });
};

// 🛡️ Segurança HTTP
app.use(helmet());

app.use(limiter);

app.use(express.json());

app.use(errorHandler);

// 🌐 CORS - definir origens confiáveis
const allowedOrigins = ['*'];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

// Swagger
setupSwagger(app);

// Rota pública
app.use('/api/auth', authRoutes);

// Middleware de proteção a seguir:
app.use('/api', authMiddleware);

// Rotas protegidas:
app.use('/api/posts', postRoutes);

export default app;
