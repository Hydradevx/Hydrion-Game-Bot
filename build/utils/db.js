import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  throw new Error('❌ MONGO_URI is not defined in .env file!')
}
export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('🔥 MongoDB Connected Successfully!')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error)
    process.exit(1)
  }
}
