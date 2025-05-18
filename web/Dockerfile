# Base image
FROM node:14-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy project files
COPY . .

# Build the app
RUN yarn build

# Production environment
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 