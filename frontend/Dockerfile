FROM node:16-alpine

WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar cache
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para iniciar en modo desarrollo
CMD ["npm", "start"]