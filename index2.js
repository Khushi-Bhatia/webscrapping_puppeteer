const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://planningexplorer.barnsley.gov.uk/Home/ShowLastMonthPlanningApplications'); // Replace with the actual URL containing the table

    await page.waitForSelector('#table1');

    const data = await page.evaluate(() => {
      const table = document.querySelector('#table1');
      const rows = table.querySelectorAll('tbody tr');
      const rowData = [];

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const entry = {
          reference: cells[0].innerText.trim(),
          description: cells[1].innerText.trim(),
          siteAddress: cells[2].innerText.trim(),
          validatedDate: cells[3].innerText.trim(),
          decision: cells[4].innerText.trim(),
          status: cells[5].innerText.trim(),
          detailsLink: cells[0].querySelector('a').href
        };
        rowData.push(entry);
      });

      return rowData;
    });

    console.log(data);

    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
