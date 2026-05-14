import youtubedl from 'youtube-dl-exec'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// ─── TRIM HELPER ─────────────────────────────────────────────────────────────

async function trimFile(inputPath, outputPath, maxSeconds) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(0)
            .setDuration(maxSeconds)
            .output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run()
    })
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function downloadFile(url, dest) {
    const res = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000
    })
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest)
        res.data.pipe(file)
        file.on('finish', resolve)
        file.on('error', reject)
    })
}

function getTempPath(name) {
    return path.join('/tmp', name)
}

// ─── YOUTUBE ─────────────────────────────────────────────────────────────────

async function searchYoutube(query) {
    const res = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`)
    const match = res.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)
    if (!match) throw new Error('No results found')
    return `https://www.youtube.com/watch?v=${match[1]}`
}

async function getYoutubeInfo(url) {
    const info = await youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
    })
    return info
}

// ─── TIKTOK ──────────────────────────────────────────────────────────────────

async function downloadTiktok(url) {
    const cleanUrl = url.split('?')[0]
    const res = await axios.post('https://www.tikwm.com/api/', {
        url: cleanUrl,
        hd: 0
    }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000
    })
    if (!res.data?.data?.play) throw new Error('Could not fetch TikTok video')
    return {
        videoUrl: res.data.data.play,
        title: res.data.data.title || 'TikTok Video',
        author: res.data.data.author?.nickname || 'Unknown',
        size: res.data.data.size || 0
    }
}

// ─── INSTAGRAM ───────────────────────────────────────────────────────────────

async function downloadInstagram(url) {
    const res = await axios.get(`https://instadownloader.co/api/?url=${encodeURIComponent(url)}`)
    if (!res.data?.url) throw new Error('Could not fetch Instagram media')
    return res.data.url
}

// ─── SEND AUDIO HELPER ───────────────────────────────────────────────────────

async function sendAudio(sock, from, msg, filePath, title) {
    const fileSize = fs.statSync(filePath).size
    if (fileSize > 60000000) {
        await sock.sendMessage(from, { text: '✂️ Audio too large, auto-trimming to 10 mins...' }, { quoted: msg })
        const trimmed = getTempPath(`trimmed_${Date.now()}.mp3`)
        await trimFile(filePath, trimmed, 600)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        await sock.sendMessage(from, {
            audio: fs.readFileSync(trimmed),
            mimetype: 'audio/mp4',
            fileName: `${title}.mp3`
        }, { quoted: msg })
        fs.unlinkSync(trimmed)
    } else {
        await sock.sendMessage(from, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mp4',
            fileName: `${title}.mp3`
        }, { quoted: msg })
        fs.unlinkSync(filePath)
    }
}

// ─── SEND VIDEO HELPER ───────────────────────────────────────────────────────

async function sendVideo(sock, from, msg, filePath, title) {
    const fileSize = fs.statSync(filePath).size
    if (fileSize > 80000000) {
        await sock.sendMessage(from, { text: '✂️ Video too large, auto-trimming to 5 mins...' }, { quoted: msg })
        const trimmed = getTempPath(`trimmed_${Date.now()}.mp4`)
        await trimFile(filePath, trimmed, 300)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        await sock.sendMessage(from, {
            video: fs.readFileSync(trimmed),
            mimetype: 'video/mp4',
            caption: `🎬 *${title}* ✂️ (auto-trimmed to 5 mins)`
        }, { quoted: msg })
        fs.unlinkSync(trimmed)
    } else {
        await sock.sendMessage(from, {
            video: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            caption: `🎬 *${title}*`
        }, { quoted: msg })
        fs.unlinkSync(filePath)
    }
}
// ─── COMMANDS ─────────────────────────────────────────────────────────────────

export const mediaCommands = {

    song: async ({ sock, from, msg, args }) => {
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .song <title>\nExample: .song Stressed Out' }, { quoted: msg })
        const query = args.join(' ')
        await sock.sendMessage(from, { text: `🎵 Searching: *${query}*...` }, { quoted: msg })
        try {
            const url = await searchYoutube(query)
            const info = await getYoutubeInfo(url)
            const title = info.title
            const duration = info.duration

           

            await sock.sendMessage(from, { text: `⬇️ Downloading: *${title}*` }, { quoted: msg })

            const dest = getTempPath(`song_${Date.now()}.mp3`)
            await youtubedl(url, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: 0,
                output: dest,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
            })

            const finalDest = fs.existsSync(dest) ? dest : dest + '.mp3'
            await sendAudio(sock, from, msg, finalDest, title)
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    play: async ({ sock, from, msg, args }) => {
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .play <title>' }, { quoted: msg })
        const query = args.join(' ')
        await sock.sendMessage(from, { text: `🎵 Searching: *${query}*...` }, { quoted: msg })
        try {
            const url = await searchYoutube(query)
            const info = await getYoutubeInfo(url)
            const title = info.title
            const duration = info.duration


            await sock.sendMessage(from, { text: `⬇️ Downloading: *${title}*` }, { quoted: msg })

            const dest = getTempPath(`song_${Date.now()}.mp3`)
            await youtubedl(url, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: 0,
                output: dest,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
            })

            const finalDest = fs.existsSync(dest) ? dest : dest + '.mp3'
            await sendAudio(sock, from, msg, finalDest, title)
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

  yt: async ({ sock, from, msg, args }) => {
    if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .yt <title or url>\nExample: .yt Blinding Lights' }, { quoted: msg })
    const query = args.join(' ')
    await sock.sendMessage(from, { text: `🎬 Searching: *${query}*...` }, { quoted: msg })
    try {
        const url = query.startsWith('http') ? query : await searchYoutube(query)
        const info = await getYoutubeInfo(url)
        const title = info.title

        await sock.sendMessage(from, { text: `⬇️ Downloading: *${title}*` }, { quoted: msg })

        const dest = getTempPath(`yt_${Date.now()}.mp4`)
        await youtubedl(url, {
            format: 'best[height<=480]',
            output: dest,
            noCheckCertificates: true,
            noWarnings: true,
        })

        const finalDest = fs.existsSync(dest) ? dest : dest + '.mp4'
        await sendVideo(sock, from, msg, finalDest, title)
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
    }
},

    tt: async ({ sock, from, msg, args }) => {
    if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .tt <url>' }, { quoted: msg })
    const url = args[0]
    await sock.sendMessage(from, { text: '⬇️ Downloading TikTok...' }, { quoted: msg })
    try {
        const { videoUrl, title, author } = await downloadTiktok(url)
        const dest = getTempPath(`tiktok_${Date.now()}.mp4`)
        await downloadFile(videoUrl, dest)
        await sendVideo(sock, from, msg, dest, title)
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
    }
},

tiktok: async ({ sock, from, msg, args }) => {
    if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .tiktok <url>' }, { quoted: msg })
    const url = args[0]
    await sock.sendMessage(from, { text: '⬇️ Downloading TikTok...' }, { quoted: msg })
    try {
        const { videoUrl, title, author } = await downloadTiktok(url)
        const dest = getTempPath(`tiktok_${Date.now()}.mp4`)
        await downloadFile(videoUrl, dest)
        await sendVideo(sock, from, msg, dest, title)
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
    }
},

    ig: async ({ sock, from, msg, args }) => {
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .ig <url>' }, { quoted: msg })
        const url = args[0]
        await sock.sendMessage(from, { text: '⬇️ Downloading Instagram...' }, { quoted: msg })
        try {
            const mediaUrl = await downloadInstagram(url)
            const dest = getTempPath(`ig_${Date.now()}.mp4`)
            await downloadFile(mediaUrl, dest)
            await sendVideo(sock, from, msg, dest, 'Instagram')
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    sticker: async ({ sock, from, msg }) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        if (!quoted) return sock.sendMessage(from, { text: '❌ Reply to an image or video to make a sticker!' }, { quoted: msg })
        await sock.sendMessage(from, { text: '🎨 Making sticker...' }, { quoted: msg })
        try {
            const imageMsg = quoted.imageMessage || quoted.videoMessage
            if (!imageMsg) return sock.sendMessage(from, { text: '❌ Reply to an image or video!' }, { quoted: msg })
            const buffer = await sock.downloadMediaMessage({ message: quoted })
            await sock.sendMessage(from, { sticker: buffer }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    trim: async ({ sock, from, msg, args }) => {
        if (args.length < 2) return sock.sendMessage(from, {
            text: '❌ Usage: .trim <start> <end>\nExample: .trim 0 60\n(Reply to an audio or video)'
        }, { quoted: msg })

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        if (!quoted) return sock.sendMessage(from, { text: '❌ Reply to an audio or video message!' }, { quoted: msg })

        const start = parseInt(args[0])
        const end = parseInt(args[1])

        if (isNaN(start) || isNaN(end)) return sock.sendMessage(from, { text: '❌ Use numbers in seconds!' }, { quoted: msg })
        if (end <= start) return sock.sendMessage(from, { text: '❌ End must be greater than start!' }, { quoted: msg })
        if (end - start > 600) return sock.sendMessage(from, { text: '❌ Max trim length is 10 minutes!' }, { quoted: msg })

        await sock.sendMessage(from, { text: `✂️ Trimming from ${start}s to ${end}s...` }, { quoted: msg })

        try {
            const isVideo = !!quoted.videoMessage
            const isAudio = !!quoted.audioMessage
            if (!isVideo && !isAudio) return sock.sendMessage(from, { text: '❌ Reply to an audio or video!' }, { quoted: msg })

            const ext = isVideo ? 'mp4' : 'mp3'
            const inputDest = getTempPath(`input_${Date.now()}.${ext}`)
            const outputDest = getTempPath(`output_${Date.now()}.${ext}`)

            const buffer = await sock.downloadMediaMessage({ message: quoted })
            fs.writeFileSync(inputDest, buffer)

            await new Promise((resolve, reject) => {
                ffmpeg(inputDest)
                    .setStartTime(start)
                    .setDuration(end - start)
                    .output(outputDest)
                    .on('end', resolve)
                    .on('error', reject)
                    .run()
            })

            if (isVideo) {
                await sock.sendMessage(from, {
                    video: fs.readFileSync(outputDest),
                    mimetype: 'video/mp4',
                    caption: `✂️ Trimmed: ${start}s - ${end}s`
                }, { quoted: msg })
            } else {
                await sock.sendMessage(from, {
                    audio: fs.readFileSync(outputDest),
                    mimetype: 'audio/mp4',
                    fileName: 'trimmed.mp3'
                }, { quoted: msg })
            }

            fs.unlinkSync(inputDest)
            fs.unlinkSync(outputDest)
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    lyrics: async ({ sock, from, msg, args }) => {
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .lyrics <artist> <song>\nExample: .lyrics Oliver Neria' }, { quoted: msg })
        const query = args.join(' ')
        const parts = query.split(' ')
        const artist = parts[0]
        const title = parts.slice(1).join(' ') || query
        await sock.sendMessage(from, { text: `🎵 Searching lyrics for: *${query}*...` }, { quoted: msg })
        try {
            const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
            const lyrics = res.data.lyrics?.slice(0, 3000) || 'Lyrics not found'
            await sock.sendMessage(from, { text: `🎵 *${query}*\n\n${lyrics}` }, { quoted: msg })
        } catch {
            await sock.sendMessage(from, { text: '❌ Lyrics not found for that song.' }, { quoted: msg })
        }
    },

    shazam: async ({ sock, from, msg }) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        if (!quoted) return sock.sendMessage(from, { text: '❌ Reply to an audio or video message!' }, { quoted: msg })
        await sock.sendMessage(from, { text: '❌ Shazam requires a paid API. Try https://shazam.com manually!' }, { quoted: msg })
    }

}