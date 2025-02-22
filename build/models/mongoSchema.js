import mongoose from 'mongoose'
const mongoSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, required: true, default: 0 },
})
const model = mongoose.model('DataBase', mongoSchema)
export default model
