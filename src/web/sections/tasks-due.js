export default {
  title: 'Due dates',
  render: async () => {
    let rows = await db.query('SELECT start, startDate, title FROM TMTask WHERE type = 0 AND status = 0')
    let months = {
      'Today': 0,
      'Tomorrow': 0,
      'This week': 0,
      'Next week': 0,
      'Later': 0,
      'No date': 0,
      'Someday': 0
    }

    let colors = ['#f9d348', '#a38731', '#65aca4', '#50817c', '#395755', '#7dabf6', '#d1c794']

    const today = dateFns.endOfDay(new Date()).valueOf()
    const tomorrow =  dateFns.addDays(dateFns.endOfDay(new Date()),1).valueOf()
    const thisWeek = dateFns.addDays(dateFns.startOfWeek(new Date()),7).valueOf()
    const nextWeek = dateFns.addDays(dateFns.startOfWeek(new Date()),14).valueOf()

    rows.forEach(row => {
      if (!row.title.replace(/[-–—\s]+/gi, '')) {
        return
      }
      if (!row.startDate) {
        months[row.start === 1 ? 'No date' : 'Someday']++
        return
      }
      const value = Math.round(parseFloat(row.startDate)) * 1000
      if (value < today) {
        months['Today']++
      } else if (value < tomorrow) {
        months['Tomorrow']++
      } else if (value < thisWeek) {
        months['This week']++
      } else if (value < nextWeek) {
        months['Next week']++
      } else {
        months['Later']++
      }
    })

    if (thisWeek - 1 === today) {
      delete months['This week']
      delete colors[4]
      colors = Object.values(colors)
    }

    return {
      type: 'bar',
      data: {
        labels: Object.keys(months),
        datasets: [{
          data: Object.values(months),
          backgroundColor: colors
        }]
      },
      options: {
        plugins: {
          datalabels: {
            display: false
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        legend: {
          display: false
        }
      }
    }
  }
}
