const tictactoeGames = {}

function renderBoard(board) {
    const symbols = { 0: '⬜', 1: '❌', 2: '⭕' }
    return [0,1,2].map(r =>
        [0,1,2].map(c => symbols[board[r*3+c]]).join('')
    ).join('\n')
}

function checkWinner(board) {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    for (const [a,b,c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
    }
    return board.includes(0) ? null : 'draw'
}

const triviaQuestions = [
    { q: 'What is the capital of Zimbabwe?', a: 'harare' },
    { q: 'What does CPU stand for?', a: 'central processing unit' },
    { q: 'What year was the internet invented?', a: '1983' },
    { q: 'What is 15 x 15?', a: '225' },
    { q: 'What language is WhatsApp built with?', a: 'erlang' },
    { q: 'Who invented the telephone?', a: 'alexander graham bell' },
    { q: 'What is the largest planet in our solar system?', a: 'jupiter' },
    { q: 'What does AI stand for?', a: 'artificial intelligence' },
    { q: 'How many bytes in a kilobyte?', a: '1024' },
    { q: 'What is the speed of light (km/s)?', a: '299792' },
]

const activeTrivia = {}

export const gameCommands = {

    tictactoe: async ({ sock, from, msg, sender, args }) => {
        const game = tictactoeGames[from]

        if (!game) {
            tictactoeGames[from] = {
                board: Array(9).fill(0),
                players: [sender, null],
                turn: 0
            }
            await sock.sendMessage(from, {
                text: `🎮 *Tic Tac Toe started!*\n\n@${sender.split('@')[0]} is ❌\n\nWaiting for another player to join with *.tictactoe join*`,
                mentions: [sender]
            }, { quoted: msg })
            return
        }

        if (args[0] === 'join' && !game.players[1] && game.players[0] !== sender) {
            game.players[1] = sender
            await sock.sendMessage(from, {
                text: `✅ @${sender.split('@')[0]} joined as ⭕\n\n${renderBoard(game.board)}\n\n❌ @${game.players[0].split('@')[0]}'s turn!\nType *.move <1-9>* to play`,
                mentions: game.players
            }, { quoted: msg })
            return
        }

        if (args[0] === 'move' || !isNaN(args[0])) {
            if (!game.players[1]) return sock.sendMessage(from, { text: '⏳ Waiting for second player!' }, { quoted: msg })

            const playerIndex = game.players.indexOf(sender)
            if (playerIndex === -1) return sock.sendMessage(from, { text: '❌ You are not in this game!' }, { quoted: msg })
            if (game.turn !== playerIndex) return sock.sendMessage(from, { text: '⏳ Not your turn!' }, { quoted: msg })

            const pos = parseInt(args[1] || args[0]) - 1
            if (isNaN(pos) || pos < 0 || pos > 8) return sock.sendMessage(from, { text: '❌ Pick a number 1-9!' }, { quoted: msg })
            if (game.board[pos] !== 0) return sock.sendMessage(from, { text: '❌ That spot is taken!' }, { quoted: msg })

            game.board[pos] = playerIndex + 1
            const winner = checkWinner(game.board)

            if (winner === 'draw') {
                await sock.sendMessage(from, {
                    text: `${renderBoard(game.board)}\n\n🤝 *It's a draw!*`
                }, { quoted: msg })
                delete tictactoeGames[from]
            } else if (winner) {
                const winnerJid = game.players[winner - 1]
                await sock.sendMessage(from, {
                    text: `${renderBoard(game.board)}\n\n🏆 @${winnerJid.split('@')[0]} wins!`,
                    mentions: [winnerJid]
                }, { quoted: msg })
                delete tictactoeGames[from]
            } else {
                game.turn = 1 - game.turn
                const nextPlayer = game.players[game.turn]
                const symbol = game.turn === 0 ? '❌' : '⭕'
                await sock.sendMessage(from, {
                    text: `${renderBoard(game.board)}\n\n${symbol} @${nextPlayer.split('@')[0]}'s turn!\nType *.move <1-9>*`,
                    mentions: [nextPlayer]
                }, { quoted: msg })
            }
            return
        }

        if (args[0] === 'stop') {
            delete tictactoeGames[from]
            return sock.sendMessage(from, { text: '🛑 Game stopped!' }, { quoted: msg })
        }

        await sock.sendMessage(from, {
            text: '❌ Usage:\n.tictactoe — start game\n.tictactoe join — join game\n.move <1-9> — make a move\n.tictactoe stop — stop game'
        }, { quoted: msg })
    },

    move: async ({ sock, from, msg, sender, args }) => {
        const game = tictactoeGames[from]
        if (!game) return sock.sendMessage(from, { text: '❌ No game running! Start with .tictactoe' }, { quoted: msg })

        const playerIndex = game.players.indexOf(sender)
        if (playerIndex === -1) return sock.sendMessage(from, { text: '❌ You are not in this game!' }, { quoted: msg })
        if (game.turn !== playerIndex) return sock.sendMessage(from, { text: '⏳ Not your turn!' }, { quoted: msg })

        const pos = parseInt(args[0]) - 1
        if (isNaN(pos) || pos < 0 || pos > 8) return sock.sendMessage(from, { text: '❌ Pick a number 1-9!' }, { quoted: msg })
        if (game.board[pos] !== 0) return sock.sendMessage(from, { text: '❌ That spot is taken!' }, { quoted: msg })

        game.board[pos] = playerIndex + 1
        const winner = checkWinner(game.board)

        if (winner === 'draw') {
            await sock.sendMessage(from, { text: `${renderBoard(game.board)}\n\n🤝 *It's a draw!*` }, { quoted: msg })
            delete tictactoeGames[from]
        } else if (winner) {
            const winnerJid = game.players[winner - 1]
            await sock.sendMessage(from, {
                text: `${renderBoard(game.board)}\n\n🏆 @${winnerJid.split('@')[0]} wins!`,
                mentions: [winnerJid]
            }, { quoted: msg })
            delete tictactoeGames[from]
        } else {
            game.turn = 1 - game.turn
            const nextPlayer = game.players[game.turn]
            const symbol = game.turn === 0 ? '❌' : '⭕'
            await sock.sendMessage(from, {
                text: `${renderBoard(game.board)}\n\n${symbol} @${nextPlayer.split('@')[0]}'s turn!\nType *.move <1-9>*`,
                mentions: [nextPlayer]
            }, { quoted: msg })
        }
    },

    trivia: async ({ sock, from, msg, sender, args }) => {
        if (args[0] && activeTrivia[from]) {
            const answer = args.join(' ').toLowerCase().trim()
            const trivia = activeTrivia[from]

            if (answer === trivia.answer) {
                delete activeTrivia[from]
                return sock.sendMessage(from, {
                    text: `✅ *Correct!* 🎉\n@${sender.split('@')[0]} got it right!\n\nAnswer: *${trivia.answer}*`,
                    mentions: [sender]
                }, { quoted: msg })
            } else {
                return sock.sendMessage(from, {
                    text: `❌ Wrong! Try again or type *.trivia skip* to reveal answer.`
                }, { quoted: msg })
            }
        }

        if (args[0] === 'skip' && activeTrivia[from]) {
            const trivia = activeTrivia[from]
            delete activeTrivia[from]
            return sock.sendMessage(from, {
                text: `⏭️ Skipped!\n\nThe answer was: *${trivia.answer}*`
            }, { quoted: msg })
        }

        const q = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)]
        activeTrivia[from] = q

        await sock.sendMessage(from, {
            text: `🧠 *TRIVIA TIME!*\n\n❓ ${q.q}\n\nType *.trivia <your answer>* to answer!\nType *.trivia skip* to reveal answer.`
        }, { quoted: msg })
    },

    ship: async ({ sock, from, msg, args, sender }) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant

        let person1 = sender
        let person2 = mentioned[0] || quoted

        if (!person2) return sock.sendMessage(from, { text: '❌ Usage: .ship @person\nOr reply to someone\'s message' }, { quoted: msg })

        const score = Math.floor(Math.random() * 101)
        let emoji = '💔'
        let label = 'No chance!'

        if (score >= 80) { emoji = '💞'; label = 'Soulmates!' }
        else if (score >= 60) { emoji = '❤️'; label = 'Great match!' }
        else if (score >= 40) { emoji = '💛'; label = 'Could work!' }
        else if (score >= 20) { emoji = '🤍'; label = 'Maybe friends?' }

        const bar = '█'.repeat(Math.floor(score/10)) + '░'.repeat(10 - Math.floor(score/10))

        await sock.sendMessage(from, {
            text: `💘 *SHIP RESULTS*\n\n👤 @${person1.split('@')[0]}\n💕 +\n👤 @${person2.split('@')[0]}\n\n${bar} ${score}%\n\n${emoji} *${label}*`,
            mentions: [person1, person2]
        }, { quoted: msg })
    }

}