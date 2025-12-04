# backend/Dockerfile

FROM node:20-alpine

# --- ADICIONE ESTA LINHA ---
# Instala o OpenSSL necessário para o Prisma funcionar no Alpine Linux
RUN apk add --no-cache openssl
# ---------------------------

WORKDIR /usr/src/app

COPY package*.json ./

# ... o resto do seu arquivo continua igual
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main"]