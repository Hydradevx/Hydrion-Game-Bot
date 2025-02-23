import { EmbedBuilder } from 'discord.js'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'lottery',
  description: 'Buy a ticket for the lottery and try to win the jackpot!',
  options: [
    {
      name: 'tickets',
      type: 4,
      description: 'Number of tickets to buy',
      required: true,
    },
  ],
}
const ticketPrice = 100
const jackpotBase = 10
let lotteryPool = []
let jackpot = jackpotBase
let lotteryRunning = false
export async function execute(interaction, data) {
  const tickets = interaction.options.get('tickets')?.value
  if (tickets <= 0) {
    const embed = new EmbedBuilder()
      .setTitle('Invalid Ticket Purchase')
      .setDescription('You must buy at least one ticket!')
      .setColor('#FF0000')
    return interaction.reply({ embeds: [embed], ephemeral: true })
  }
  const cost = tickets * ticketPrice
  if (data.balance < cost) {
    const embed = new EmbedBuilder()
      .setTitle('Insufficient Balance')
      .setDescription(
        `You don't have enough coins! Each ticket costs **${ticketPrice} coins**.`,
      )
      .setColor('#FF0000')
    return interaction.reply({ embeds: [embed], ephemeral: true })
  }
  data.balance -= cost
  data.gamesPlayed += 1
  await data.save()
  jackpot += cost
  lotteryPool.push({ userId: interaction.user.id, tickets })
  const embed = new EmbedBuilder()
    .setTitle('🎟️ Lottery Ticket Purchased')
    .setDescription(
      `✅ You bought **${tickets}** tickets for **${cost} coins**!\n🎰 Current Jackpot: **${jackpot} coins**\n🎯 Winner will be chosen soon!`,
    )
    .setColor('#FFD700')
  await interaction.reply({ embeds: [embed] })
  if (!lotteryRunning) {
    lotteryRunning = true
    setTimeout(() => drawLottery(interaction), 600000)
  }
}
async function drawLottery(interaction) {
  if (lotteryPool.length === 0) {
    lotteryRunning = false
    return
  }
  let totalTickets = lotteryPool.reduce((sum, entry) => sum + entry.tickets, 0)
  let winningNumber = Math.floor(Math.random() * totalTickets)
  let currentCount = 0
  let winnerId = ''
  for (const entry of lotteryPool) {
    currentCount += entry.tickets
    if (currentCount >= winningNumber) {
      winnerId = entry.userId
      break
    }
  }
  if (!winnerId) {
    lotteryRunning = false
    return
  }
  let winnerData = await GameModel.findOne({ userId: winnerId })
  if (!winnerData) {
    winnerData = new GameModel({ userId: winnerId })
  }
  winnerData.balance += jackpot
  await winnerData.save()
  const embed = new EmbedBuilder()
    .setTitle('🎰 Lottery Results!')
    .setDescription(
      `🎉 **<@${winnerId}> won the jackpot of ${jackpot} coins!** 🎊\nThanks to all who participated!`,
    )
    .setColor('#00FF00')
  const channel = interaction.client.channels.cache.get('1334013835912282156')
  if (channel && 'send' in channel) {
    channel.send({ embeds: [embed] })
  }
  lotteryPool = []
  jackpot = jackpotBase
  lotteryRunning = false
}
