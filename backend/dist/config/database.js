import mongoose from 'mongoose';
import dns from 'node:dns';
const connectDB = async () => {
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
        if (!mongoUri) {
            console.error('❌ MongoDB URI not found in environment variables');
            console.error('Please set MONGODB_URI or MONGO_URI in your .env file');
            process.exit(1);
        }
        console.log('🔍 Checking MongoDB URI...');
        console.log('URI starts with:', mongoUri.substring(0, 20) + '...');
        console.log('🔄 Connecting to MongoDB...');
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    }
    catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.error('Error code:', error.code);
        console.error('Error name:', error.name);
        if (error.code === 'ESERVFAIL') {
            console.error('\n💡 DNS Resolution Error - Possible solutions:');
            console.error('1. Check your internet connection');
            console.error('2. Verify your MongoDB Atlas cluster is running (not paused)');
            console.error('3. Check if your IP is whitelisted in MongoDB Atlas');
            console.error('4. Try using a direct connection string instead of SRV');
            console.error('5. Check firewall/network settings');
        }
        // Don't exit in development - allow server to start but log the error
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        else {
            console.warn('⚠️  Continuing without database connection (development mode)');
        }
    }
};
export default connectDB;
