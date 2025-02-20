import dotenv from "dotenv";
dotenv.config();

import {REST, Routes} from "discord.js";
import fs from "fs"

const token: string | undefined = process.env.TOKEN;
if (!token) {
  throw new Error("TOKEN is not defined in the environment variables.");
}
const commands: any = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(<string>process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})