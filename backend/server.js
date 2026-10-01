const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Connect to Database & Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`Backend API URL: http://localhost:${PORT}`);
      console.log(`Health Check:    http://localhost:${PORT}/api/health`);
      console.log(`=================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
