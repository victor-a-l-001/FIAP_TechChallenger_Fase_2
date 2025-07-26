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
   git clone https://github.com/victor-a-l-001/FIAP_TechChallenger_Fase_2
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

### Autenticação

**_POST `/auth/login`_**

**Descrição:**  
Faz login e retorna um token JWT.

**Perfil de Acesso:**

- Professor
- Aluno

**Requisição:**

```json
{
  "email": "usuario@nulo.com",
  "password": "secret123"
}
```

**Resposta: 200**

```json
{
  "token": "eyJhbGciOi..."
}
```

**Códigos de resposta:**

- 200: Token retornado com sucesso.
- 400: Erro de validação (dados inválidos).
- 401: Credenciais inválidas ou token malformado.

---

### Postagem

**_GET `/posts`_**

**Descrição:**  
Lista todas as postagens.

**Autenticação:**

- Bearer Token

**Perfil de Acesso:**

- Professor
- Aluno

**Resposta: 200**

```json
[
  {
    "id": 1,
    "title": "Titulo Exemplo",
    "content": "Conteúdo Exemplo.",
    "authorId": 1,
    "createdAt": "2025-07-09T12:34:56Z",
    "updatedAt": "2025-07-10T08:00:00Z"
  }
]
```

**Códigos de resposta:**

- 200: Lista de postagens.
- 401: Credenciais inválidas ou token malformado.
- 403: Perfil de acesso não autorizado.

---

**_GET `/posts/search?q=termo`_**

**Descrição:**  
Busca postagens por um termo.

**Autenticação:**

- Bearer Token

**Perfil de Acesso:**

- Professor
- Aluno

**Parâmetros de query:**

- q (string, obrigatório): Termo de busca

**Resposta: 200**

```json
[
  {
    "id": 1,
    "title": "Titulo Exemplo",
    "content": "Conteúdo Exemplo.",
    "authorId": 1,
    "createdAt": "2025-07-09T12:34:56Z",
    "updatedAt": "2025-07-10T08:00:00Z"
  }
]
```

**Códigos de resposta:**

- 200: Resultado da busca.
- 400: Erro de validação.
- 401: Credenciais inválidas ou token malformado.
- 403: Perfil de acesso não autorizado.

---

**_GET `/posts/{id}`_**

**Descrição:**  
Obtém uma postagem por ID.

**Autenticação:**

- Bearer Token

**Parâmetros de query:**

- id (integer, obrigatório)

**Perfil de Acesso:**

- Professor
- Aluno

**Resposta: 200**

```json
[
  {
    "id": 1,
    "title": "Titulo Exemplo",
    "content": "Conteúdo Exemplo.",
    "authorId": 1,
    "createdAt": "2025-07-09T12:34:56Z",
    "updatedAt": "2025-07-10T08:00:00Z"
  }
]
```

**Códigos de resposta:**

- 200: Postagens encontradas.
- 401: Credenciais inválidas ou token malformado.
- 403: Perfil de acesso não autorizado.
- 404: Postagem não encontrada.

---

**_POST `/posts`_**

**Descrição:**  
Cria uma nova postagem.

**Autenticação:**

- Bearer Token

**Perfil de Acesso:**

- Professor

**Requisição:**

```json
{
  "title": "Titulo Exemplo",
  "content": "Conteúdo Exemplo.",
  "authorId": 1
}
```

**Códigos de resposta:**

- 201: Postagem criada.
- 400: Erro de validação.
- 401: Credenciais inválidas ou token malformado.
- 403: Perfil de acesso não autorizado.

---

**_PUT `/posts/{id}`_**

**Descrição:**  
Atualiza uma postagem existente.

**Autenticação:**

- Bearer Token

**Perfil de Acesso:**

- Professor

**Parâmetros de query:**

- id (integer, obrigatório)

**Requisição:**

```json
{
  "title": "Novo título",
  "content": "Novo conteúdo"
}
```

**Códigos de resposta:**

- 200: Postagem atualizada.
- 400: Erro de validação.
- 401: Credenciais inválidas ou token malformado.
- 403: Perfil de acesso não autorizado.
- 404: Postagem não encontrada.

---

**_DELETE `/posts/{id}`_**

**Descrição:**  
Remove uma postagem.

**Autenticação:**

- Bearer Token

**Perfil de Acesso:**

- Professor

**Parâmetros de query:**

- id (integer, obrigatório)

**Códigos de resposta:**

- 204: Postagem removida com sucesso.
- 401: Credenciais inválidas ou token malformado.
- 403: Perfil de acesso não autorizado.
- 404: Postagem não encontrada.

---

**_PUT `/posts/disable/{id}`_**

**Descrição:**  
Desabilita uma postagem.

**Autenticação:**

- Bearer Token

**Perfil de Acesso:**

- Professor

**Parâmetros de query:**

- id (integer, obrigatório)

**Códigos de resposta:**

- 204: Postagem desabilitada.
- 401: Credenciais inválidas ou token malformado.
- 403: Perfil de acesso não autorizado.
- 404: Postagem não encontrada.

---

**_PUT `/posts/enable/{id}`_**

**Descrição:**  
Habilita uma postagem.

**Autenticação:**

- Bearer Token

**Perfil de Acesso:**

- Professor

**Parâmetros de query:**

- id (integer, obrigatório)

**Códigos de resposta:**

- 204: Postagem habilitada.
- 401: Credenciais inválidas ou token malformado.
- 403: Perfil de acesso não autorizado.
- 404: Postagem não encontrada.

## Testes

Para garantir a qualidade do código, utilizamos testes unitários com Jest, que validam automaticamente os principais componentes da aplicação. Exigimos uma cobertura mínima de 80%.

```
Tabela de resultado dos testes:
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |     100 |    96.25 |     100 |     100 |
 src                |     100 |       80 |     100 |     100 |
  config.ts         |     100 |       80 |     100 |     100 | 4,29
 src/controllers    |     100 |    95.83 |     100 |     100 |
  auth.ts           |     100 |     87.5 |     100 |     100 | 12
  post.ts           |     100 |      100 |     100 |     100 |
 src/middlewares    |     100 |      100 |     100 |     100 |
  Authenticate.ts   |     100 |      100 |     100 |     100 |
  authorize.ts      |     100 |      100 |     100 |     100 |
 src/routes         |     100 |      100 |     100 |     100 |
  auth.ts           |     100 |      100 |     100 |     100 |
  post.ts           |     100 |      100 |     100 |     100 |
 src/schemas        |     100 |      100 |     100 |     100 |
  auth.ts           |     100 |      100 |     100 |     100 |
  post.ts           |     100 |      100 |     100 |     100 |
  user.ts           |     100 |      100 |     100 |     100 |
 src/types          |     100 |      100 |     100 |     100 |
  roles.ts          |     100 |      100 |     100 |     100 |
 src/use-cases/post |     100 |      100 |     100 |     100 |
  create.ts         |     100 |      100 |     100 |     100 |
  delete.ts         |     100 |      100 |     100 |     100 |
  disable.ts        |     100 |      100 |     100 |     100 |
  enable.ts         |     100 |      100 |     100 |     100 |
  get-all.ts        |     100 |      100 |     100 |     100 |
  get.ts            |     100 |      100 |     100 |     100 |
  search.ts         |     100 |      100 |     100 |     100 |
  update.ts         |     100 |      100 |     100 |     100 |
--------------------|---------|----------|---------|---------|-------------------

Test Suites: 18 passed, 18 total
Tests:       104 passed, 104 total
Snapshots:   0 total
Time:        3.048 s, estimated 6 s
Ran all test suites.
```