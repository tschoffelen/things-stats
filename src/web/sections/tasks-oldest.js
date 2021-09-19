export default {
  title: 'Oldest',
  render: async() => {
    const endDate = Math.floor(new Date().valueOf() / 1000) - 86400 * 30;
    let rows = await db.query(`
      SELECT * FROM TMTask 
      WHERE 
        type = 0 AND 
        status < 2 AND 
        trashed = 0 AND 
        recurrenceRule IS NULL AND 
        start >= 1 AND 
        startDate IS NOT NULL AND 
        creationDate < ${endDate}
      ORDER BY creationDate ASC
    `);

    const tasks = [
      `
        <li>
          <div class="tasks__summary">
            ${rows.length} scheduled tasks older than 30 days.
          </div>
        </li>
      `
    ];
    let lastYear = '';
    rows.forEach(({ uuid, creationDate, title }) => {
      if (tasks.length > 20) {
        return;
      }
      const date = new Date(Math.round(parseFloat(creationDate)) * 1000);
      const year = dateFns.format(date, 'yyyy');
      if (lastYear !== year) {
        tasks.push(`
          <li>
            <div class="tasks__divider">
              Created in ${year}
            </div>
          </li>
        `);
        lastYear = year;
      }
      tasks.push(`
        <li>
          <a href="things:///show?id=${uuid}">
            <div class="tasks__title">
              ${title}
            </div>
            <div class="tasks__subtitle">
              Created ${dateFns.format(date, 'P')}
            </div>
          </a>
        </li>
      `);
    });

    return `
      <ul class="tasks">
        ${tasks.join('')}
      </ul>
    `;
  }
};
