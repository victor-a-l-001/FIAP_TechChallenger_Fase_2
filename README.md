# 📋 WebAPI de Gestão de Postagens

Uma API RESTful para gerenciamento de postagens, desenvolvida em Node.js com TypeScript e Prisma, com foco em segurança e testes automatizados.

## 🔖 Sumário

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configurações de Ambiente](#configurações-de-ambiente)
- [Docker](#docker)
- [Segurança](#segurança)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)


## Tecnologias

- **Node.js**  
- **TypeScript**  
- **Prisma ORM**  
- **Express**  
- **JWT** (JSON Web Tokens)  
- **Helmet**  
- **CORS**  
- **express-rate-limit**  
- **Jest** + **Supertest** (unit + e2e)

## Pré-requisitos
- [Node.js](https://nodejs.org/) (>= 18)  
- [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)  
- Banco de dados (SQLite/PostgreSQL/MySQL) compatível com Prisma  

## Instalação
1. Clone o repositório:  
   git clone https://github.com/.....
2. cd fiap-tech-challenger
3. Instale as dependências: npm install ou yarn install

## Configurações de Ambiente
- DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cleanarch"
- PORT=3000
- JWT_SECRET="sua-chave-secreta"

Obs.: O ambiente de teste e2e possui configurações especificas.
- Database: sqlite
- DATABASE_URL="DATABASE_URL=file:./dev-e2e.db"

## Docker
Este projeto inclui:

- **Dockerfile**: empacota a aplicação Node.js (compilação TypeScript, geração do client Prisma e runtime).
- **docker-compose.yml**: sobe a API (`api`) e o banco Postgres (`db`) em containers.

### Comandos básicos
```
# Construir a imagem e iniciar os containers
docker-compose up --build

# Iniciar em segundo plano (detached)
docker-compose up -d

# Parar e remover os containers
docker-compose down
```

## Segurança
Para proteger a API, este projeto utiliza:

- **Rate Limiting**  
  Limita o número de requisições por IP com `express-rate-limit`.

- **CORS**  
  Controla origens permitidas usando o middleware `cors`.

- **Headers de Segurança**  
  Configura headers HTTP seguros via `helmet`.

- **Autenticação JWT**  
  Garante acesso a endpoints protegidos com tokens JWT (`Authorization: Bearer <token>`).

- **Autorização Roles**  
  Endpoints de gestão de postagem possuem nível de acesso conforme perfil/role.
  - Aluno: Acesso Limitado, busca/listagem de postagens.
  - Professor: Acesso total a postagens.

- **Validação de Dados com Zod**  
  Define e aplica schemas de validação e sanitização de payloads usando `zod`, prevenindo injeções e inconsistências.

## Scripts Disponíveis
```
| Comando                          | Descrição                                                               
| `npm run prisma:generate`        | Gera o cliente Prisma (`prisma generate`)                               
| `npm run prisma:migrate`         | Aplica migrações no ambiente de dev (`prisma migrate dev --name init`)  
| `npm run build`                  | Gera o cliente Prisma e compila o TypeScript (`npm run prisma:generate && tsc`) 
| `npm run start`                  | Compila e inicia a build (`npm run build && node dist/src/server.js`)
| `npm run dev:migrate`            | Gera o cliente Prisma e inicia em dev com ts-node-dev (`npm run prisma:generate && ts-node-dev src/server.ts`)
| `npm run dev`                    | Inicia em modo dev com reload rápido (`ts-node-dev --respawn --transpile-only src/server.ts`)
| `npm run format`                 | Formata o código com Prettier (`prettier --ignore-path .prettierignore --write .`)
| `npm run prisma:generate:e2e`    | Gera o cliente Prisma para testes E2E (`prisma generate --schema=prisma-e2e/schema.prisma`)
| `npm run test:e2e`               | Gera o cliente E2E e executa testes de integração (`npm run prisma:generate:e2e && jest --runInBand --config=jest.e2e.config.ts`)
| `npm run test`                   | Executa todos os testes com Jest (`jest`)
| `npm run test:watch`             | Executa testes em watch mode (`jest --watchAll`)
```

## Estrutura de Pastas
```
FIAP-TechChallenger/
├── prisma/
├── prisma-e2e/
├── src/
│   ├── controllers/
│   ├── domains/
│   ├── dtos/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── schemas/
│   ├── use-cases/
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── e2e/
│       └── factories/
│   └── unit/
│       ├── middlewares/
│       ├── routes/
│       ├── schemas/
│       └── use-cases/
├── .env
├── .env.e2e
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── jest.e2e.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Endpoints da API
......
## Testes
......