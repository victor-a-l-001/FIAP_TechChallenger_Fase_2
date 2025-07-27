FROM node:20-slim
 
ENV NODE_ENV=production
 
WORKDIR /app

# 1) Instala client do Postgres (pg_isready)
RUN apt-get update \
 && apt-get install -y postgresql-client \
 && rm -rf /var/lib/apt/lists/*

# 2) Copia package.json e instala deps
COPY package*.json ./
RUN npm install --omit=dev

# 3) Copia schema Prisma e gera client
COPY prisma ./prisma
RUN npx prisma generate

# 4) Copia o código e compila 
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
 
EXPOSE 3000
CMD ["npm", "start"]
