# ==========================
# 🏗️ Etapa de build
# ==========================

# Usa imagem base leve do Node.js
FROM node:20-slim AS build

# Define diretório de trabalho
WORKDIR /app

# Instala o cliente do PostgreSQL (necessário para comandos Prisma que acessam o banco)
RUN apt-get update \
    && apt-get install -y postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia arquivos de dependências
COPY package*.json ./

# Instala TODAS as dependências (inclui devDependencies necessárias para build, como TypeScript e types)
RUN npm install

# Copia schema do Prisma e gera o cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copia o restante do código fonte
COPY tsconfig.json ./
COPY src ./src

# Compila TypeScript (gera saída em `dist/`)
RUN npm run build

# ==========================
# 🚀 Etapa final (imagem para produção)
# ==========================

# Usa a mesma imagem base (slim) para manter a imagem leve
FROM node:20-slim

# Define diretório de trabalho
WORKDIR /app

# Instala novamente o cliente do PostgreSQL (necessário para `prisma migrate deploy` em produção)
RUN apt-get update \
    && apt-get install -y postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia arquivos de dependências e instala SOMENTE as de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copia schema do Prisma e gera o cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copia apenas os arquivos buildados da etapa anterior
COPY --from=build /app/dist ./dist

# Expõe a porta padrão da aplicação (Render usará a variável PORT)
EXPOSE 3000

# Comando de inicialização:
# - Roda as migrations com `prisma migrate deploy`
# - Inicia o servidor com o build compilado
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
