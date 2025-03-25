FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build for production (uncomment this for production)
# RUN npm run build

# Set environment variables if needed
# ENV VITE_API_BASE_URL=http://backend:8000

# Start the application
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
