import { getBotNumber } from '../handler.js'

async function isBotAdmin(sock, groupJid) {
    const meta = await sock.groupMetadata(groupJid)
    // Check if ANY admin lid matches bot's linked lid
    const admins = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    // Bot is admin if there's at least one admin we can't identify (lid format)
    // We verify by checking sock.user.lid if available
    const botLid = sock.user?.lid?.replace(/:\d+@/, '@') || ''
    const botJid = sock.user?.id?.replace(/:\d+@/, '@') || ''
    
    return meta.participants.some(p => {
        const pid = p.id.replace(/:\d+@/, '@')
        return (pid === botLid || pid === botJid) && (p.admin === 'admin' || p.admin === 'superadmin')
    })
}

async function getSenderAdmin(sock, groupJid, sender) {
    const meta = await sock.groupMetadata(groupJid)
    const senderClean = sender.replace(/:\d+@/, '@')
    return meta.participants.some(p => {
        const pid = p.id.replace(/:\d+@/, '@')
        return pid === senderClean && (p.admin === 'admin' || p.admin === 'superadmin')
    })
}
export const adminCommands = {

    ping: async ({ sock, from, msg }) => {
        await sock.sendMessage(from, { text: '🏓 Pong!' }, { quoted: msg })
    },

    hello: async ({ sock, from, msg, sender }) => {
        await sock.sendMessage(from, { text: `👋 Hello @${sender.split('@')[0]}!`, mentions: [sender] }, { quoted: msg })
    },

    tagall: async ({ sock, from, msg, isGroup }) => {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

        const meta = await sock.groupMetadata(from)
        const members = meta.participants.map(p => p.id)
        const mentions = members.map(m => `@${m.split('@')[0]}`).join(' ')

        await sock.sendMessage(from, {
            text: `📢 *Tagging Everyone:*\n\n${mentions}`,
            mentions: members
        }, { quoted: msg })
    },

    kick: async ({ sock, from, msg, isGroup, sender }) => {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

        const isAdmin = await getSenderAdmin(sock, from, sender)
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

        const botIsAdmin = await isBotAdmin(sock, from)
        if (!botIsAdmin) return sock.sendMessage(from, { text: '❌ Make me admin first!' }, { quoted: msg })

        const target = msg.message?.extendedTextMessage?.contextInfo?.participant
        if (!target) return sock.sendMessage(from, { text: '❌ Reply to a message to kick someone!' }, { quoted: msg })

        await sock.groupParticipantsUpdate(from, [target], 'remove')
        await sock.sendMessage(from, { text: `✅ Kicked @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg })
    },

    promote: async ({ sock, from, msg, isGroup, sender }) => {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

        const isAdmin = await getSenderAdmin(sock, from, sender)
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

        const botIsAdmin = await isBotAdmin(sock, from)
        if (!botIsAdmin) return sock.sendMessage(from, { text: '❌ Make me admin first!' }, { quoted: msg })

        const target = msg.message?.extendedTextMessage?.contextInfo?.participant
        if (!target) return sock.sendMessage(from, { text: '❌ Reply to a message to promote someone!' }, { quoted: msg })

        await sock.groupParticipantsUpdate(from, [target], 'promote')
        await sock.sendMessage(from, { text: `⬆️ Promoted @${target.split('@')[0]} to admin!`, mentions: [target] }, { quoted: msg })
    },

    demote: async ({ sock, from, msg, isGroup, sender }) => {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

        const isAdmin = await getSenderAdmin(sock, from, sender)
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

        const botIsAdmin = await isBotAdmin(sock, from)
        if (!botIsAdmin) return sock.sendMessage(from, { text: '❌ Make me admin first!' }, { quoted: msg })

        const target = msg.message?.extendedTextMessage?.contextInfo?.participant
        if (!target) return sock.sendMessage(from, { text: '❌ Reply to a message to demote someone!' }, { quoted: msg })

        await sock.groupParticipantsUpdate(from, [target], 'demote')
        await sock.sendMessage(from, { text: `⬇️ Demoted @${target.split('@')[0]} from admin!`, mentions: [target] }, { quoted: msg })
    },

    mute: async ({ sock, from, msg, isGroup, sender }) => {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

        const isAdmin = await getSenderAdmin(sock, from, sender)
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

        await sock.groupSettingUpdate(from, 'announcement')
        await sock.sendMessage(from, { text: '🔇 Group muted! Only admins can send messages.' }, { quoted: msg })
    },

    unmute: async ({ sock, from, msg, isGroup, sender }) => {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

        const isAdmin = await getSenderAdmin(sock, from, sender)
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

        await sock.groupSettingUpdate(from, 'not_announcement')
        await sock.sendMessage(from, { text: '🔊 Group unmuted! Everyone can send messages.' }, { quoted: msg })
    },

    warn: async ({ sock, from, msg, isGroup, sender }) => {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

        const isAdmin = await getSenderAdmin(sock, from, sender)
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

        const target = msg.message?.extendedTextMessage?.contextInfo?.participant
        if (!target) return sock.sendMessage(from, { text: '❌ Reply to a message to warn someone!' }, { quoted: msg })

        await sock.sendMessage(from, {
            text: `⚠️ *WARNING* ⚠️\n@${target.split('@')[0]} has been warned by an admin!\nPlease follow the group rules.`,
            mentions: [target]
        }, { quoted: msg })
    },
    debug: async ({ sock, from, msg, isGroup, sender }) => {
    if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })
    
    const meta = await sock.groupMetadata(from)
    const botRaw = sock.user?.id
    const botJid = botRaw?.replace(/:\d+@/, '@')
    
    const participantList = meta.participants.map(p => 
        `${p.id} | admin: ${p.admin}`
    ).join('\n')
const botLid = sock.user?.lid
await sock.sendMessage(from, { 
    text: `🤖 Bot LID: ${botLid}\n🤖 Bot JID: ${sock.user?.id}` 
}, { quoted: msg })
    await sock.sendMessage(from, { 
        text: `🤖 Bot raw ID: ${botRaw}\n🤖 Bot JID: ${botJid}\n\n👥 Participants:\n${participantList}` 
    }, { quoted: msg })

},
add: async ({ sock, from, msg, isGroup, sender, args }) => {
    if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

    const isAdmin = await getSenderAdmin(sock, from, sender)
    if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

    const botIsAdmin = await isBotAdmin(sock, from)
    if (!botIsAdmin) return sock.sendMessage(from, { text: '❌ Make me admin first!' }, { quoted: msg })

    if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .add <number>\nExample: .add 263771234567' }, { quoted: msg })

    const number = args[0].replace(/[^0-9]/g, '')
    const jid = `${number}@s.whatsapp.net`

    try {
        await sock.groupParticipantsUpdate(from, [jid], 'add')
        await sock.sendMessage(from, { text: `✅ Added @${number} to the group!`, mentions: [jid] }, { quoted: msg })
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ Could not add ${number}. They may have privacy settings blocking this.` }, { quoted: msg })
    }
},
remove: async ({ sock, from, msg, isGroup, sender, args }) => {
    if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

    const isAdmin = await getSenderAdmin(sock, from, sender)
    if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

    const botIsAdmin = await isBotAdmin(sock, from)
    if (!botIsAdmin) return sock.sendMessage(from, { text: '❌ Make me admin first!' }, { quoted: msg })

    if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .remove <number>\nExample: .remove 263771234567' }, { quoted: msg })

    const number = args[0].replace(/[^0-9]/g, '')
    const jid = `${number}@s.whatsapp.net`

    try {
        await sock.groupParticipantsUpdate(from, [jid], 'remove')
        await sock.sendMessage(from, { 
            text: `✅ Removed @${number} from the group!`, 
            mentions: [jid] 
        }, { quoted: msg })
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ Could not remove ${number}. They may not be in the group.` }, { quoted: msg })
    }
},
delete: async ({ sock, from, msg, isGroup, sender }) => {
    const isAdmin = await getSenderAdmin(sock, from, sender)
    if (!isAdmin) return sock.sendMessage(from, { text: '❌ Admins only!' }, { quoted: msg })

    const quoted = msg.message?.extendedTextMessage?.contextInfo
    if (!quoted) return sock.sendMessage(from, { text: '❌ Reply to the message you want to delete!' }, { quoted: msg })

    try {
        const key = {
            remoteJid: from,
            fromMe: false,
            id: quoted.stanzaId,
            participant: quoted.participant
        }
        await sock.sendMessage(from, { delete: key })
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ Could not delete message: ${err.message}` }, { quoted: msg })
    }
},
menu: async ({ sock, from, msg }) => {
    const text = `
╔═══════════════════════╗
║   🤖 *CHOMIE BOT*     ║
╚═══════════════════════╝

📂 *ADMIN*
├ .kick — Kick a member
├ .add — Add a member
├ .remove — Remove by number
├ .promote — Make admin
├ .demote — Remove admin
├ .mute — Lock group
├ .unmute — Open group
├ .warn — Warn a member
├ .tagall — Tag everyone
└ .delete — Delete message

🤖 *AI*
├ .ai — Chat with AI
├ .claude — Claude AI
├ .gpt — GPT AI
├ .gemini — Gemini AI
├ .deepseek — DeepSeek AI
├ .translate — Translate text
├ .define — Define a word
├ .joke — Random joke
├ .fact — Random fact
└ .weather — Weather info

🎵 *MEDIA*
├ .song — Download audio
├ .play — Play a song
├ .yt — YouTube video
├ .tiktok — TikTok video
├ .tt — TikTok (short)
├ .ig — Instagram video
├ .sticker — Make sticker
├ .trim — Trim audio/video
└ .lyrics — Song lyrics

🎓 *SCHOOL*
├ .exams — Full timetable
├ .nextexam — Next exam
├ .today — Today's exam
└ .countdown — Countdowns

🎮 *GAMES*
├ .tictactoe — Tic Tac Toe
├ .trivia — Trivia question
└ .ship — Ship two people

📊 *STATS*
└ .stats — Group activity

╔═══════════════════════╗
║  Prefix: .  | 24/7 🟢 ║
╚═══════════════════════╝`

    await sock.sendMessage(from, { text }, { quoted: msg })
},
stats: async ({ sock, from, msg, isGroup }) => {
    if (!isGroup) return sock.sendMessage(from, { text: '❌ Groups only!' }, { quoted: msg })

    const meta = await sock.groupMetadata(from)
    const totalMembers = meta.participants.length
    const admins = meta.participants.filter(p => p.admin).length

    await sock.sendMessage(from, {
        text: `📊 *GROUP STATS*\n${'─'.repeat(25)}\n\n👥 Total Members: ${totalMembers}\n👑 Admins: ${admins}\n👤 Regular: ${totalMembers - admins}\n\n📝 Group Name: ${meta.subject}\n📅 Created: ${new Date(meta.creation * 1000).toLocaleDateString()}`
    }, { quoted: msg })
},
}