import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express'; 

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FIAP',
      version: '1.0.0',
      description: 'FIAP TechChallenger',
    },
    servers: [{ url: '/api' }],
    components: {
      schemas: {
        // Auth
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'usuario@nulo.com',
            },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Mensagem...' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Descrição do erro' },
          },
        },
        // Post
        CreatePostInput: {
          type: 'object',
          required: ['title', 'content', 'authorId'],
          properties: {
            title: { type: 'string', example: 'Titulo Exemplo' },
            content: { type: 'string', example: 'Conteúdo Exemplo.' },
            authorId: { type: 'integer', example: 1 },
          },
        },
        UpdatePostInput: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
        },
        PostResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Titulo Exemplo' },
            content: { type: 'string', example: 'Conteúdo Exemplo.' },
            authorId: { type: 'integer', example: 1 },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-07-09T12:34:56Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-07-10T08:00:00Z',
            },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Author' },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'author@nulo.com',
                },
              },
            },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis:  ['./src/routes/*.ts', './dist/src/routes/*.js'], 
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Application) {
  app.get('/api/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerUrl: '/api/swagger.json',
    }),
  );
}
