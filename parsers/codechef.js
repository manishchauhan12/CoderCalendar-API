const axios = require('axios');
const cheerio = require('cheerio');

function parseContestDetails($, contestRow) {
  const details = $(contestRow).find('td');
  const start_time = new Date(details.eq(2).text()).getTime() / 1000;
  const end_time = new Date(details.eq(3).text()).getTime() / 1000;
  return {
    name: details.eq(1).text(),
    url: `http://www.codechef.com${details.eq(1).find('a').attr('href')}`,
    platform: 'codechef',
    start_time,
    end_time,
    duration: (end_time - start_time),
  };
}

const codechef = function () {
  return axios.get('http://www.codechef.com/contests', { timeout: 30000 })
    .then((response) => {
      const $ = cheerio.load(response.data);
      const statusdiv = $('table .dataTable');
      const headings = $('h3');
      const contestTables = { 'Future Contests': [], 'Present Contests': [] };

      for (let i = 0; i < headings.length; i++) {
        if (headings.eq(i).text() !== 'Past Contests') {
          contestTables[headings.eq(i).text()] = statusdiv.eq(i).find('tr').slice(1);
        }
      }
      let contests = contestTables['Present Contests'].map((i, elem) => parseContestDetails($, elem)).get();

      contests = contests.concat(contestTables['Future Contests'].map((i, elem) => parseContestDetails($, elem)).get());

      return contests;
    })
    .catch((error) => {
      console.log('Codechef: ', error.toString());
    });
};

module.exports = codechef;
