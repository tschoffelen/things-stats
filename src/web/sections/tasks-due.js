const moment = require('moment')

module.exports = {
  title: 'Upcoming due dates',
  render: async () => {
    let rows = await db.query('SELECT start, startDate FROM TMTask WHERE type = 0 AND status = 0')
    let months = {
      'Overdue': 0,
      'Today': 0,
      'This week': 0,
      'Next week': 0,
      'Later': 0,
      'No date': 0,
      'Someday': 0
    }

    const overdue = moment().startOf('day').valueOf()
    const today = moment().endOf('day').valueOf()
    const thisWeek = moment().startOf('isoWeek').add('7', 'days').valueOf()
    const nextWeek = moment().startOf('isoWeek').add('14', 'days').valueOf()

    rows.forEach(row => {
      if(!row.startDate){
        months[row.start === 1 ? 'No date' : 'Someday']++
        return
      }
      const value = Math.round(parseFloat(row.startDate)) * 1000
      if (value < overdue) {
        months['Overdue']++
      } else if (value < today) {
        months['Today']++
      } else if (value < thisWeek) {
        months['This week']++
      } else if (value < nextWeek) {
        months['Next week']++
      } else {
        months['Later']++
      }
    })

    return {
      type: 'bar',
      data: {
        labels: Object.keys(months),
        datasets: [{
          data: Object.values(months),
          backgroundColor: ['#eb476e', '#f9d348', '#65aca4', '#50817c', '#395755', '#7dabf6', '#d1c794']
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
