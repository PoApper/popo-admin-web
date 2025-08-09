# Buile Step
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --ignore-scripts --legacy-peer-deps

COPY . .

# dev, prod
ARG NEXT_PUBLIC_ENV
ENV NEXT_PUBLIC_ENV=${NEXT_PUBLIC_ENV}

# popo version
ARG POPO_VERSION
ENV NEXT_PUBLIC_POPO_VERSION=${POPO_VERSION}

RUN npm run build

# Run Step
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package*.json ./

RUN npm ci --only=production --ignore-scripts

EXPOSE 3001

CMD ["npm", "run", "start"]
