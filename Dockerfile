FROM node:14.18.0-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:14.18.0-alpine
WORKDIR /app
COPY --from=build /app ./
CMD ["npm", "run", "start:prod"]