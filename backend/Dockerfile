# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Backend listens on port 5000
EXPOSE 5000

# Start the Express server
CMD ["node", "server.js"]