# Use NodeJS base image
FROM node:12

ENV PIPELINE=$PIPELINE

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --no-cache --pull

# Copy app source
COPY . .

# Bind the port that the image will run on
EXPOSE 4200

# Define the Docker image's behavior at runtime
CMD ["npm", "run", "start"]
