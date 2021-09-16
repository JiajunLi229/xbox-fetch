const puppeteer = require('puppeteer');
const sendEmail = require('./email.js')
const sound = require('sound-play')
const open = require('open');

const JDUrl = 'https://item.jd.com/100022493728.html';
const microsoftShoppingPageUrl = 'https://www.microsoftstore.com.cn/xbox-series-x-configurate';

async function getScrapeItems(JDPage) {
  return await JDPage.evaluate(() => {
    const fetchResult = [];
    let xboxInformation = document.body.querySelector('[class="itemover-tip"]').innerText;
      fetchResult.push(xboxInformation)
    return fetchResult;
  });
}

const getFromJd = async () => {

  const browser = await puppeteer.launch();
  const JDPage = await browser.newPage();
  let times = 0;
  let scrapeItems;
  try {
    await JDPage.goto(JDUrl, { waitUntil: 'domcontentloaded' });
    scrapeItems = await getScrapeItems(JDPage);

    console.log(scrapeItems);
    while (scrapeItems.includes("该商品已下柜，欢迎挑选其他商品！")) {
      await JDPage.reload({ waitUntil: 'domcontentloaded' })
      console.log('reload times :', times++)
      scrapeItems = await getScrapeItems(JDPage)
      console.log('reload result :', scrapeItems)
      if (!scrapeItems.includes("该商品已下柜，欢迎挑选其他商品！")) {
        sound.play('audioblocks-cute-interface-sound-2-application-modern-shiny_rZbzgFu7tDL_WM.mp3');
        console.log("京东上架了！！！")
        await open(JDUrl);
        sendEmail(JDUrl)
        await browser.close();
        break
      }
    }
  } catch (e) {
    console.log(e);
    await JDPage.close();
    await browser.close();
    await getFromJd()
  }
  if (!scrapeItems.includes("该商品已下柜，欢迎挑选其他商品！")) {
    sound.play('audioblocks-cute-interface-sound-2-application-modern-shiny_rZbzgFu7tDL_WM.mp3');
    await open(JDUrl);
    sendEmail(JDUrl)
  }
  await browser.close();
}


console.log('查库存开始');

getFromJd().then()
