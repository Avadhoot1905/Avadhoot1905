# ---------- Base Stage ----------
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Copy Prisma schema early (for postinstall)
COPY prisma ./prisma

# Install dependencies (including dev for build)
RUN npm install

# Copy the rest of the project files
COPY . .

# Generate Prisma client explicitly (in case postinstall was skipped)
RUN npx prisma generate || echo "Skipping prisma generate (no schema found)"

# Build the Next.js app
RUN npm run build


# ---------- Production Stage ----------
FROM node:22-alpine AS runner

# Set environment
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy necessary files from the build stage
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "start"]