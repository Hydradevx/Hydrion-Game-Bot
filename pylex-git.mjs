import fs from 'fs'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GITHUB_REPO = 'https://github.com/Hydradevx/Hydrion-Game-Bot.git' 
const DESTINATION = path.join(__dirname, 'Hydrion-Game-Bot') 

async function updateRepo() {
  try {
    if (!fs.existsSync(DESTINATION)) {
      console.log('🚀 Cloning repository for the first time...')
      execSync(`git clone ${GITHUB_REPO} ${DESTINATION}`, { stdio: 'inherit' })
    } else {
      console.log('🔄 Pulling latest changes from the repository...')
      execSync(`git -C ${DESTINATION} pull`, { stdio: 'inherit' })
    }

    runCommands(DESTINATION)
  } catch (error) {
    console.error('❌ Error updating repository:', error)
  }
}

function runCommands(repoPath) {
  try {
    console.log(`📂 Switching to repo folder: ${repoPath}`)
    process.chdir(repoPath) 

    console.log('📦 Running npm install...')
    execSync('npm install', { stdio: 'inherit' })

    console.log('🚀 Starting the bot...')
    execSync('npm start', { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ Failed to start the bot:', error)
  }
}

updateRepo()
