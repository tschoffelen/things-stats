module.exports = {
  title: 'Task statuses',
  render: async () => {
    let rows = await db.query('SELECT status, COUNT(status) as c FROM TMTask WHERE type = 0 GROUP BY status')
    let statuses = {}
    rows.forEach(row => {
      statuses[parseInt(row.status)] = parseInt(row.c)
    })

    return {
      type: 'pie',
      data: {
        labels: ['Open', 'Completed'],
        datasets: [{
          data: [statuses[0] || 0, statuses[3] || 0],
          backgroundColor: ['#4faef2', '#6bba69'],
          borderColor: '#212225',
          borderWidth: 5
        }]
      },
      options: {
        cutoutPercentage: 40,
        plugins: {
          datalabels: {
            color: '#fff',
            font: {
              weight: '600',
              family: '-apple-system, BlinkMacSystemFont, sans-serif',
              size: 13
            }
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            padding: 24,
            boxWidth: 12,
            fontColor: '#969799',
            fontWeight: '500',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 13
          }
        }
      }
    }
  }
}
