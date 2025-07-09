const fs = require('fs')
const path = require('path')

const USERS_PATH = path.join(__dirname, '../data/users.json')

function getActiveUsers() {
    const data = loadUsers()
    return data.users.filter(u => !data.excluded.includes(u.id))
}

function loadUsers() {
    if (!fs.existsSync(USERS_PATH)) {
        fs.writeFileSync(USERS_PATH, JSON.stringify({ users: [], excluded: [] }, null, 2))
    }
    return JSON.parse(fs.readFileSync(USERS_PATH))
}

function saveUsers(data) {
    fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2))
}

function addUser(user) {
    const data = loadUsers()
    if (!data.users.find(u => u.id === user.id)) {
        data.users.push({ id: user.id, username: user.username })
        saveUsers(data)
    }
}

function clearUsers() {
    const data = loadUsers()
    data.users = []
    saveUsers(data)
}

function removeUser(userId) {
    const data = loadUsers()
    data.users = data.users.filter(u => u.id !== userId)
    data.excluded = data.excluded.filter(id => id !== userId)
    saveUsers(data)
}

function excludeUserByUsername(username) {
    const data = loadUsers()
    const user = data.users.find(u => u.username === username)
    if (user && !data.excluded.includes(user.id)) {
        data.excluded.push(user.id)
        saveUsers(data)
        return true
    }
    return false
}

function includeUserByUsername(username) {
    const data = loadUsers()
    const user = data.users.find(u => u.username === username)
    if (user) {
        data.excluded = data.excluded.filter(id => id !== user.id)
        saveUsers(data)
        return true
    }
    return false
}

module.exports = {
    loadUsers,
    saveUsers,
    getActiveUsers,
    addUser,
    clearUsers,
    removeUser,
    excludeUserByUsername,
    includeUserByUsername,
}
