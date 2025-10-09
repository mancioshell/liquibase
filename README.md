# Liquibase vs TypeORM Sample Project

A Node.js/TypeScript project that integrates Liquibase for database migration management with TypeORM and Express.

## 📋 Prerequisites

Before starting, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Yarn](https://yarnpkg.com/) (version 4.9.1 or higher)
- [Docker](https://www.docker.com/) (required for tests with Testcontainers)
- [JAVA](https://www.java.com/en/download/) (required for Liquibase)

## 🚀 Installation

### 1. Install dependencies

The project uses Yarn as package manager:

```bash
yarn install
```

### 2. Configure environment variables

Create a `.env` file (if it doesn't already exist) and configure the necessary variables:

```bash
# The .env file should contain:
SERVER_PORT=3000
```

## 🏃‍♂️ Starting the server

### Development mode

To start the server in development mode with hot reload:

```bash
yarn dev
```

The server will be available at `http://localhost:3000` (or on the port specified in the `.env` file).

### Production build

To compile the TypeScript project:

```bash
yarn build
```

This command:
1. Cleans the `dist` directory
2. Compiles the TypeScript code into the `dist` directory

## 🗄️ Database management

### TypeORM migrations

To generate a new migration:

```bash
yarn migration:generate
```

To run migrations:

```bash
yarn migration:run
```

## 🧪 Testing

### Run all tests

```bash
yarn test
```

The tests use:
- **Vitest** as test runner
- **Testcontainers** to create temporary PostgreSQL containers during tests
- **PostgreSQL** as test database

### Test structure

The project includes:
- `test/liquibase.test.ts` - Integration tests to test Liquibase functionalities

This tests checks following Liquibase functionalities:
- Generating changelogs based on a baseline database
- Generating changelogs based on differences between two databases
- Applying changelogs to a database and verifying the results
- Testing automatic rollback of changesets
- Testing manual rollback of changesets

## 🚨 Important notes

1. **Docker**: Make sure Docker is running before starting the server or tests
2. **PostgreSQL Container**: The server automatically creates a temporary PostgreSQL container for development
3. **Tests**: Tests require Docker to create temporary PostgreSQL containers
