import { CommandInteraction, EmbedBuilder } from "discord.js";

export const data = {
  name: "hunt",
  description: "Hunt for animals and earn rewards",
};

export async function execute(interaction: CommandInteraction, data) {
  const cooldown = 10 * 1000;
  const lastHunt = data.lastHunt ? new Date(data.lastHunt).getTime() : 0;
  const now = Date.now();

  if (now - lastHunt < cooldown) {
    const remainingTime = ((cooldown - (now - lastHunt)) / 1000).toFixed(1);
    const cooldownEmbed = new EmbedBuilder()
      .setTitle("⏳ Hunt Cooldown")
      .setDescription(`You can hunt again in **${remainingTime} seconds**.`)
      .setColor("#ff0000");

    return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
  }

  const animals = {
    common: ["🐀 Rat", "🐇 Rabbit", "🐿️ Squirrel", "🦆 Duck", "🐔 Chicken"],
    uncommon: ["🦊 Fox", "🐗 Boar", "🐍 Snake", "🐢 Turtle", "🦝 Raccoon"],
    rare: ["🦌 Deer", "🐺 Wolf", "🐻 Bear", "🦅 Eagle", "🐊 Crocodile"],
    epic: ["🐆 Leopard", "🐘 Elephant", "🦈 Shark", "🦍 Gorilla", "🦖 T-Rex"],
    legendary: ["🐉 Dragon", "🦄 Unicorn", "👾 Alien Beast", "🔥 Phoenix", "⚡ Thunder Wolf"],
  };

  function getRandomAnimal() {
    const chance = Math.random() * 100;
    if (chance < 50) return { name: animals.common[Math.floor(Math.random() * animals.common.length)], value: 50 };
    if (chance < 75) return { name: animals.uncommon[Math.floor(Math.random() * animals.uncommon.length)], value: 150 };
    if (chance < 90) return { name: animals.rare[Math.floor(Math.random() * animals.rare.length)], value: 300 };
    if (chance < 98) return { name: animals.epic[Math.floor(Math.random() * animals.epic.length)], value: 700 };
    return { name: animals.legendary[Math.floor(Math.random() * animals.legendary.length)], value: 3000 };
  }

  const foundAnimal = getRandomAnimal();
  data.huntStats.totalHunts += 1;

  if (!data.huntStats.animalsCaught[foundAnimal.name]) {
    data.huntStats.animalsCaught[foundAnimal.name] = 0;
  }
  data.huntStats.animalsCaught[foundAnimal.name] += 1;

  data.lastHunt = now;
  await data.save();

  const embed = new EmbedBuilder()
    .setTitle("🏹 Hunt Successful!")
    .setDescription(`You caught a **${foundAnimal.name}** worth **${foundAnimal.value} coins**.\nYou now have **${data.huntStats.animalsCaught[foundAnimal.name]}x ${foundAnimal.name}**.`)
    .setColor("#6f00e6");

  try {
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Error replying to interaction:", error);
  }
}