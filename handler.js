import { adminCommands } from './commands/admin.js'
import { aiCommands } from './commands/ai.js'
import { mediaCommands } from './commands/media.js'
import { schoolCommands } from './commands/school.js'
import { gameCommands } from './commands/games.js'

const PREFIX = '.'

async function isGroupAdmin(sock, groupJid, sender) {
    try {
        const meta = await sock.groupMetadata(groupJid)
        const senderClean = sender.replace(/:\d+@/, '@')
        return meta.participants.some(p =>
            p.id.replace(/:\d+@/, '@') === senderClean &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )
    } catch {
        return false
    }
}

export function getBotNumber(sock) {
    return sock.user?.id?.replace(/:\d+/, '') + '@s.whatsapp.net'
}

export async function handleMessage(sock, msg) {
    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? msg.key.participant : msg.key.remoteJid

    const text = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text || ''

    // ─── ANTILINK ────────────────────────────────────────────────────────────
    if (isGroup && text) {
        const linkRegex = /(https?:\/\/|www\.|wa\.me|chat\.whatsapp\.com)[^\s]*/i
        const isAdmin = await isGroupAdmin(sock, from, sender)

        if (linkRegex.test(text) && !isAdmin) {
            try {
                await sock.sendMessage(from, { delete: msg.key })
                await sock.sendMessage(from, {
                    text: `🚫 @${sender.split('@')[0]} links are not allowed in this group!`,
                    mentions: [sender]
                })
            } catch (err) {
                console.error('Antilink error:', err.message)
            }
            return
        }
    }

    if (!text.startsWith(PREFIX)) return

    const args = text.slice(PREFIX.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    const ctx = { sock, msg, from, sender, args, isGroup, text }

    console.log(`📩 Command: ${command} | From: ${sender}`)

    if (adminCommands[command]) return await adminCommands[command](ctx)
    if (aiCommands[command]) return await aiCommands[command](ctx)
    if (mediaCommands[command]) return await mediaCommands[command](ctx)
    if (schoolCommands[command]) return await schoolCommands[command](ctx)
    if (gameCommands[command]) return await gameCommands[command](ctx)

    await sock.sendMessage(from, { text: `❌ Unknown command: .${command}` }, { quoted: msg })
}