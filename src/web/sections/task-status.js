module.exports = {
  title: 'Task statuses',
  render: async () => {
    const fromDate = Math.floor((new Date()).valueOf() / 1000) - 365 * 86400
    let rows = await db.query(`SELECT status, startDate FROM TMTask WHERE type = 0 AND (stopDate IS NULL OR stopDate > ${fromDate})`)
    let statuses = { 0: 0, 3: 0}
    let scheduled = 0
    rows.forEach(row => {
      if(row.startDate && parseInt(row.status) === 0){
        scheduled++;
        return;
      }
      statuses[parseInt(row.status)]++
    })

    return {
      type: 'pie',
      data: {
        labels: ['Open', 'Scheduled', 'Completed'],
        datasets: [{
          data: [statuses[0] || 0, scheduled, statuses[3] || 0],
          backgroundColor: ['#4dabf1', '#f9d348', '#6bba69'],
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
