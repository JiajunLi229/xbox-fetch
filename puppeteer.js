const puppeteer = require ('puppeteer');
const sound = require('sound-play')
const open = require('open');

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

puppeteer
  .launch ()
  .then (async browser => {

    const page = await browser.newPage ();
    await page.goto ('https://surface.wiki/');
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

    while (true) {
      sleep(2000);
      console.log(grabPosts)
      console.log('next query')
      if (grabPosts.includes("去购买")) {
        await open('https://www.microsoftstore.com.cn/xbox-series-x-configurate');
          sound.play('peaches.mp3');
        break
      }
    }
    await browser.close ();
  })
  .catch (function (err) {
    console.error (err);
  });
