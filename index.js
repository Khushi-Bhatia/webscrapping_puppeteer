
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const downloadPath = path.resolve(__dirname, 'downloads');
    fs.mkdirSync(downloadPath, { recursive: true });

    // Set download behavior
    await page._client().send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath
    });

    await page.goto('https://planningexplorer.barnsley.gov.uk/Home/ApplicationDetails?planningApplicationNumber=2024%2F0581');

    await page.waitForSelector('#summaryDetails.panel-collapse.collapse.in');
    await page.waitForSelector('#furtherinfo.panel.panel-default');
    await page.waitForSelector('#impdates.panel.panel-default');

    // Scrape the content from the divs and the table
    const data = await page.evaluate(() => {
      const summaryElement = document.querySelector('#summaryDetails.panel-collapse.collapse.in');
      const furtherInfoElement = document.querySelector('#furtherinfo.panel.panel-default');
      const impDatesElement = document.querySelector('#impdates.panel.panel-default');
      const tableElement = document.querySelector('table.table.table-bordered.table-responsive');

      // Extract table data
      const tableData = [];
      if (tableElement) {
        const rows = tableElement.querySelectorAll('tr');
        rows.forEach(row => {
          const rowData = [];
          const cells = row.querySelectorAll('th, td');
          cells.forEach(cell => {
            rowData.push(cell.innerText);
          });
          tableData.push(rowData);
        });
      }

      // Scrape further information from the specific table
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
            if (header === 'Application Type') {
              furtherInfoTableData.application_type = value;
            } else if (header === 'Ward') {
              furtherInfoTableData.ward = value;
            } else if (header === 'Parish') {
              furtherInfoTableData.parish = value;
            } else if (header === 'Agent Name') {
              furtherInfoTableData.agent_name = value;
            } else if (header === 'Case Officer Name') {
              furtherInfoTableData.case_officer_name = value;
            } else if (header === 'Applicant Name') {
              furtherInfoTableData.applicant_name = value;
            } else if (header === 'Applicant Address') {
              furtherInfoTableData.applicant_address = value;
            } else if (header === 'Determination Level') {
              furtherInfoTableData.determination_level = value;
            } else if (header === 'Case Officer Telephone') {
              furtherInfoTableData.case_officer_telephone = value;
            } else if (header === 'Case Officer Email') {
              furtherInfoTableData.case_officer_email = value;
            } else if (header === 'Environmental Assessment Required') {
              furtherInfoTableData.environmental_assessment_required = value;
            }
          }
        });
      }

      // Scrape summary details
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
            if (header === 'Application Reference Number') {
              summaryTableData.application_reference_number = value;
            } else if (header === 'Description') {
              summaryTableData.description = value;
            } else if (header === 'Site Address') {
              summaryTableData.site_address = value;
            } else if (header === 'Received Date') {
              summaryTableData.received_date = value;
            } else if (header === 'Valid From') {
              summaryTableData.valid_from = value;
            } else if (header === 'Decision') {
              summaryTableData.decision = value;
            } else if (header === 'Status') {
              summaryTableData.status = value;
            } else if (header === 'Comment Until') {
              summaryTableData.comment_until = value;
            }
          }
        });
      }

      // Scrape important dates details
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
            if (header === 'Received Date') {
              importantDatesData.received_date = value;
            } else if (header === 'Valid From') {
              importantDatesData.valid_from = value;
            } else if (header === 'Consultation Expiry Date') {
              importantDatesData.consultation_expiry_date = value;
            } else if (header === 'Target Decision Date') {
              importantDatesData.target_decision_date = value;
            } else if (header === 'Extended Target Decision Date') {
              importantDatesData.extended_target_decision_date = value;
            } else if (header === 'Decision Date') {
              importantDatesData.decision_date = value;
            }
          }
        });
      }

      return {
        summary: summaryElement ? summaryElement.innerText : null,
        furtherInfo: furtherInfoElement ? furtherInfoElement.innerText : null,
        impDates: impDatesElement ? impDatesElement.innerText : null,
        table: tableData,
        furtherInformation: furtherInfoTableData,
        summaryDetails: summaryTableData,
        importantDates: importantDatesData
      };
    });

    console.log('Summary:', data.summary);
    console.log("=================================");
    console.log('Further Info:', data.furtherInfo);
    console.log("=================================");
    console.log('Important Dates:', data.impDates);
    console.log('-----------------------------------');
    console.log('Table Data:', data.table);
    console.log("######################################################################################");
    console.log('Further Information:', data.furtherInformation);
    console.log("--------------------------------------------------------------------------------------");
    console.log('Summary Details:', data.summaryDetails);
    console.log("--------------------------------------------------------------------------------------");
    console.log('Important Dates:', data.importantDates);

    // Scrape for the application form link
    const applicationFormLink = await page.evaluate(() => {
      const rows = document.querySelectorAll('#collapseTwo .table tr td a');
      let link = null;
      rows.forEach(row => {
        if (row.textContent.toLowerCase().includes('application form')) {
          link = row.href;
        }
      });
      return link;
    });

    if (applicationFormLink) {
      console.log('Application Form Link:', applicationFormLink);

      // Navigate to the link to trigger the download
      await page.goto(applicationFormLink, { waitUntil: 'networkidle2' });

      // Wait for some time to ensure the file is downloaded
      await page.waitForTimeout(5000);

      console.log('File downloaded successfully');
    } else {
      console.log('Application form link not found');
    }

    await browser.close();
  } catch (err) {
    console.log(err);
  }
})();
