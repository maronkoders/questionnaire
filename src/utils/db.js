import mongoose from 'mongoose';

export async function connectDB() {
    try {
        const username = encodeURIComponent(process.env.MONGODB_USERNAME);
        const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
        const hosts = process.env.MONGODB_HOSTS;
        const database = process.env.MONGODB_DATABASE;
        const options = process.env.MONGODB_OPTIONS || '';
        
        // Construct connection string based on environment
        const mongoURI = 'mongodb+srv://testdevcoder:w7PCNoCKjR1mxlNA@cpa.lzlm1.mongodb.net/?retryWrites=true&w=majority&appName=cpa';
        
        if (!mongoURI) {
            throw new Error('MongoDB connection parameters are not properly defined');
        }

        // Connection options
        const connectionOptions = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        // Connect with retry logic
        let retries = 5;
        while (retries > 0) {
            try {
                await mongoose.connect(mongoURI, connectionOptions);
                console.log('MongoDB Connected Successfully');
                return;
            } catch (error) {
                retries -= 1;
                if (retries === 0) {
                    throw error;
                }
                console.log(`Connection failed, retrying... (${retries} attempts remaining)`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
            }
        }
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    }
} 