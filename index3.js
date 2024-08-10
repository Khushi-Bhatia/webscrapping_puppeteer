// 'https://planningexplorer.barnsley.gov.uk/Home/ShowLastMonthPlanningApplications'
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Go to the main page containing the table
    await page.goto('https://planningexplorer.barnsley.gov.uk/Home/ShowLastMonthPlanningApplications'); // Replace with the actual URL containing the table

    await page.waitForSelector('#table1');

    // Scrape the table data and get the details links
    const tableData = await page.evaluate(() => {
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

    // Iterate over each entry and scrape details from each detailsLink
    for (let entry of tableData) {
      await page.goto(entry.detailsLink);

      await page.waitForSelector('#summaryDetails.panel-collapse.collapse.in');
      await page.waitForSelector('#furtherinfo.panel.panel-default');
      await page.waitForSelector('#impdates.panel.panel-default');

      const detailsData = await page.evaluate(() => {
        const summaryElement = document.querySelector('#summaryDetails.panel-collapse.collapse.in');
        const furtherInfoElement = document.querySelector('#furtherinfo.panel.panel-default');
        const impDatesElement = document.querySelector('#impdates.panel.panel-default');

        const summaryTableData = {};
        const summaryTableElement = document.querySelector('#summaryDetails table.table.table-bordered.table-responsive');
        if (summaryTableElement) {
          const tableRows = summaryTableElement.querySelectorAll('tr');
          tableRows.forEach(row => {
            const headerCell = row.querySelector('td.col-xs-3');
            const valueCell = row.querySelector('td.col-xs-9');
            if (headerCell && valueCell) {
              const header = headerCell.innerText.trim();
              const value = valueCell.innerText.trim();
              summaryTableData[header] = value;
            }
          });
        }

        const furtherInfoTableData = {};
        const furtherInfoTableElement = document.querySelector('#furtherinfoDetails table.table.table-bordered.table-responsive');
        if (furtherInfoTableElement) {
          const tableRows = furtherInfoTableElement.querySelectorAll('tr');
          tableRows.forEach(row => {
            const headerCell = row.querySelector('td.col-xs-3');
            const valueCell = row.querySelector('td.col-xs-9');
            if (headerCell && valueCell) {
              const header = headerCell.innerText.trim();
              const value = valueCell.innerText.trim();
              furtherInfoTableData[header] = value;
            }
          });
        }

        const importantDatesData = {};
        const importantDatesTableElement = document.querySelector('#importantDatesDeatils table.table.table-bordered.table-responsive');
        if (importantDatesTableElement) {
          const tableRows = importantDatesTableElement.querySelectorAll('tr');
          tableRows.forEach(row => {
            const headerCell = row.querySelector('td.col-xs-3');
            const valueCell = row.querySelector('td.col-xs-9');
            if (headerCell && valueCell) {
              const header = headerCell.innerText.trim();
              const value = valueCell.innerText.trim();
              importantDatesData[header] = value;
            }
          });
        }

        return {
          summary: summaryElement ? summaryElement.innerText : null,
          furtherInfo: furtherInfoElement ? furtherInfoElement.innerText : null,
          importantDates: impDatesElement ? impDatesElement.innerText : null,
          summaryDetails: summaryTableData,
          furtherInformation: furtherInfoTableData,
          importantDatesData: importantDatesData
        };
      });

      // Combine table entry with its corresponding details
      entry.details = detailsData;

      console.log('Entry:', entry);
      console.log("######################################################################################");
    }

    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
