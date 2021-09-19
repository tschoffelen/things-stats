const { contextBridge, ipcRenderer } = require('electron');
const dateFns = require('date-fns');

contextBridge.exposeInMainWorld('db', {
	query: (query) => {
		return new Promise((resolve, reject) => {
			let responded = false;
			ipcRenderer.once('query-rows', (event, arg) => {
				if (responded) return;
				responded = true;
				resolve(arg);
			});

			ipcRenderer.once('query-error', (event, arg) => {
				if (responded) return;
				responded = true;
				reject(arg);
			});

			ipcRenderer.send('query', query);
		});
	}
});

contextBridge.exposeInMainWorld('dateFns', dateFns);
