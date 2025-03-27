FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create upload directory if it doesn't exist
RUN mkdir -p ./data/uploads

# Make scripts directory executable if it exists
RUN if [ -d scripts ]; then chmod +x scripts/*.py; fi

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
