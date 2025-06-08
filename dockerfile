### Build Stage ###
FROM oven/bun:1.2 AS builder

WORKDIR /app

# Only copy package files first to leverage Docker cache
COPY bun.lock package.json tsconfig.json vite.config.* ./
COPY tsconfig.json ./

# Install dependencies (cached if no changes in lock file)
RUN bun install --frozen-lockfile

# Now copy the rest of the application
COPY . .

# Build the app using Vite
RUN bun run build


### Serve Stage ###
FROM nginx:alpine AS runner

# Copy built output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the desired port
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
