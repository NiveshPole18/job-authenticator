FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 5000

# Use production start command
CMD ["npm", "start"]
