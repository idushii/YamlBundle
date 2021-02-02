import * as TelegramBot from 'node-telegram-bot-api';
import * as fs from "fs";
const {exec, execSync} = require('child_process');

export const token = process.env.args?.split(',')?.[1] ?? fs.readFileSync('token', {encoding: 'utf8'});

export const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    if (msg.text == '/run') {

        const chatId = msg.chat.id;

        bot.sendMessage(chatId, `Сборка начата`);

        try {
            execSync('node cli-prognoz.js')
            bot.sendMessage(chatId, `Сборка начата`);
        } catch (e) {
            bot.sendMessage(chatId, `Сборка не удалась`);
            console.log(String.fromCharCode.apply(null, e.output[1]));
            bot.sendMessage(chatId, String.fromCharCode.apply(null, e.output[1]));
        }
    }
});
