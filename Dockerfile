FROM node:20-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install bird from GitHub
RUN git clone https://github.com/jawond/bird.git /opt/bird \
    && cd /opt/bird \
    && npm install \
    && npm link

WORKDIR /app
COPY package.json server.js ./
RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
