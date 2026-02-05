const fs = require('fs');
const path = require('path');

const envContent = `BLOB_READ_WRITE_TOKEN=
# Recommended for most uses
DATABASE_URL=

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED=

# Parameters for constructing your own connection string
PGHOST=
PGHOST_UNPOOLED=
PGUSER=
PGDATABASE=
PGPASSWORD=

# Parameters for Vercel Postgres Templates
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
POSTGRES_URL_NO_SSL=
POSTGRES_PRISMA_URL=
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
SESSION_SECRET=
`;

console.log('Use this script to generate a .env file locally. Fill in the values above with your actual secrets.');
// fs.writeFileSync(path.join(__dirname, '.env'), envContent, 'utf8');
// console.log('.env file written with UTF-8 encoding');
