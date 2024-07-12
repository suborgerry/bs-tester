import { Telegraf } from 'telegraf';
import 'dotenv/config';
import { Markup } from 'telegraf';
import tester from './tester.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

let currentLink = "";

const startText = (name) => { return (name + '👋\nЩоб почати роботу натисни "Почати" на клавіатурі та додай посилання на необхідну сторінку.') };

const validateMessage = (isValidLink, ctx, url) => {
    if (isValidLink) {
        ctx.reply('🎉 Посилання валідне. Можна починати тестування.');

        markupWithDevices(devices, ctx);

        currentLink = url;
    } else {
        ctx.reply('Вибачте, виникла помилка або посилання не є валідним.\nБудь ласка перевірте посилання і зверніться до розробника.')
    }
}

const deviceRegex = /^device:\s+/i;

const devices = [
    ["device: iPhone 14 | osVersion: 16"],
    ["device: iPhone 12 | osVersion: 14"],
    ["device: iPhone 11 | osVersion: 15"],
    ["device: iPhone 15 | osVersion: 17.3"],
    ["device: iPhone 15 Pro | osVersion: 17"],
    ["device: iPhone 13 | osVersion: 15"],
    ["device: iPhone 14 Pro | osVersion: 16"],
    ["device: iPhone 15 Plus | osVersion: 17"],
    ["device: iPhone 15 Pro Max | osVersion: 17"],
    ["device: iPhone 13 Pro | osVersion: 15"],
    ["device: iPhone 13 Mini | osVersion: 15"],
    ["device: iPhone 13 Pro Max | osVersion: 15"],
    ["device: iPhone 12 Pro | osVersion: 16"],
    ["device: iPhone 12 Mini | osVersion: 16"],
    ["device: iPhone 11 Pro | osVersion: 17"],
    ["device: iPhone 11 Pro Max | osVersion: 16"],
    ["device: iPhone SE 2022 | osVersion: 15"],
    ["device: iPhone XR | osVersion: 15"],
    ["device: iPhone XS | osVersion: 15"],
    ["device: iPhone X | osVersion: 14"],
    ["device: iPhone 8 | osVersion: 13"],
    ["device: iPhone 7 | osVersion: 11"],
    ["device: iPhone SE 2020 | osVersion: 16"],
    ["device: iPhone 11 | osVersion: 14"],
    ["device: iPhone 11 Pro | osVersion: 13"],
    ["device: iPhone 12 Pro Max | osVersion: 17"],
    ["device: iPhone 14 Plus | osVersion: 16"],
    ["device: iPhone 13 Pro Max | osVersion: 16"],
    ["device: iPhone SE 2020 | osVersion: 16"],
    ["device: iPhone 11 Pro Max | osVersion: 16"],
    ["device: iPhone XS | osVersion: 14"],
    ["device: iPhone XR | osVersion: 14"],
    ["device: iPhone 8 Plus | osVersion: 14"],
    ["device: iPhone 11 Pro | osVersion: 15"],
    ["device: iPhone SE 2022 | osVersion: 15"],
    ["device: iPhone SE 2020 | osVersion: 16"],
    ["device: iPhone 7 Plus | osVersion: 11"]
];

const markupWithDevices = (devices, ctx) => {
    ctx.reply('Оберіть необхідний пристрій:', Markup
        .keyboard(devices))
}

function isValidURL(url) {
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-._~:\/?#\[\]@!$&'()*+,;=]+)+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:\/?#\[\]@!$&'()*+,;=]*)?$/;
    return regex.test(url);
}

async function checkURL(url) {
    if (!isValidURL(url)) {
        return false;
    }

    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

const checkLink = (url, ctx) => {
    checkURL(url, ctx).then(isValid => {
        validateMessage(isValid, ctx, url);
    });

}

bot.hears(deviceRegex, (ctx) => {
    const message = ctx.message.text;
    tester(message, ctx, currentLink);

    ctx.reply('Будь ласка очікуйте на сповіщення про закінчення аналізу')
});

bot.start((ctx) => {
    const helloName = ctx.from.first_name ? `Привіт, ${ctx.from.first_name}!` : "Привіт!";

    ctx.reply(startText(helloName), Markup
        .keyboard([
            ['Почати']
        ]))
});

bot.hears('Почати', async (ctx) => {
    ctx.reply("Введіть посилання")
});

bot.on('text', (ctx) => {
    if (!isValidURL(ctx.message.text)) return;

    checkLink(ctx.message.text, ctx);

})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))