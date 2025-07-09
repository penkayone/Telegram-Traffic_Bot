const cron = require('node-cron')
const groups = require('./groups')

const START_DATE = new Date(Date.UTC(2025, 6, 7, 7, 0, 0))

function isFourteenthMonday(now = new Date()) {
    const currentMonday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0))
    const diffMs = currentMonday - START_DATE
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return diffDays % 14 === 0 && diffDays >= 0
}

function startScheduler(pairUsersCallback) {
    cron.schedule('0 10 * * 1', () => {
        const now = new Date()
        if (isFourteenthMonday(now)) {
            const groupList = groups.loadGroups().chats
            groupList.forEach(chatId => {
                pairUsersCallback(chatId)
            })
        }
    }, {
        timezone: 'Europe/Minsk'
    })
}

module.exports = { startScheduler }
