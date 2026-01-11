# MongoDB Setup Guide

## MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a free cluster

### Step 2: Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<database>` with `car_rental`

### Step 3: Create Database User

1. Go to **Database Access** in MongoDB Atlas
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username and password
5. Set permissions to **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Configure Network Access

1. Go to **Network Access** in MongoDB Atlas
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IP addresses
5. Click **"Confirm"**

### Step 5: Update .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `MONGODB_URI` in `.env` with your connection string


### Step 6: Test Connection

```bash
node test-mongodb-connection.js
```

You should see:
```
✅ Successfully connected to MongoDB Atlas!
```

## Local MongoDB (Alternative)

If you prefer local MongoDB:

1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Update `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/car_rental
   ```

## Troubleshooting

- **Authentication failed**: Check username and password
- **Connection timeout**: Verify IP is whitelisted in Network Access
- **ENOTFOUND error**: Check cluster URL is correct
