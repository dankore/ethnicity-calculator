# Use the official Node.js image as the base
FROM node:16-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the application files
COPY . .

# Install the http-server package globally
RUN npm install -g http-server

# Expose the port the web server will run on
EXPOSE 8080

# Run the web server
CMD ["http-server", "-p", "8080", "-c-1"]
