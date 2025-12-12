#!/bin/bash

echo "🚀 Deploying Backend to Azure..."

# Build and push backend image
echo "📦 Building backend image..."
docker build -t truckfleetacr.azurecr.io/truck-fleet-backend:latest ./backend

echo "📤 Pushing to Azure Container Registry..."
docker push truckfleetacr.azurecr.io/truck-fleet-backend:latest

echo "✅ Backend deployed successfully!"
echo "🔄 Go to Azure Portal and restart the Container App to apply changes"
echo "   Or wait a few minutes for automatic detection"
