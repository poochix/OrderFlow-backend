# Stage 1: Build the TypeScript application
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install ALL dependencies (including TypeScript and build tools)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Compile TypeScript into JavaScript (Outputs to /dist)
RUN npm run build


# Stage 2: Production Environment
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Set Node environment to production for performance optimizations
ENV NODE_ENV=production

# Copy package files again
COPY package*.json ./

# Install ONLY production dependencies using modern npm syntax
RUN npm ci --omit=dev

# Copy the compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 5000

#**** Run the container as a non-root user for security // 
USER node

# Start the Node server securely
CMD ["node", "dist/server.js"]
