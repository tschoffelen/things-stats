const moment = require('moment');
const { formatTime, getTime } = require('../lib/time');

module.exports = {
  title: 'Calendar',
  render: async() => {
    let startDate = moment().startOf('isoWeek').unix();
    let endDate = moment().startOf('isoWeek').add(5 * 7, 'days').unix();
    let res = await db.query(`
      SELECT
        TMTask.uuid as id,
        TMTask.title,
        TMTag.title as tag,
        TMTask.startDate,
        TMTask.nextInstanceStartDate,
        TMTask.dueDate
      FROM TMTask
      LEFT JOIN TMTaskTag ON TMTaskTag.tasks = TMTask.uuid
      LEFT JOIN TMTag ON TMTaskTag.tags = TMTag.uuid
      WHERE
        type = 0 AND
        status = 0 AND
        trashed = 0 AND
        (startDate <= ${endDate} OR dueDate <= ${endDate} OR nextInstanceStartDate <= ${endDate})
    `);

    const rows = Object.values(res.reduce((groups, row) => {
      if (!(row.id in groups)) {
        groups[row.id] = {
          ...row,
          tags: [],
          duration: 0
        };
      }
      if (row.tag) {
        groups[row.id].tags.push(row.tag);
        groups[row.id].duration += getTime(row.tag);
      }
      return groups;
    }, {}));
    console.log(rows);
    let days = {};
    let firstIndex = Math.floor(moment().startOf('day').unix() / 86400);
    while (startDate < endDate) {
      const index = '' + Math.floor(startDate / 86400);
      days[index] = [index < firstIndex ? '' : moment(startDate * 1000).format('ddd, MMM D'), 0, 0, 0, 0, []];
      startDate += 86400;
    }
    rows.forEach(row => {
      let added = false;
      if (row.startDate) {
        let unix = Math.floor(parseFloat(row.startDate) / 86400);
        if (unix < firstIndex) {
          unix = firstIndex;
        }
        if ('' + unix in days) {
          days['' + unix][1]++;
          if (!added) {
            added = true;
            days['' + unix][5].push(row);
            days['' + unix][4] += row.duration;
          }
        }
        if (row.dueDate && row.dueDate < row.startDate) {
          return;
        }
      }
      if (row.dueDate) {
        let unix = Math.floor(parseFloat(row.dueDate) / 86400);
        if (unix < firstIndex) {
          unix = firstIndex;
        }
        if ('' + unix in days) {
          days['' + unix][2]++;
          if (!added) {
            added = true;
            days['' + unix][5].push(row);
            days['' + unix][4] += row.duration;
          }
        }
        if (row.dueDate <= row.startDate) {
          return;
        }
      }
      if (row.nextInstanceStartDate) {
        if (row.startDate && row.nextInstanceStartDate <= row.startDate) {
          return;
        }
        let unix = Math.floor(parseFloat(row.nextInstanceStartDate) / 86400);
        if ('' + unix in days) {
          days['' + unix][3]++;
          if (!added) {
            days['' + unix][5].push(row);
            days['' + unix][4] += row.duration;
          }
        }
      }
    });

    console.log(days);

    return `
      <div class="calendar-outer">
        ${Object.values(days).map(([date, tasks, deadlines, repeating, duration]) => `
          <div class="calendar-day">
            <span class="calendar-date">${date}</span>
            ${duration ? `<span class="calendar-duration">${formatTime(duration)}</span>` : ''}
            <span class="calendar-inner">
              ${tasks ? `<span title="${tasks} scheduled tasks" class="calendar-tasks">${tasks}</span>` : ''}
              ${deadlines ? `<span title="${deadlines} deadlines" class="calendar-deadlines">${deadlines}</span>` : ''}
              ${repeating ? `<span title="${repeating} repeating tasks" class="calendar-repeating">${repeating}</span>` : ''}
            </span>
          </div>
        `).join('')}
      </div>
    `;
  }
};
