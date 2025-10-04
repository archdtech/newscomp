FROM python:3.8-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p data logs config

# Set the command to run the scheduler
CMD ["python", "src/scheduler.py"]
