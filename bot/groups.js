const fs = require('fs')
const path = require('path')

const GROUPS_PATH = path.join(__dirname, '../data/groups.json')

function loadGroups() {
    if (!fs.existsSync(GROUPS_PATH)) {
        fs.writeFileSync(GROUPS_PATH, JSON.stringify({ chats: [] }, null, 2))
    }
    return JSON.parse(fs.readFileSync(GROUPS_PATH))
}

function saveGroups(data) {
    fs.writeFileSync(GROUPS_PATH, JSON.stringify(data, null, 2))
}

function addGroup(chatId) {
    const data = loadGroups()
    if (!data.chats.includes(chatId)) {
        data.chats.push(chatId)
        saveGroups(data)
    }
}

function removeGroup(chatId) {
    const data = loadGroups()
    const idx = data.chats.indexOf(chatId)
    if (idx !== -1) {
        data.chats.splice(idx, 1)
        saveGroups(data)
    }
}

module.exports = {
    loadGroups,
    addGroup,
    removeGroup,
}
