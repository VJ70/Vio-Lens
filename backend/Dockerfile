# Use the official Python slim image for a smaller footprint
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required by OpenCV and EasyOCR
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
# We use --no-cache-dir to keep the Docker image size small
RUN pip install --no-cache-dir -r requirements.txt

# Create the models directory inside the container
RUN mkdir -p /app/models

# Copy the rest of the backend application code
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run the application using Uvicorn
# Render and HuggingFace pass the port via the $PORT environment variable, 
# but we default to 8000 if it's not set.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
