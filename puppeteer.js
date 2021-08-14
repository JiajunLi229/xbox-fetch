const puppeteer = require('puppeteer');
const sound = require('sound-play')
const open = require('open');
const schedule = require('node-schedule')
const sendEmail = require('./email.js')

const JDUrl = 'https://item.jd.com/100022493728.html';
const microsoftScrapPageUrl = 'https://surface.wiki/';
const microsoftShoppingPageUrl = 'https://www.microsoftstore.com.cn/xbox-series-x-configurate';

const getFromMicrosoft = async () => {
  const browser = await puppeteer.launch();
  const MSPage = await browser.newPage();
  await MSPage.goto(microsoftScrapPageUrl);
  await MSPage.waitForSelector('body');
  let grabPosts = await MSPage.evaluate(() => {
    let xboxInformation = document.body.querySelectorAll('[href="/go/xbox-series-x-configurate"]');
    let scrapeItems = [];
    xboxInformation.forEach(information => {
      let text = information.querySelectorAll('div');
      text.forEach((title) => {
        scrapeItems.push(title.innerText)
      })
    });
    return scrapeItems;
  });
  await browser.close();
  return grabPosts;
}

const getFromJd = async () => {
  const browser = await puppeteer.launch();
  const jdPage = await browser.newPage();
  await jdPage.goto(JDUrl);
  await jdPage.waitForSelector('body');

  let JDPosts = await jdPage.evaluate(() => {
    let xboxInformation = document.body.querySelectorAll('[class="itemover-tip"]');

    let jdCart = [];
    xboxInformation.forEach(information => {
      let text = information.innerText;
      jdCart.push(text)
    });
    return jdCart;
  });
  await browser.close();
  return JDPosts;
}

let MSResult = [];
let JDResult = [];
console.log('查库存开始');
const job = schedule.scheduleJob('* * * * *', async function () {
  MSResult = await getFromMicrosoft();
  JDResult = await getFromJd();
  console.log(`微软商城结果为 ${MSResult}`+ '\n' + `京东商城结果为 ${JDResult}`);

  if (MSResult.includes("去购买")) {
    open(microsoftShoppingPageUrl);
    console.log("有货啦!!!!!")
    sendEmail(microsoftShoppingPageUrl)
    sound.play('peaches.mp3');
    job.cancel()
  } else if (!JDResult.includes('该商品已下柜，欢迎挑选其他商品！')) {
    open(JDUrl);
    console.log("有货啦!!!!!")
    sendEmail(JDUrl)
    sound.play('peaches.mp3');
    job.cancel()
  }
});
