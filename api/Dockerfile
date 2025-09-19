FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the project
RUN npm run build

# Copy swagger.yaml into dist
COPY src/docs/swagger.yaml ./dist/docs/swagger.yaml

# Expose port
EXPOSE 4000

# Start app
CMD ["npm", "start"]
