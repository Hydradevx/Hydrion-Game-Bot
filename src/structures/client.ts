import { Client, GatewayIntentBits } from 'discord.js'
import {CLIENT} from "../utils/typings"

export const client: CLIENT = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})