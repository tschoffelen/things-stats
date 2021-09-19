import { formatTime, getTime } from '../lib/time.js';

const { format, startOfDay, addDays, getUnixTime } = window.dateFns;

const groupBy = (arr, key) => {
	const initialValue = {};
	return arr.reduce((acc, cval) => {
		const myAttribute = cval[key];
		acc[myAttribute] = [...(acc[myAttribute] || []), cval];
		return acc;
	}, initialValue);
};

export default {
	title: 'Schedule',
	render: async() => {
		let startDate = startOfDay(new Date());
		let endDate = addDays(startDate, 4 * 7);
		let res = await db.query(`
      SELECT
        TMTask.uuid as id,
        TMTask.title,
        TMTag.title as tag,
        TMTask.startDate,
        TMTask.nextInstanceStartDate,
        TMTask.dueDate,
        TMTask.todayIndex
      FROM TMTask
      LEFT JOIN TMTaskTag ON TMTaskTag.tasks = TMTask.uuid
      LEFT JOIN TMTag ON TMTaskTag.tags = TMTag.uuid
      WHERE
        type = 0 AND
        status = 0 AND
        trashed = 0 AND
        (startDate <= ${getUnixTime(endDate)} OR dueDate <= ${getUnixTime(endDate)} OR nextInstanceStartDate <= ${getUnixTime(endDate)})
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

		const items = [];
		for (const row of rows) {
			let added = false;
			if (row.dueDate) {
				if (!added) {
					added = true;
					items.push({
						...row,
						type: 'deadline',
						date: new Date(row.dueDate * 1000)
					});
				}
			}
			if (row.startDate) {
				if (!added) {
					added = true;
					items.push({
						...row,
						type: 'task',
						date: new Date(row.startDate * 1000)
					});
				}
				if (row.dueDate && row.dueDate < row.startDate) {
					continue;
				}
			}
			if (row.nextInstanceStartDate) {
				if (row.startDate && row.nextInstanceStartDate <= row.startDate) {
					continue;
				}
				if (!added && row.nextInstanceStartDate > 0) {
					items.push({
						...row,
						type: 'repeating',
						date: new Date(row.nextInstanceStartDate * 1000)
					});
				}
			}
		}

		const days = groupBy(
			items
				.sort((a, b) => a.date > b.date ? 1 : -1)
				.map((row) => ({ ...row, date: startOfDay(new Date(row.date)).toISOString() }))
				.map((row) => row.title && row.title.includes('———') ? { ...row, type: 'divider' } : row)
			, 'date');

		return `<div class="schedule">${
			Object.entries(days)
				.sort(([a], [b]) => a > b ? 1 : -1)
				.map(([date, items]) => {
					const tasks = items.filter(({ type }) => type === 'task').length;
					const deadlines = items.filter(({ type }) => type === 'deadline').length;
					const repeating = items.filter(({ type }) => type === 'repeating').length;
					const totalDuration = items.reduce((total, { duration }) => total + duration, 0);

					const summary = [];
					if (totalDuration) {
						summary.push(`${formatTime(totalDuration)} duration`);
					}
					if (deadlines) {
						summary.push(`${deadlines} deadlines`);
					}
					if (repeating) {
						summary.push(`${repeating} repeating tasks`);
					}

					return `
	          <div class="schedule-day">
		          <div class="schedule-day__header">
		            <span class="calendar-date">
		              ${format(new Date(date), 'EEEE, MMMM d')}
		              ${summary.length ? `<span>${summary.join(', ')}</span>` : ''}
		            </span>
		            <span class="calendar-inner">
		              ${tasks ? `<span title="${tasks} scheduled tasks" class="calendar-tasks">${tasks}</span>` : ''}
		              ${deadlines ? `<span title="${deadlines} deadlines" class="calendar-deadlines">${deadlines}</span>` : ''}
		              ${repeating ? `<span title="${repeating} repeating tasks" class="calendar-repeating">${repeating}</span>` : ''}
		            </span>
		          </div>
		          <div class="schedule-day__timings">
	              ${
						items
							.sort((a, b) => {
								if (a.type > b.type) {
									return 1;
								}
								if (a.type < b.type) {
									return -1;
								}
								if (a.duration !== b.duration) {
									return a.duration > b.duration ? -1 : 1;
								}
								return a.todayIndex > b.todayIndex ? 1 : -1;
							})
							.map(({ id, type, title, duration, startBucket }, index) => {
								if (title.length > 23) {
									title = `${title.substring(0, 20)}…`;
								}
								if (duration) {
									title = `${title} (${formatTime(duration)})`;
								}

								const hasNextDuration = duration && (!items[index + 1] || !items[index + 1].duration);

								if (type === 'divider') {
									return '';
								}

								return `
									<a 
										href="things:///show?id=${id}"
										class="schedule-day__item ${duration && 'duration'} ${hasNextDuration && 'no-duration'} ${duration && type}"
										style="${duration ? `width: ${Math.floor(duration * 1.5)}px;` : ''}"
										data-microtip-position="bottom-right"
										role="tooltip"
										aria-label="${title}"></a>
								`;
							})
							.join('')
					}
		          </div>
	          </div>
	        `;
				})
				.join('')
		}</div>`;
	}
};
