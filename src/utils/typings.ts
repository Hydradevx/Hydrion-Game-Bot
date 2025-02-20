import { Client, Collection } from 'discord.js'

interface CLIENT extends Client {
  commands: Collection<string, any>
}

export { CLIENT }
