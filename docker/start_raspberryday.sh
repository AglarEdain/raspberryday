#!/bin/bash

# Script to create and start the raspberryday container using docker-compose

# Navigate to the docker directory
cd "$(dirname "$0")"

# Run docker-compose up to create and start the container
sudo docker-compose up -d

# Show the status of the containers
sudo docker-compose ps

# Instructions for the user
 echo "Raspberryday container is up and running. Use 'sudo docker-compose down' to stop and remove the container." 
