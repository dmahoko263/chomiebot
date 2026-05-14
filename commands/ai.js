import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()

const OPENROUTER_KEY = process.env.OPENROUTER_KEY
const AI_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'
const AI_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'

const MODELS = [
    'inclusionai/ring-2.6-1t:free',
    'baidu/cobuddy:free',
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'poolside/laguna-xs.2:free',
    'poolside/laguna-m.1:free',
    'deepseek/deepseek-v4-flash:free',
    'baidu/qianfan-ocr-fast:free',
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
    'arcee-ai/trinity-large-thinking:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'minimax/minimax-m2.5:free',
    'liquid/lfm-2.5-1.2b-thinking:free',
    'liquid/lfm-2.5-1.2b-instruct:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'openai/gpt-oss-120b:free',
    'openai/gpt-oss-20b:free',
    'z-ai/glm-4.5-air:free',
    'qwen/qwen3-coder:free',
    'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'nousresearch/hermes-3-llama-3.1-405b:free'

]

const lastUsed = {}
const COOLDOWN_MS = 10000

function checkCooldown(userId) {
    const now = Date.now()
    if (lastUsed[userId] && now - lastUsed[userId] < COOLDOWN_MS) {
        return Math.ceil((COOLDOWN_MS - (now - lastUsed[userId])) / 1000)
    }
    lastUsed[userId] = now
    return 0
}

async function askAI(prompt, systemPrompt = 'You are a helpful assistant.') {
    for (const model of MODELS) {
        try {
            const res = await axios.post(AI_BASE_URL, {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/mybot',
                    'X-Title': 'MyWhatsAppBot'
                }
            })
            console.log(`✅ Used model: ${model}`)
            return res.data.choices[0].message.content
        } catch (err) {
            const status = err.response?.status
            console.log(`❌ Model ${model} failed with ${status}, trying next...`)
            if (status !== 429 && status !== 503) throw err
        }
    }
    throw new Error('All models are rate limited. Try again in a minute.')
}

export const aiCommands = {

    ai: async ({ sock, from, msg, args, sender }) => {
        const wait = checkCooldown(sender)
        if (wait) return sock.sendMessage(from, { text: `⏳ Wait ${wait}s before using AI again.` }, { quoted: msg })
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .ai <question>' }, { quoted: msg })
        const prompt = args.join(' ')
        await sock.sendMessage(from, { text: '🤖 Thinking...' }, { quoted: msg })
        try {
            const reply = await askAI(prompt)
            await sock.sendMessage(from, { text: `🤖 *AI:*\n\n${reply}` }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    claude: async ({ sock, from, msg, args, sender }) => {
        const wait = checkCooldown(sender)
        if (wait) return sock.sendMessage(from, { text: `⏳ Wait ${wait}s before using AI again.` }, { quoted: msg })
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .claude <question>' }, { quoted: msg })
        const prompt = args.join(' ')
        await sock.sendMessage(from, { text: '🤖 Thinking...' }, { quoted: msg })
        try {
            const reply = await askAI(prompt, 'You are Claude, a helpful AI assistant.')
            await sock.sendMessage(from, { text: `🤖 *Claude:*\n\n${reply}` }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    gpt: async ({ sock, from, msg, args, sender }) => {
        const wait = checkCooldown(sender)
        if (wait) return sock.sendMessage(from, { text: `⏳ Wait ${wait}s before using AI again.` }, { quoted: msg })
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .gpt <question>' }, { quoted: msg })
        const prompt = args.join(' ')
        await sock.sendMessage(from, { text: '🤖 Thinking...' }, { quoted: msg })
        try {
            const reply = await askAI(prompt, 'You are GPT, a helpful AI assistant.')
            await sock.sendMessage(from, { text: `🤖 *GPT:*\n\n${reply}` }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    gemini: async ({ sock, from, msg, args, sender }) => {
        const wait = checkCooldown(sender)
        if (wait) return sock.sendMessage(from, { text: `⏳ Wait ${wait}s before using AI again.` }, { quoted: msg })
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .gemini <question>' }, { quoted: msg })
        const prompt = args.join(' ')
        await sock.sendMessage(from, { text: '🤖 Thinking...' }, { quoted: msg })
        try {
            const reply = await askAI(prompt, 'You are Gemini, a helpful AI assistant by Google.')
            await sock.sendMessage(from, { text: `🤖 *Gemini:*\n\n${reply}` }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    deepseek: async ({ sock, from, msg, args, sender }) => {
        const wait = checkCooldown(sender)
        if (wait) return sock.sendMessage(from, { text: `⏳ Wait ${wait}s before using AI again.` }, { quoted: msg })
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .deepseek <question>' }, { quoted: msg })
        const prompt = args.join(' ')
        await sock.sendMessage(from, { text: '🤖 Thinking...' }, { quoted: msg })
        try {
            const reply = await askAI(prompt, 'You are DeepSeek, a helpful AI assistant.')
            await sock.sendMessage(from, { text: `🤖 *DeepSeek:*\n\n${reply}` }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    joke: async ({ sock, from, msg }) => {
        try {
            const res = await axios.get('https://official-joke-api.appspot.com/random_joke')
            const { setup, punchline } = res.data
            await sock.sendMessage(from, { text: `😂 *Joke:*\n\n${setup}\n\n${punchline}` }, { quoted: msg })
        } catch {
            await sock.sendMessage(from, { text: '❌ Could not fetch joke.' }, { quoted: msg })
        }
    },

    fact: async ({ sock, from, msg }) => {
        try {
            const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
            await sock.sendMessage(from, { text: `🧠 *Random Fact:*\n\n${res.data.text}` }, { quoted: msg })
        } catch {
            await sock.sendMessage(from, { text: '❌ Could not fetch fact.' }, { quoted: msg })
        }
    },

    weather: async ({ sock, from, msg, args }) => {
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .weather <city>' }, { quoted: msg })
        const city = args.join(' ')
        try {
            const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`)
            await sock.sendMessage(from, { text: `🌤️ ${res.data}` }, { quoted: msg })
        } catch {
            await sock.sendMessage(from, { text: '❌ Could not fetch weather.' }, { quoted: msg })
        }
    },

    translate: async ({ sock, from, msg, args, sender }) => {
        const wait = checkCooldown(sender)
        if (wait) return sock.sendMessage(from, { text: `⏳ Wait ${wait}s before using AI again.` }, { quoted: msg })
        if (args.length < 2) return sock.sendMessage(from, { text: '❌ Usage: .translate <lang> <text>\nExample: .translate spanish hello' }, { quoted: msg })
        const lang = args[0]
        const text = args.slice(1).join(' ')
        await sock.sendMessage(from, { text: '🌐 Translating...' }, { quoted: msg })
        try {
            const reply = await askAI(`Translate this to ${lang}. Reply with only the translation: "${text}"`)
            await sock.sendMessage(from, { text: `🌐 *Translation (${lang}):*\n\n${reply}` }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    define: async ({ sock, from, msg, args, sender }) => {
        const wait = checkCooldown(sender)
        if (wait) return sock.sendMessage(from, { text: `⏳ Wait ${wait}s before using AI again.` }, { quoted: msg })
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .define <word>' }, { quoted: msg })
        const word = args.join(' ')
        await sock.sendMessage(from, { text: '📖 Looking up...' }, { quoted: msg })
        try {
            const reply = await askAI(`Define "${word}" clearly and concisely with an example sentence.`)
            await sock.sendMessage(from, { text: `📖 *${word}:*\n\n${reply}` }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    },

    imagine: async ({ sock, from, msg, args, sender }) => {
        const wait = checkCooldown(sender)
        if (wait) return sock.sendMessage(from, { text: `⏳ Wait ${wait}s before using AI again.` }, { quoted: msg })
        if (!args.length) return sock.sendMessage(from, { text: '❌ Usage: .imagine <description>' }, { quoted: msg })
        const prompt = args.join(' ')
        await sock.sendMessage(from, { text: '🎨 Generating...' }, { quoted: msg })
        try {
            const reply = await askAI(`Describe in vivid detail what an AI image of this would look like: "${prompt}". Be creative and descriptive.`)
            await sock.sendMessage(from, { text: `🎨 *Image concept:* ${prompt}\n\n${reply}` }, { quoted: msg })
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg })
        }
    }

}