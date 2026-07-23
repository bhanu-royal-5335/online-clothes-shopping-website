const dotenv = require('dotenv');
const dns = require('dns');

// Override DNS servers to Google DNS to bypass dead OS resolver
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables

dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database first
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
