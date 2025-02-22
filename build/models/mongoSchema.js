import mongoose from 'mongoose'
const mongoSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  lastDaily: { type: Date, default: null },
  dailyStreak: { type: Number, default: 0 },
  balance: { type: Number, default: 50 },
  gamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  lastBet: { type: Date, default: null },
})
const model = mongoose.model('DataBase', mongoSchema)
export default model
