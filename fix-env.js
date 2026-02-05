const fs = require('fs');
const path = require('path');

const envContent = `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_Pc9UcQUMRZk4dLTS_RtCGTMYTpZz6QHJkuObM7zWIQq2VGd
# Recommended for most uses
DATABASE_URL=postgresql://neondb_owner:npg_UE7oLymiz1hl@ep-purple-mouse-a40cf4zt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_UE7oLymiz1hl@ep-purple-mouse-a40cf4zt.us-east-1.aws.neon.tech/neondb?sslmode=require

# Parameters for constructing your own connection string
PGHOST=ep-purple-mouse-a40cf4zt-pooler.us-east-1.aws.neon.tech
PGHOST_UNPOOLED=ep-purple-mouse-a40cf4zt.us-east-1.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_UE7oLymiz1hl

# Parameters for Vercel Postgres Templates
POSTGRES_URL=postgresql://neondb_owner:npg_UE7oLymiz1hl@ep-purple-mouse-a40cf4zt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_UE7oLymiz1hl@ep-purple-mouse-a40cf4zt.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-purple-mouse-a40cf4zt-pooler.us-east-1.aws.neon.tech
POSTGRES_PASSWORD=npg_UE7oLymiz1hl
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgresql://neondb_owner:npg_UE7oLymiz1hl@ep-purple-mouse-a40cf4zt-pooler.us-east-1.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_UE7oLymiz1hl@ep-purple-mouse-a40cf4zt-pooler.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
GOOGLE_PLACES_API_KEY=AIzaSyB-HtQED8ocWZbssB9pMvC6XkT3dNkhQu8
GOOGLE_PLACE_ID=ChIJ0VvApZ0nQYYRtCNaSPMwoz8
SESSION_SECRET=supersecretkey12345
`;

fs.writeFileSync(path.join(__dirname, '.env'), envContent, 'utf8');
console.log('.env file written with UTF-8 encoding');
