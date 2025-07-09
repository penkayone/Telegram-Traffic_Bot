const participants = require('./participants')

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

function generatePairs() {
    const users = participants.getActiveUsers()
    if (users.length === 0) return []

    const arr = users.map(u => u.username ? `@${u.username}` : `id${u.id}`)
    const shuffled = shuffleArray([...arr])
    const pairs = []

    while (shuffled.length >= 2) {
        pairs.push([shuffled.pop(), shuffled.pop()])
    }

    if (shuffled.length === 1) {
        pairs[pairs.length - 1].push(shuffled.pop())
    }

    return pairs
}

function formatPairsMessage(pairs) {
    if (!pairs.length) {
        return 'Недостаточно участников для жеребьёвки!'
    }
    let text = '☕️ Пришло время сделать кофе-паузу!\nНовые пары недели:\n\n'
    pairs.forEach(pair => {
        if (pair.length === 2) {
            text += `${pair[0]} и ${pair[1]}\n`
        } else if (pair.length === 3) {
            text += `Тройка: ${pair[0]}, ${pair[1]} и ${pair[2]}\n`
        }
    })
    return text
}

module.exports = {
    generatePairs,
    formatPairsMessage,
}
