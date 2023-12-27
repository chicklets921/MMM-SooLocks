const NodeHelper = require('node_helper');
const Log = require('logger');

module.exports = NodeHelper.create({
    start() {
        Log.log(`Starting module helper: ${this.name}`);
    },

    stop() {
        Log.log(`Stopping module helper: ${this.name}`);
    },

    fetchBoatData(numberOfShips) {
        const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
        const headers = {
            'User-Agent': `Mozilla/5.0 (Node.js ${nodeVersion}) MagicMirror/${global.version}`,
            'Cache-Control': 'max-age=0, no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
        };
        let url = `https://ais.boatnerd.com/passage/getPassageData?search=&sort=destination_eta&order=desc&offset=0&limit=${numberOfShips}&port=12`;

        let data = fetch(url, { headers: headers })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                Log.info('Pulling info...');
                this.sendSocketNotification('BOAT_LOCATIONS', data);
            })
            .catch((err) => {
                Log.error('********** Unable to fetch -', err);
                this.sendSocketNotification(
                    'FAILED_TO_FETCH',
                    'Failed to get boat data.\nPlease restart device\nor wait until the next reload.'
                );
            });
    },

    socketNotificationReceived: function (notification, payload) {
        Log.info(`${this.name}: Starting to fetch schedule...`);
        if (notification === 'GET_BOAT_INFO') {
            this.fetchBoatData(payload);
        }
    },
});
