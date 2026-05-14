import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import { handleMessage } from './handler.js'

console.log('🚀 Starting bot...')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('📱 Scan this QR code with WhatsApp:')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut

            console.log('❌ Disconnected. Code:', statusCode)

            if (shouldReconnect) {
                console.log('🔄 Reconnecting in 5 seconds...')
                setTimeout(startBot, 5000)
            } else {
                console.log('🚫 Logged out. Delete auth_info folder and restart.')
            }
        } else if (connection === 'open') {
            console.log('✅ Bot connected!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        try {
            await handleMessage(sock, msg)
        } catch (err) {
            console.error('⚠️ Error handling message:', err.message)
        }
    })
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
        const meta = await sock.groupMetadata(id)
        const groupName = meta.subject

        for (const participant of participants) {
            const number = participant.split('@')[0]

            if (action === 'add') {
                await sock.sendMessage(id, {
                    text: `👋 Welcome to *${groupName}*, @${number}! 🎉\n\nWe're glad to have you here. Please read the group rules and enjoy your stay! 😊`,
                    mentions: [participant]
                })
            }

            if (action === 'remove' || action === 'leave') {
                await sock.sendMessage(id, {
                    text: `👋 Goodbye @${number}! 😢\n\nWe'll miss you in *${groupName}*. Take care!`,
                    mentions: [participant]
                })
            }
        }
    } catch (err) {
        console.error('Welcome/goodbye error:', err.message)
    }
})
}

startBot()