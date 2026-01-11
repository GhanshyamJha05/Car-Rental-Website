const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📝 MongoDB Atlas Configuration Setup\n');
console.log('This script will help you create your .env file.\n');

rl.question('Enter your MongoDB Atlas cluster URL (e.g., cluster0.abc123.mongodb.net): ', (clusterUrl) => {
  if (!clusterUrl || clusterUrl.trim() === '') {
    console.log('❌ Cluster URL is required!');
    rl.close();
    process.exit(1);
  }

  // Remove any protocol or paths
  clusterUrl = clusterUrl.trim().replace(/^mongodb\+srv:\/\//, '').replace(/\/.*$/, '');

  rl.question('Enter your MongoDB Atlas username: ', (username) => {
    if (!username || username.trim() === '') {
      console.log('❌ Username is required!');
      rl.close();
      process.exit(1);
    }

    rl.question('Enter your MongoDB Atlas password: ', (password) => {
      if (!password || password.trim() === '') {
        console.log('❌ Password is required!');
        rl.close();
        process.exit(1);
      }

      const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://${username.trim()}:${password.trim()}@${clusterUrl}/car_rental?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Stripe (Test Mode) - Get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PLATFORM_COMMISSION_RATE=0.15

# CORS
FRONTEND_URL=http://localhost:3000

# Google Maps / Mapbox (Optional for now)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
`;

      const envPath = path.join(__dirname, '.env');
      fs.writeFileSync(envPath, envContent);

      console.log('\n✅ .env file created successfully!');
      console.log(`\nConnection string: mongodb+srv://${username.trim()}:****@${clusterUrl}/car_rental`);
      console.log('\n📋 Next steps:');
      console.log('1. Make sure your IP is whitelisted in MongoDB Atlas (Network Access)');
      console.log('2. Test connection: node test-mongodb-connection.js');
      console.log('3. Start server: npm run dev');
      console.log('\n⚠️  IMPORTANT: .env file contains sensitive data and is ignored by git');
      console.log('   Never commit .env files to version control!\n');

      rl.close();
    });
  });
});
