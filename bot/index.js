const TelegramBot = require('node-telegram-bot-api')
const groups = require('./groups')
const participants = require('./participants')
const pairs = require('./pairs')
const { startScheduler } = require('./scheduler')

const TOKEN = 'BOT TOKEN'
const bot = new TelegramBot(TOKEN, { polling: true })

bot.setMyCommands([
    { command: "start", description: "👋 Приветствие и справка" },
    { command: "help", description: "📕 Меню команды" }
])

function getHelpText() {
    return `
<b>📍 Как пользоваться ботом:</b>

• Добавьте бота в группу с правами администратора
• Бот автоматически собирает активных участников (кроме самого себя)
• Каждые 2 недели (в понедельник, 10:00 по Минску) бот формирует пары для кофе-паузы и публикует их в чате

<b>⚙️ Полезно знать:</b>
— Чтобы попасть в жеребьёвку, просто напишите что-нибудь в группу
— Бот не добавляет в пары других ботов и самого себя
— Можно вручную исключить или вернуть пользователя (см. инструкцию ниже)

<b>──────────────</b>

<b>Инструкция по ручному исключению и возврату:</b>
<code>/exclude @username</code> — временно исключить пользователя  
<code>/include @username</code> — вернуть пользователя  

Пример: <code>/exclude @username</code>
    `.trim()
}

function getHelpKeyboard() {
    return {
        inline_keyboard: [
            [{ text: "☕️ Pairs — вручную запустить жеребьёвку", callback_data: "show_pairs" }],
            [{ text: "👥 Status — список активных и исключённых", callback_data: "show_status" }],
            [{ text: "🧷 Help — меню команд", callback_data: "show_help" }],
            [{ text: "👋 Start — справка по возможностям", callback_data: "show_start" }]
        ]
    }
}

bot.onText(/\/start/, (msg) => {
    const text = `
👋 <b>Привет! Я — бот для автоматических кофе-жеребьёвок.</b>

☕️ Я раз в две недели случайно распределяю участников по парам (или тройкам) для кофе-пауз.

Чтобы попасть в жеребьёвку, просто напиши что-нибудь в этот чат.

<b>Полный список команд — /help</b>
    `
    bot.sendMessage(msg.chat.id, text, { parse_mode: "HTML" })
})

bot.onText(/\/(menu|help)/, (msg) => {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, getHelpText(), {
        parse_mode: "HTML",
        reply_markup: getHelpKeyboard()
    })
})

bot.onText(/\/status|\/list/, (msg) => {
    const data = participants.loadUsers()
    const active = (data.users || [])
        .filter(u => u && u.id && !data.excluded.includes(u.id))
        .map(u => u.username ? '@' + u.username : 'id' + u.id)
        .join(', ') || 'Нет активных участников'
    const excluded = (data.users || [])
        .filter(u => u && u.id && data.excluded.includes(u.id))
        .map(u => u.username ? '@' + u.username : 'id' + u.id)
        .join(', ') || 'Нет исключённых участников'

    const text = `<b>Статус жеребьёвки:</b>

<b>👥 Активные участники:</b>
${active}

<b>🚫 Исключённые:</b>
${excluded}`
    bot.sendMessage(msg.chat.id, text, { parse_mode: "HTML" })
})

bot.on('message', (msg) => {
    if ((msg.chat.type === 'supergroup' || msg.chat.type === 'group')) {
        groups.addGroup(msg.chat.id)
        if (msg.from && !msg.from.is_bot) {
            participants.addUser(msg.from)
        }
    }
})

bot.on('new_chat_members', (msg) => {
    groups.addGroup(msg.chat.id)
    msg.new_chat_members.forEach(user => {
        if (!user.is_bot) {
            participants.addUser(user)
            bot.sendMessage(msg.chat.id, `Добро пожаловать, @${user.username || user.first_name}!`)
        }
    })
})

bot.on('left_chat_member', (msg) => {
    if (msg.left_chat_member && msg.left_chat_member.is_bot) {
        groups.removeGroup(msg.chat.id)
    } else if (msg.left_chat_member && !msg.left_chat_member.is_bot) {
        participants.removeUser(msg.left_chat_member.id)
    }
})

function sendPairsToChat(chatId) {
    const all = participants.loadUsers()
    const botId = bot.botInfo && bot.botInfo.id ? bot.botInfo.id : null
    const active = (all.users || [])
        .filter(u =>
            u && u.id &&
            !all.excluded.includes(u.id) &&
            (!botId || u.id !== botId) &&
            !u.is_bot
        )

    if (active.length < 2) {
        bot.sendMessage(chatId, 'Недостаточно активных участников для жеребьёвки!')
        return
    }

    const text = pairs.formatPairsMessage(pairs.generatePairs(active))
    bot.sendMessage(chatId, text)
}

startScheduler(sendPairsToChat)

bot.onText(/\/pairs/, (msg) => {
    sendPairsToChat(msg.chat.id)
})

bot.onText(/\/exclude (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const username = match[1].replace('@', '').trim()
    if (participants.excludeUserByUsername(username)) {
        bot.sendMessage(chatId, `🚫 Пользователь @${username} временно исключён из жеребьёвки.`)
    } else {
        bot.sendMessage(chatId, `Пользователь @${username} не проявлял активность или был исключён.`)
    }
})

bot.onText(/\/include (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const username = match[1].replace('@', '').trim()
    if (participants.includeUserByUsername(username)) {
        bot.sendMessage(chatId, `🔄 Пользователь @${username} возвращён в жеребьёвку!`)
    } else {
        bot.sendMessage(chatId, `Пользователь @${username} не проявлял активность или был исключён.`)
    }
})

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id

    if (query.data === 'show_pairs') {
        sendPairsToChat(chatId)
        bot.answerCallbackQuery(query.id, { text: 'Пары сформированы!' })
    }
    if (query.data === 'show_status') {
        const data = participants.loadUsers()
        const active = (data.users || [])
            .filter(u => u && u.id && !data.excluded.includes(u.id))
            .map(u => u.username ? '@' + u.username : 'id' + u.id)
            .join(', ') || 'Нет активных участников'
        const excluded = (data.users || [])
            .filter(u => u && u.id && data.excluded.includes(u.id))
            .map(u => u.username ? '@' + u.username : 'id' + u.id)
            .join(', ') || 'Нет исключённых участников'

        const text = `<b>Статус жеребьёвки:</b>

<b>👥 Активные участники:</b>
${active}

<b>🚫 Исключённые:</b>
${excluded}`
        bot.sendMessage(chatId, text, { parse_mode: "HTML" })
        bot.answerCallbackQuery(query.id)
    }
    if (query.data === 'show_help') {
        bot.sendMessage(chatId, getHelpText(), {
            parse_mode: "HTML",
            reply_markup: getHelpKeyboard()
        })
        bot.answerCallbackQuery(query.id)
    }
    if (query.data === 'show_start') {
        const text = `
👋 <b>Привет! Я — бот для автоматических кофе-жеребьёвок.</b>

☕️ Я раз в две недели случайно распределяю участников по парам (или тройкам) для кофе-пауз.

Чтобы попасть в жеребьёвку, просто напиши что-нибудь в этот чат.

<b>Полный список команд — /help</b>
        `
        bot.sendMessage(chatId, text, { parse_mode: "HTML" })
        bot.answerCallbackQuery(query.id)
    }
})

console.log('Бот успешно запущен и готов формировать пары!')