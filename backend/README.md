# AREA - Backend part

## Run in development mode

To deploy the backend part of the AREA project, follow these steps:

1. **Clone the Repository**: Start by cloning the AREA backend repository to your local machine.

```bash
git clone https://github.com/EliotAmn/Epitech-AREA.git
cd Epitech-AREA/
```

2. Setup environment variables:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

> NOTE: Make sure to edit the .env files to set your own configuration values.

3. Run the database

```bash
docker compose up -d postgres
```

4. Setup the backend

```bash
cd backend/
# Install dependencies
npm install
# Run database migrations
npx prisma generate --schema src/prisma/schema.prisma
npx prisma migrate deploy --schema src/prisma/schema.prisma

# Start the backend server
npm start
```
