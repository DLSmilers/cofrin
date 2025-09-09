# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala dependências
RUN npm ci --legacy-peer-deps

# Copia todo o código
COPY . .

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove config padrão
RUN rm -rf /etc/nginx/conf.d/*

# Copia configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia arquivos buildados - Lovable geralmente usa 'dist'
COPY --from=builder /app/dist /usr/share/nginx/html

# Lista arquivos para debug
RUN ls -la /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
