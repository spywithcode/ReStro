import mongoose from 'mongoose';

// MongoDB connection interface
interface MongoConnection {
  isConnected: boolean;
}

// Connection state
const connection: MongoConnection = {
  isConnected: false,
};

// Database connection function
export const connectDB = async (): Promise<void> => {
  try {
    // Check if already connected
    if (connection.isConnected) {
      console.log('MongoDB already connected');
      return;
    }

    // Check if connection is in progress
    if (mongoose.connections[0].readyState) {
      connection.isConnected = true;
      console.log('MongoDB connection in progress');
      return;
    }

    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Coder_db_user:bSd9kQf0JJVmc997@cluster0.mgimzli.mongodb.net/?appName=Cluster0';

    // Connect to MongoDB
    const db = await mongoose.connect(mongoURI, {
      // Connection options for better performance and reliability
      bufferCommands: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    // Set connection state
    connection.isConnected = db.connections[0].readyState === 1;

    console.log(`MongoDB connected: ${db.connection.host}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
      connection.isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
      connection.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
      connection.isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    connection.isConnected = false;
    throw error;
  }
};

// Get connection status
export const getConnectionStatus = (): boolean => {
  return connection.isConnected;
};

// Disconnect from database
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    connection.isConnected = false;
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

// Export mongoose for use in models
export { mongoose };
export default mongoose;
