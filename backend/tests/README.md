# Niquel Backend Tests

This directory contains the test suite for the Niquel backend API. The tests are organized to cover API endpoints, services, and models.

## Overview

The test suite is built using:

- **pytest**: Main testing framework
- **pytest-asyncio**: For testing async code
- **httpx**: For testing HTTP endpoints
- **pytest-cov**: For test coverage reporting
- **SQLAlchemy**: For database testing with an isolated test database

## Test Structure

```
tests/
├── conftest.py                # Shared fixtures and test configuration
├── test_api/                  # API endpoint tests
│   ├── test_auth.py           # Authentication endpoints
│   ├── test_users.py          # User management endpoints
│   ├── test_projects.py       # Project management endpoints
│   ├── test_periods.py        # Period management endpoints
│   ├── test_files.py          # File management endpoints
│   └── test_assignments.py    # User-project assignment endpoints
├── test_services/             # Service layer tests
└── test_models/               # Model tests
```

## Running Tests

### Prerequisites

- PostgreSQL installed and running
- Python 3.11+ and required dependencies

### Setup for Testing

1. Create a test database (this is done automatically by the test suite):
   ```bash
   # The test suite will create and drop a database named 'test_niquel'
   # Make sure your PostgreSQL user has permissions to create databases
   ```

2. Install test dependencies:
   ```bash
   pip install -e ".[dev]"  # Install package with dev dependencies
   # or
   pip install pytest pytest-asyncio pytest-cov httpx
   ```

### Running All Tests

```bash
# From the project root
pytest

# With coverage report
pytest --cov=app

# Verbose output
pytest -v
```

### Running Specific Tests

```bash
# Run a specific test file
pytest tests/test_api/test_auth.py

# Run a specific test function
pytest tests/test_api/test_auth.py::test_login_success

# Run tests with a specific marker
pytest -m "auth"
```

## Test Database

The test suite uses a separate database named `test_niquel` for testing. This database is created and dropped for each test session, ensuring test isolation.

- Database setup happens in `conftest.py`
- Each test function gets a fresh database session
- The database schema is created for each test session and dropped afterward
- Test fixtures create sample data for each test

## Test Fixtures

The test suite includes several fixtures in `conftest.py` to simplify test setup:

- `db_session`: SQLAlchemy async session for database operations
- `client`: FastAPI test client for making HTTP requests
- `test_user`: A regular user for testing
- `test_admin`: An admin user for testing
- `test_manager`: A manager user for testing
- `test_project`: A sample project for testing
- `user_token_headers`: Auth headers for a regular user
- `admin_token_headers`: Auth headers for an admin user
- `manager_token_headers`: Auth headers for a manager user

## Writing New Tests

### Testing API Endpoints

When testing API endpoints, use the `client` fixture to make HTTP requests:

```python
@pytest.mark.asyncio
async def test_my_endpoint(client, user_token_headers):
    response = await client.get("/api/my-endpoint", headers=user_token_headers)
    assert response.status_code == 200
    # More assertions...
```

### Testing Database Operations

When testing database operations, use the `db_session` fixture:

```python
@pytest.mark.asyncio
async def test_my_database_operation(db_session):
    # Perform database operations
    result = await db_session.execute(select(MyModel).where(MyModel.id == some_id))
    item = result.scalars().first()
    assert item is not None
    # More assertions...
```

## Test Coverage

Generate a test coverage report using pytest-cov:

```bash
pytest --cov=app --cov-report=term --cov-report=html
```

This will generate:
- A terminal report showing coverage statistics
- An HTML report in the `htmlcov` directory for detailed line-by-line coverage

## CI/CD Integration

These tests are designed to run in CI/CD pipelines. Make sure your CI/CD environment:

- Has PostgreSQL installed and running
- Installs the required Python dependencies
- Has permissions to create and drop databases

Example GitHub Actions workflow will be added in the future.
