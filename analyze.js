const { Builder, By } = require('selenium-webdriver');
const fs = require('fs');

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

const devices = [
    { "device": "iPhone 14", "osVersion": "16" },
    // ... остальные устройства
];

const url = 'https://etsy-expert.com.ua';

const checkLayout = async (driver, device, osVersion) => {
    await driver.get(url);
    const body = await driver.findElement(By.css('body'));
    const width = await body.getRect().then(rect => rect.width);

    const windowWidth = await driver.executeScript('return window.innerWidth;');

    if (width > windowWidth) {
        const screenshot = await driver.takeScreenshot();
        const fileName = `screenshot_${device.replace(/\s/g, '_')}_iOS_${osVersion}.png`;
        fs.writeFileSync(fileName, screenshot, 'base64');
        console.log(`Найдена ошибка.\nСкриншот сохранен как ${fileName}`);
    } else {
        // console.log(`Верстка на устройстве ${device} с iOS ${osVersion} в порядке.`);
    }
};

const getCSSContent = async (url) => {
    const response = await fetch(url);
    if (response.ok) {
        return await response.text();
    } else {
        throw new Error(`Failed to fetch ${url}`);
    }
};

const fetchAllCSS = async (driver) => {
    const cssContentArray = [];
    const styleSheets = await driver.executeScript(() => {
        return Array.from(document.styleSheets).map(sheet => sheet.href ? sheet.href : sheet.ownerNode.textContent);
    });

    for (const sheet of styleSheets) {
        if (sheet.includes('http')) {
            try {
                const cssContent = await getCSSContent(sheet);
                cssContentArray.push(cssContent);
            } catch (error) {
                console.error(error);
            }
        } else {
            cssContentArray.push(sheet);
        }
    }

    return cssContentArray;
};

const checkCompatibility = (cssContent, incompatibleProperties) => {
    const issues = [];
    incompatibleProperties.forEach(property => {
        const regex = new RegExp(`${property}\\s*:`, 'g');
        if (regex.test(cssContent)) {
            issues.push(property);
        }
    });
    return issues;
};

const incompatibleProperties = ['grid', 'flex'];

(async function runTests() {
    for (let { device, osVersion } of devices) {
        const driver = new Builder()
            .usingServer('https://hub-cloud.browserstack.com/wd/hub')
            .withCapabilities(capabilities(device, osVersion))
            .build();

        try {
            await driver.get(url);

            // Проверка CSS
            const cssContentArray = await fetchAllCSS(driver);
            cssContentArray.forEach(cssContent => {
                const issues = checkCompatibility(cssContent, incompatibleProperties);
                if (issues.length > 0) {
                    console.log(`Found incompatible styles on ${device} with iOS ${osVersion}:`, issues);
                } else {
                    console.log(`No incompatible styles found on ${device} with iOS ${osVersion}.`);
                }
            });

            // Проверка верстки
            await checkLayout(driver, device, osVersion);
        } finally {
            await driver.quit();
        }
    }
})();
