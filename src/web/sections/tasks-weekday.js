export default {
	title: 'Completed by weekday',
	render: async() => {
		let rows = await db.query('SELECT stopDate FROM TMTask WHERE type = 0 AND status = 3');
		let months = {
			'Monday': 0,
			'Tuesday': 0,
			'Wednesday': 0,
			'Thursday': 0,
			'Friday': 0,
			'Saturday': 0,
			'Sunday': 0
		};
		rows.forEach(row => {
			const month = dateFns.format(new Date(Math.round(parseFloat(row.stopDate)) * 1000), 'EEEE');
			months[month]++;
		});

		return {
			type: 'bar',
			data: {
				labels: Object.keys(months),
				datasets: [{
					data: Object.values(months),
					backgroundColor: '#f9d448'
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
		};
	}
};
