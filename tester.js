// const { Builder, By, until } = require('selenium-webdriver');
// const fs = require('fs');

import { Builder, By, until } from 'selenium-webdriver';
import fs from 'fs';

const tester = (device, ctx, inputUrl) => {

    const createDeviceObject = (device) => {
        const splitMod = device.split(" | ");

        const deviceType = splitMod[0].split(": ");
        const osVersion = splitMod[1].split(": ");;
        const obj = {}

        obj[deviceType[0]] = deviceType[1];
        obj[osVersion[0]] = osVersion[1];

        return obj;
    };

    const capabilities = (device, osVersion) => ({
        'bstack:options': {
            "deviceName": device,
            "realMobile": "true",
            "osVersion": osVersion,
            "userName": "creative_asAWB1",
            "accessKey": "yqp8xxUTEMBB2mGF8TcT",
        },
        "browserName": "iPhone",
        "browserVersion": "latest",
    });

    const devices = [createDeviceObject(device)];

    // const devices = [
    //     { "device": "iPhone 14", "osVersion": "16" },
    //     { "device": "iPhone 12", "osVersion": "14" },
    //     { "device": "iPhone 11", "osVersion": "15" },
    //     { "device": "iPhone 15", "osVersion": "17.3" },
    //     { "device": "iPhone 15 Pro", "osVersion": "17" },
    //     { "device": "iPhone 13", "osVersion": "15" },
    //     { "device": "iPhone 14 Pro", "osVersion": "16" },
    //     { "device": "iPhone 15 Plus", "osVersion": "17" },
    //     { "device": "iPhone 15 Pro Max", "osVersion": "17" },
    //     { "device": "iPhone 13 Pro", "osVersion": "15" },
    //     { "device": "iPhone 13 Mini", "osVersion": "15" },
    //     { "device": "iPhone 13 Pro Max", "osVersion": "15" },
    //     { "device": "iPhone 12 Pro", "osVersion": "16" },
    //     { "device": "iPhone 12 Mini", "osVersion": "16" },
    //     { "device": "iPhone 11 Pro", "osVersion": "17" },
    //     { "device": "iPhone 11 Pro Max", "osVersion": "16" },
    //     { "device": "iPhone SE 2022", "osVersion": "15" },
    //     { "device": "iPhone XR", "osVersion": "15" },
    //     { "device": "iPhone XS", "osVersion": "15" },
    //     { "device": "iPhone X", "osVersion": "14" },
    //     { "device": "iPhone 8", "osVersion": "13" },
    //     { "device": "iPhone 7", "osVersion": "11" },
    //     { "device": "iPhone SE 2020", "osVersion": "16" },
    //     { "device": "iPhone 11", "osVersion": "14" },
    //     { "device": "iPhone 11 Pro", "osVersion": "13" },
    //     { "device": "iPhone 12 Pro Max", "osVersion": "17" },
    //     { "device": "iPhone 14 Plus", "osVersion": "16" },
    //     { "device": "iPhone 13 Pro Max", "osVersion": "16" },
    //     { "device": "iPhone SE 2020", "osVersion": "16" },
    //     { "device": "iPhone 11 Pro Max", "osVersion": "16" },
    //     { "device": "iPhone XS", "osVersion": "14" },
    //     { "device": "iPhone XR", "osVersion": "14" },
    //     { "device": "iPhone 8 Plus", "osVersion": "14" },
    //     { "device": "iPhone 11 Pro", "osVersion": "15" },
    //     { "device": "iPhone SE 2022", "osVersion": "15" },
    //     { "device": "iPhone SE 2020", "osVersion": "16" },
    //     { "device": "iPhone 7 Plus", "osVersion": "11" }
    // ];

    const url = inputUrl;

    const checkLayout = async (driver, device, osVersion) => {
        await driver.get(url);
        const body = await driver.findElement(By.css('body'));
        const width = await body.getRect().then(rect => rect.width);

        const windowWidth = await driver.executeScript('return window.innerWidth;');

        if (width > windowWidth) {
            const screenshot = await driver.takeScreenshot();
            const fileName = `screenshot_${device.replace(/\s/g, '_')}_iOS_${osVersion}.png`;
            fs.writeFileSync(fileName, screenshot, 'base64');
            ctx.reply(`Скриншот сохранен как ${fileName}`);
        } else {
            ctx.reply(`Верстка на устройстве ${device} с iOS ${osVersion} в порядке.`);
        }
    };

    (async function runTests() {
        for (let { device, osVersion } of devices) {
            const driver = new Builder()
                .usingServer('https://hub-cloud.browserstack.com/wd/hub')
                .withCapabilities(capabilities(device, osVersion))
                .build();

            try {
                await checkLayout(driver, device, osVersion);
            } finally {
                await driver.quit();
            }
        }
    })();
}

export default tester;