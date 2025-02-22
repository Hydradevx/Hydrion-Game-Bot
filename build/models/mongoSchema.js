import mongoose from 'mongoose'
const mongoSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  lastDaily: { type: Date, default: null },
  huntStats: {
    totalHunts: { type: Number, default: 0 },
    animalsCaught: { type: Object, default: {} },
  },
  gems: {
    owned: { type: Object, default: {} },
    equipped: { type: String, default: null },
  },
  lootboxes: {
    common: { type: Number, default: 0 },
    rare: { type: Number, default: 0 },
    epic: { type: Number, default: 0 },
    legendary: { type: Number, default: 0 },
  },
  inventory: {
    gems: { type: Map, of: Number, default: {} },
    weapons: { type: [String], default: [] },
  },
  upgrades: {
    critChance: { type: Number, default: 0 },
    lootMultiplier: { type: Number, default: 1 },
  },
  lastHunt: { type: Date, default: null },
  lastCommandUse: { type: Map, of: Date, default: {} },
  createdAt: { type: Date, default: Date.now },
})
const model = mongoose.model('DataBase', mongoSchema)
export default model
