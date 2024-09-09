const moment = require('moment')

async function extractUserData(htmlString) {
    // Create a DOM parser to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
  
    // Query the table rows within the table you need
    let rows = doc.querySelectorAll('#dtbTorzsadatok_tableBodyLeft tr');
  
    // Initialize an array to hold the extracted data
    const data = [];
  
    // Loop over each row and extract the name and value
    rows.forEach(row => {
      const nameElement = row.querySelector('.tableRowName');
      const valueElement = row.querySelector('.tableRowData');
  
      // If both name and value are found, add them to the data array
      if (nameElement && valueElement) {
        const name = nameElement.textContent.trim();
        const value = valueElement.textContent.trim();
        data.push({ name, value });
      }
    });
    rows = doc.querySelectorAll('#dtbTorzsadatok_tableBodyRight tr');
    rows.forEach(row => {
        const nameElement = row.querySelector('.tableRowName');
        const valueElement = row.querySelector('.tableRowData');
    
        // If both name and value are found, add them to the data array
        if (nameElement && valueElement) {
          const name = nameElement.textContent.trim();
          const value = valueElement.textContent.trim();
          data.push({ name, value });
        }
      });
    // Return the extracted data as a JSON object
    return data;
  }


  async function extractTable(data) {
    return data.events.filter(x => !x.allday).map(x => {
        // Convert to UTC using moment
        const startdate = moment.utc(parseInt(x.startdate.slice(6, 19))).toDate(); // UTC
        const enddate = moment.utc(parseInt(x.enddate.slice(6, 19))).toDate();     // UTC

        // Extract title and teachers
        const title = x.title.slice(6, x.title.indexOf('(') - 1);
        const _teacherTmp = x.title.slice(x.title.indexOf('-'));
        const teachers = _teacherTmp.slice(_teacherTmp.indexOf('(') + 1, _teacherTmp.indexOf(')')).split(';');

        return {
            location: x.location,
            title: title,
            teachers: teachers,
            start: startdate, // UTC
            end: enddate      // UTC
        };
    });
}


function extractMessages(htmlString) {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
  
    // Select the table rows within the tbody with class 'scrollablebody'
    const rows = doc.querySelectorAll('tbody.scrollablebody tr');
  
    // Extract the data
    const data = Array.from(rows).map(row => {
      // Check if the row has the class 'Row1_Bold'
      const isOpened = row.classList.contains('Row1_Bold') ? false : true;
  
      // Get all td elements
      const cells = row.querySelectorAll('td');
  
      // Ensure there are enough cells
      if (cells.length < 8) return null;
  
      return {
        sender: cells[4] ? cells[4].textContent.trim() : '',
        title: cells[6] ? cells[6].querySelector('span') ? cells[6].querySelector('span').textContent.trim() : '' : '',
        sendDate: cells[7] ? cells[7].textContent.trim() : '',
        opened: isOpened
      };
    }).filter(record => record !== null); // Filter out any null values
  
    return data;
  }
  async function extractNews(htmlString) {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
  
    // Get all the news blocks within the table
    const newsRows = doc.querySelectorAll('table.table_left');
  
    // Extract the title and content for each news item
    const newsData = Array.from(newsRows).map(newsRow => {
      const titleElement = newsRow.querySelector('.login_news_subject a');
      const contentElement = newsRow.querySelector('.login_news_content p');
  
      return {
        title: titleElement ? titleElement.textContent.trim() : '',
        content: contentElement ? contentElement.textContent.trim() : ''
      };
    });
  
    return newsData;
  }
export default {extractUserData, extractTable,extractMessages,extractNews};