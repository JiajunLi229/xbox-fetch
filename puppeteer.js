const puppeteer = require ('puppeteer');
const sound = require('sound-play')
const open = require('open');
const schedule = require('node-schedule')
let JDUrl = 'https://item.jd.com/100022493728.html';
let microsoftPageUrl = 'https://surface.wiki/';

const getFromMicrosoft = async() => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto (microsoftPageUrl);
  await page.waitForSelector ('body');
  let grabPosts = await page.evaluate (() => {
    let xboxInformation = document.body.querySelectorAll ('[href="/go/xbox-series-x-configurate"]');
    let scrapeItems = [];
    xboxInformation.forEach (information => {
      let text = information.querySelectorAll ('div');
      text.forEach((title) => {
        scrapeItems.push(title.innerText)
      })
    });
    return scrapeItems;
  });
  await browser.close ();
  return grabPosts;
}

const getFromJd = async () => {
  const browser = await puppeteer.launch();
  const jdPage = await browser.newPage ();
  await jdPage.goto (JDUrl);
  await jdPage.waitForSelector ('body');

  let JDPosts = await jdPage.evaluate (() => {
    let xboxInformation = document.body.querySelectorAll ('[class="itemover-tip"]');

    let jdCart = [];
    xboxInformation.forEach (information => {
      let text = information.innerText;
      jdCart.push(text)
    });
    return jdCart;
  });
  await browser.close ();
  return JDPosts;
}

let MSResult = [];
let JDResult = [];
const job =schedule.scheduleJob('* * * * *', async function(){
    MSResult = await getFromMicrosoft();
    JDResult = await getFromJd();
  console.log('MSResult looks like', MSResult);
  console.log('JDResult looks like', JDResult);
  if (MSResult.includes("去购买")) {
    open('https://www.microsoftstore.com.cn/xbox-series-x-configurate');
    console.log("success!!!!!")
    sound.play('peaches.mp3');
    job.cancel()
  } else if (!JDResult.includes('该商品已下柜，欢迎挑选其他商品！')){
    open(JDUrl);
    console.log("success!!!!!")
    sound.play('peaches.mp3');
    job.cancel()
  }
});
