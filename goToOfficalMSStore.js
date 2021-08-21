const puppeteer = require('puppeteer');
const sendEmail = require('./email.js')

const microsoftShoppingPageUrl = 'https://www.microsoftstore.com.cn/xbox-series-x-configurate';

async function isLocatorReady(element, page) {
  const isVisibleHandle = await page.evaluateHandle((e) => {
    const style = window.getComputedStyle(e);
    return (style && style.display !== 'none' &&
      style.visibility !== 'hidden' && style.opacity !== '0');
  }, element);
  const visible = await isVisibleHandle.jsonValue();
  const box = await element.boxModel();
  return !!(visible && box);
}

async function getScrapeItems(MSPage) {
  const cart = await MSPage.waitForSelector('[title~=加入购物车]');
  const cartResult =  await isLocatorReady(cart, MSPage);
  const stockArrive = await MSPage.waitForSelector('[title~=到货通知]');
  const stockArriveResult =  await isLocatorReady(stockArrive, MSPage);
  return {
    cartResult,
    stockArriveResult
  }

}

const getFromMicrosoft = async () => {

  const browser = await puppeteer.launch();
  const MSPage = await browser.newPage();
  let times = 0;
  let result;
  try {
    await MSPage.goto(microsoftShoppingPageUrl, { waitUntil: 'domcontentloaded' });
    result = await getScrapeItems(MSPage);
    console.log('scrapeItems', result);
    while (true) {
      await MSPage.reload({ waitUntil: 'domcontentloaded' })
      await MSPage.reload({ waitUntil: 'domcontentloaded' })
      await MSPage.reload({ waitUntil: 'domcontentloaded' })
      await MSPage.reload({ waitUntil: 'domcontentloaded' })
      await MSPage.reload({ waitUntil: 'domcontentloaded' })
      console.log('reload times :', times++)
      result = await getScrapeItems(MSPage)
      console.log('reload result :', result)
      const {cartResult, stockArriveResult} = result
      if ( cartResult === true ||stockArriveResult === false) {
        await open(microsoftShoppingPageUrl);
        sendEmail(microsoftShoppingPageUrl)
        console.log(' reload scrapeItems', result)
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

  await browser.close();
}


console.log('查库存开始');
getFromMicrosoft().then()
