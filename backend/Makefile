.PHONY: help install dev test lint format migrate seed run clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install      Install dependencies"
	@echo "  make dev          Run development server"
	@echo "  make test         Run tests"
	@echo "  make lint         Run linting checks"
	@echo "  make format       Format code with Black"
	@echo "  make migrate      Run database migrations"
	@echo "  make seed         Seed the database with sample data"
	@echo "  make run          Run production server"
	@echo "  make clean        Clean up build and cache files"

# Install dependencies
install:
	pip install -r requirements.txt

# Run development server
dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
test:
	pytest -v

# Run tests with coverage
test-cov:
	pytest --cov=app --cov-report=term --cov-report=html

# Run linting
lint:
	flake8 app tests

# Format code
format:
	black app tests
	isort app tests

# Run database migrations
migrate:
	alembic upgrade head

# Seed the database
seed:
	python scripts/seed_data.py

# Run production server
run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000

# Clean up build and cache files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name "*.egg" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name "htmlcov" -exec rm -rf {} +
	find . -type d -name ".coverage" -exec rm -rf {} +
	find . -type d -name "build" -exec rm -rf {} +
	find . -type d -name "dist" -exec rm -rf {} +
