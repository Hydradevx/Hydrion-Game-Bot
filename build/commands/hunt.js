import { EmbedBuilder } from 'discord.js'
export const data = {
  name: 'hunt',
  description: 'Hunt for animals and earn rewards',
}
export async function execute(interaction, data) {
  const cooldown = 10 * 1000
  const lastHunt = data.lastHunt ? new Date(data.lastHunt).getTime() : 0
  const now = Date.now()
  if (now - lastHunt < cooldown) {
    const remainingTime = ((cooldown - (now - lastHunt)) / 1000).toFixed(1)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('⏳ Hunt Cooldown')
          .setDescription(`You can hunt again in **${remainingTime} seconds**.`)
          .setColor('#ff0000'),
      ],
      ephemeral: true,
    })
  }
  const gems = {
    'Lucky Gem': { rareBoost: 1.5, multiHunt: 1, extraCoins: 0 },
    'Bounty Gem': { rareBoost: 1, multiHunt: 1, extraCoins: 100 },
    'Multi-Hunt Gem': { rareBoost: 1, multiHunt: 2, extraCoins: 0 },
  }
  const equippedGem = data.gems.equipped
    ? gems[data.gems.equipped]
    : { rareBoost: 1, multiHunt: 1, extraCoins: 0 }
  const animals = {
    common: ['🐀 Rat', '🐇 Rabbit', '🐿️ Squirrel', '🦆 Duck', '🐔 Chicken'],
    uncommon: ['🦊 Fox', '🐗 Boar', '🐍 Snake', '🐢 Turtle', '🦝 Raccoon'],
    rare: ['🦌 Deer', '🐺 Wolf', '🐻 Bear', '🦅 Eagle', '🐊 Crocodile'],
    epic: ['🐆 Leopard', '🐘 Elephant', '🦈 Shark', '🦍 Gorilla', '🦖 T-Rex'],
    legendary: [
      '🐉 Dragon',
      '🦄 Unicorn',
      '👾 Alien Beast',
      '🔥 Phoenix',
      '⚡ Thunder Wolf',
    ],
  }
  function getRandomAnimal() {
    const chance = Math.random() * 100
    if (chance < 50 / equippedGem.rareBoost)
      return {
        name: animals.common[Math.floor(Math.random() * animals.common.length)],
        value: 50,
      }
    if (chance < 75 / equippedGem.rareBoost)
      return {
        name: animals.uncommon[
          Math.floor(Math.random() * animals.uncommon.length)
        ],
        value: 150,
      }
    if (chance < 90 / equippedGem.rareBoost)
      return {
        name: animals.rare[Math.floor(Math.random() * animals.rare.length)],
        value: 300,
      }
    if (chance < 98 / equippedGem.rareBoost)
      return {
        name: animals.epic[Math.floor(Math.random() * animals.epic.length)],
        value: 700,
      }
    return {
      name: animals.legendary[
        Math.floor(Math.random() * animals.legendary.length)
      ],
      value: 3000,
    }
  }
  function getLootboxDrop() {
    const chance = Math.random() * 100
    if (chance < 0.5) return 'legendary'
    if (chance < 2) return 'epic'
    if (chance < 5) return 'rare'
    if (chance < 10) return 'common'
    return null
  }
  const results = []
  for (let i = 0; i < equippedGem.multiHunt; i++) {
    results.push(getRandomAnimal())
  }
  data.huntStats.totalHunts += 1
  let lootbox = getLootboxDrop()
  let lootboxMessage = ''
  if (lootbox) {
    data.lootboxes[lootbox] += 1
    lootboxMessage = `\n🎁 You also found a **${lootbox.charAt(0).toUpperCase() + lootbox.slice(1)} Lootbox**!`
  }
  results.forEach((animal) => {
    if (!data.huntStats.animalsCaught[animal.name]) {
      data.huntStats.animalsCaught[animal.name] = 0
    }
    data.huntStats.animalsCaught[animal.name] += 1
    data.balance += animal.value + equippedGem.extraCoins
  })
  data.lastHunt = now
  await data.save()
  const embed = new EmbedBuilder()
    .setTitle('🏹 Hunt Successful!')
    .setDescription(
      results
        .map(
          (animal) =>
            `You caught **${animal.name}** worth **${animal.value} coins**.`,
        )
        .join('\n') + lootboxMessage,
    )
    .setFooter({
      text: equippedGem.extraCoins
        ? `Bonus: +${equippedGem.extraCoins} coins`
        : '',
    })
    .setColor('#6f00e6')
  await interaction.reply({ embeds: [embed] })
}
