# Quick Start with MongoDB Atlas

## Prerequisites

- MongoDB Atlas account (free tier available)
- Connection string from MongoDB Atlas

## Step 1: Get Your Connection String

1. Go to https://cloud.mongodb.com
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Extract your cluster URL and credentials

## Step 2: Configure .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the connection string in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car_rental?retryWrites=true&w=majority
```

Replace:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster.mongodb.net` with your actual cluster URL

## Step 3: Whitelist Your IP Address

1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IP addresses
5. Click **"Confirm"**

## Step 4: Test Connection

```bash
node test-mongodb-connection.js
```

Expected output:
```
✅ Successfully connected to MongoDB Atlas!
```

## Step 5: Start Server

```bash
npm run dev
```

You should see:
```
MongoDB Connected: cluster.mongodb.net
Server running on port 5000
```

## Need Help?

- See `MONGODB_SETUP.md` for detailed instructions
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
