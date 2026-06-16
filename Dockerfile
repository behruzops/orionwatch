# OrionWatch — © OrionSystems.  Linux serverlar uchun image.
FROM node:24-alpine

LABEL org.opencontainers.image.title="OrionWatch" \
      org.opencontainers.image.vendor="OrionSystems" \
      org.opencontainers.image.description="Local loyihalar/portlar/Docker monitoringi"

# docker-cli (host Docker'ni ko'rish), iproute2 (ss — portlar), wget (healthcheck)
RUN apk add --no-cache docker-cli iproute2

WORKDIR /app
COPY package.json server.js ./
COPY public ./public

ENV PORT=7575 \
    STORE_PATH=/app/data/store.json
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 7575
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:7575/api/settings || exit 1

CMD ["node", "server.js"]
