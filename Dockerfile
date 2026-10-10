# Use the official Node.js image as the base
FROM node:24-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the application files
COPY . .

# Install minification tools and other dependencies
RUN npm install -g http-server uglify-js clean-css-cli

# Minify JavaScript and CSS, overwriting the original files
RUN npx uglify-js script.js -o script.js -c -m
RUN npx cleancss styles.css -o styles.css

# Expose the port the web server will run on
EXPOSE 8080

# Run the web server
CMD ["http-server", "-p", "8080", "-c-1"]
