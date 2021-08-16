const puppeteer = require('puppeteer');
const sendEmail = require('./email.js')

const microsoftScrapPageUrl = 'https://surface.wiki/';
const microsoftShoppingPageUrl = 'https://www.microsoftstore.com.cn/xbox-series-x-configurate';

async function getScrapeItems(MSPage) {
  return await MSPage.evaluate(() => {
    const fetchResult = [];
    let xboxInformation = document.body.querySelector('[href="/go/xbox-series-x-configurate"]');

    let text = xboxInformation.querySelectorAll('div');
    text.forEach((title) => {
      fetchResult.push(title.innerText)
    })
    return fetchResult;
  });
}

const getFromMicrosoft = async () => {

  const browser = await puppeteer.launch();
  const MSPage = await browser.newPage();
  let times = 0;
  let scrapeItems;
  try {
    await MSPage.goto(microsoftScrapPageUrl, { waitUntil: 'domcontentloaded' });
    scrapeItems = await getScrapeItems(MSPage);

    console.log(scrapeItems);
    while (scrapeItems.includes("缺货")) {
      await MSPage.reload({ waitUntil: 'domcontentloaded' })
      console.log('reload times :', times++)
      scrapeItems = await getScrapeItems(MSPage)
      console.log('reload result :', scrapeItems)
      if (scrapeItems.includes('去购买')) {
        sendEmail(microsoftShoppingPageUrl)
        console.log(' reload scrapeItems', scrapeItems)
        await browser.close();
        break
      }
    }
  } catch (e) {
    console.log(e);
    await MSPage.close();
    await browser.close();
    await getFromMicrosoft()
  }
  if (scrapeItems.includes('去购买')) {
    sendEmail(microsoftShoppingPageUrl)
  }
  await browser.close();
}


console.log('查库存开始');

getFromMicrosoft().then()
