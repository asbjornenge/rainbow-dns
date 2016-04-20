FROM node:4-slim
RUN npm install -g rainbow-dns
ENTRYPOINT ["rainbow-dns"]
