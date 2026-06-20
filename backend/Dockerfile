# Use the official Python slim image for a smaller footprint
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required by OpenCV and EasyOCR
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
# We use --no-cache-dir to keep the Docker image size small
RUN pip install --no-cache-dir -r requirements.txt && \
    pip uninstall -y opencv-python opencv-python-headless && \
    pip install opencv-python-headless

# Create the models directory inside the container
RUN mkdir -p /app/models

# Copy the rest of the backend application code
COPY . .

# Expose port 7860 (Hugging Face Spaces requirement)
EXPOSE 7860

# Command to run the application using Uvicorn on port 7860
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 7860"]
