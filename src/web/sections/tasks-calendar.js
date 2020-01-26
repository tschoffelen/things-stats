const moment = require('moment')

module.exports = {
  title: 'Calendar',
  render: async () => {
    let startDate = moment().startOf('isoWeek').unix()
    let endDate = moment().startOf('isoWeek').add(8 * 7, 'days').unix()
    let rows = await db.query(`
      SELECT 
        title,
        startDate,
        nextInstanceStartDate,
        dueDate
      FROM TMTask 
      WHERE 
        type = 0 AND 
        status = 0 AND 
        trashed = 0 AND
        (startDate <= ${endDate} OR dueDate <= ${endDate} OR nextInstanceStartDate <= ${endDate})
    `)
    let days = {}
    let firstIndex = Math.floor(moment().startOf('day').unix() / 86400)
    while (startDate < endDate) {
      const index = '' + Math.floor(startDate / 86400)
      days[index] = [index < firstIndex ? '' : moment(startDate * 1000).format('ddd, MMM D'), 0, 0, 0]
      startDate += 86400
    }
    rows.forEach(row => {
      if (row.dueDate) {
        let unix = Math.floor(parseFloat(row.dueDate) / 86400)
        if (unix < firstIndex) {
          unix = firstIndex
        }
        if ('' + unix in days) {
          days['' + unix][2]++
        }
        if (row.dueDate <= row.startDate) {
          return
        }
      }
      if (row.startDate) {
        let unix = Math.floor(parseFloat(row.startDate) / 86400)
        if (unix < firstIndex) {
          unix = firstIndex
        }
        if ('' + unix in days) {
          days['' + unix][1]++
        }
      }
      if (row.nextInstanceStartDate) {
        if (row.startDate && row.nextInstanceStartDate <= row.startDate) {
          return
        }
        let unix = Math.floor(parseFloat(row.nextInstanceStartDate) / 86400)
        if ('' + unix in days) {
          days['' + unix][3]++
        }
      }
    })

    console.log(days)

    return `
      <div class="calendar-outer">
        ${Object.values(days).map(([date, tasks, deadlines, repeating]) => `
          <div class="calendar-day">
            <span class="calendar-date">${date}</span>
            <span class="calendar-inner">
              ${tasks ? `<span title="${tasks} scheduled tasks" class="calendar-tasks">${tasks}</span>` : ''}
              ${deadlines ? `<span title="${deadlines} deadlines" class="calendar-deadlines">${deadlines}</span>` : ''}
              ${repeating ? `<span title="${repeating} repeating tasks" class="calendar-repeating">${repeating}</span>` : ''}
            </span>
          </div>
        `).join('')}
      </div>
    `
  }
}
