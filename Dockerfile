# Step 1: Use an official Node.js runtime environment as the base image
FROM node:18-alpine

# Step 2: Set the working directory inside the server container
WORKDIR /usr/src/app

# Step 3: Copy package.json first to install dependencies efficiently
COPY package*.json ./

# Step 4: Install the required packages (Express)
RUN npm install

# Step 5: Copy the rest of your store's application code (server.js and public folder)
COPY . .

# Step 6: Expose port 3000 so the platform can route web traffic to it
EXPOSE 3000

# Step 7: Define the command to start your automated server application
CMD [ "npm", "start" ]
