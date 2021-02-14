const moment = require('moment')

module.exports = {
  title: 'Tags',
  render: async () => {
    const fromDate = Math.floor((new Date()).valueOf() / 1000) - 365 * 86400
    const rows = await db.query(`
      SELECT 
        TMTask.stopDate,
        TMTag.title as tag
      FROM TMTask
      INNER JOIN TMTaskTag ON TMTaskTag.tasks = TMTask.uuid
      INNER JOIN TMTag ON TMTaskTag.tags = TMTag.uuid
      WHERE
        stopDate > ${fromDate}
    `)
    const tags = Object.fromEntries(
      Object.entries(rows.reduce((tags, row) => {
      tags[row.tag] = (tags[row.tag] || 0) + 1;
      return tags;
    }, {}))
      .sort(([,a], [,b]) => a > b ? -1 : 1)
        .slice(0,20)
    );

    return {
      type: 'horizontalBar',
      data: {
        labels: Object.keys(tags),
        datasets: [{
          data: Object.values(tags),
          backgroundColor: '#6bba69'
        }]
      },
      options: {
        plugins: {
          datalabels: {
            display: false
          }
        },
        legend: {
          display: false
        }
      }
    }
  }
}
