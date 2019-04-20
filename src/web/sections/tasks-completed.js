const moment = require('moment')

module.exports = {
  title: 'Completed by month',
  render: async () => {
    let rows = await db.query('SELECT stopDate FROM TMTask WHERE type = 0 AND status = 3')
    let months = {
      'January': 0,
      'February': 0,
      'March': 0,
      'April': 0,
      'May': 0,
      'June': 0,
      'July': 0,
      'August': 0,
      'September': 0,
      'October': 0,
      'November': 0,
      'December': 0
    }
    rows.forEach(row => {
      const month = moment(Math.round(parseFloat(row.stopDate)) * 1000).format('MMMM')
      months[month]++
    })

    return {
      type: 'horizontalBar',
      data: {
        labels: Object.keys(months),
        datasets: [{
          data: Object.values(months),
          backgroundColor: '#4faef2'
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
