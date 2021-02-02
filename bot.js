"use strict";
var _a, _b, _c;
exports.__esModule = true;
exports.bot = exports.token = void 0;
var TelegramBot = require("node-telegram-bot-api");
var fs = require("fs");
var _d = require('child_process'), exec = _d.exec, execSync = _d.execSync;
exports.token = (_c = (_b = (_a = process.env.args) === null || _a === void 0 ? void 0 : _a.split(',')) === null || _b === void 0 ? void 0 : _b[1]) !== null && _c !== void 0 ? _c : fs.readFileSync('token', { encoding: 'utf8' });
exports.bot = new TelegramBot(exports.token, { polling: true });
exports.bot.on('message', function (msg) {
    if (msg.text == '/run') {
        var chatId = msg.chat.id;
        exports.bot.sendMessage(chatId, "\u0421\u0431\u043E\u0440\u043A\u0430 \u043D\u0430\u0447\u0430\u0442\u0430");
        try {
            execSync('node cli-prognoz.js');
            exports.bot.sendMessage(chatId, "\u0421\u0431\u043E\u0440\u043A\u0430 \u043D\u0430\u0447\u0430\u0442\u0430");
        }
        catch (e) {
            exports.bot.sendMessage(chatId, "\u0421\u0431\u043E\u0440\u043A\u0430 \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C");
            console.log(String.fromCharCode.apply(null, e.output[1]));
            exports.bot.sendMessage(chatId, String.fromCharCode.apply(null, e.output[1]));
        }
    }
});
