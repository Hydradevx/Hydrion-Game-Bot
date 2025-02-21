import { Client, Collection, CommandInteraction, Message } from 'discord.js'

interface CLIENT extends Client {
  commands: Collection<
    string,
    {
      data: any
      execute: (exec: Cmd) => Promise<void>
    }
  >
}

interface Cmd {
  interaction: CommandInteraction
  message: Message
}

export { CLIENT, Cmd }
