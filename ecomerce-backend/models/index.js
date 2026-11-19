import mongoose from 'mongoose';
export const getMongoUri = () => mongoUri;

const mongoUri = 'mongodb+srv://rooot:rooot123@airbnb.ezegojo.mongodb.net/?appName=airbnb&retryWrites=true&w=majority';

export async function connectDB() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export function disconnectDB() {
  return mongoose.disconnect();
}

export default mongoose;
