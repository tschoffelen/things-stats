export default {
	title: 'Completed by month',
	render: async() => {
		const fromDate = Math.floor((new Date()).valueOf() / 1000) - 365 * 86400;
		const rows = await db.query(`SELECT stopDate FROM TMTask WHERE type = 0 AND status = 3 AND stopDate > ${fromDate}`);
		const months = {
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
		};
		rows.forEach(row => {
			const month = dateFns.format(new Date(Math.round(parseFloat(row.stopDate)) * 1000), 'MMMM');
			months[month]++;
		});

		return {
			type: 'horizontalBar',
			data: {
				labels: Object.keys(months),
				datasets: [{
					data: Object.values(months),
					backgroundColor: '#4dabf1'
				}]
			},
			options: {
				plugins: {
					datalabels: {
						display: false
					}
				},
				scales: {
					xAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				},
				legend: {
					display: false
				}
			}
		};
	}
};
