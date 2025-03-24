from setuptools import setup, find_packages

setup(
    name="niquel",
    version="0.1.0",
    description="Niquel Project Management System for water resources",
    author="Niquel Team",
    author_email="contact@example.com",
    packages=find_packages(),
    include_package_data=True,
    python_requires=">=3.11",
    install_requires=[
        "fastapi>=0.103.1",
        "uvicorn>=0.23.2",
        "python-multipart>=0.0.6",
        "sqlalchemy>=2.0.20",
        "alembic>=1.12.0",
        "psycopg2-binary>=2.9.7",
        "asyncpg>=0.28.0",
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "pydantic>=2.3.0",
        "pydantic-settings>=2.0.3",
        "python-dotenv>=1.0.0",
        "email-validator>=2.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.1",
            "pytest-cov>=4.1.0",
            "black>=23.7.0",
            "isort>=5.12.0",
            "flake8>=6.1.0",
            "httpx>=0.24.1",
        ]
    },
)
