const NodeHelper = require('node_helper');
const Log = require('logger');

module.exports = NodeHelper.create({
    start() {
        Log.log(`Starting module helper: ${this.name}`);
    },

    stop() {
        Log.log(`Stopping module helper: ${this.name}`);
    },

    async fetchBoatData({ numberOfShips, fetchTimeout = 10 * 1000 }) {
        const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
        const headers = {
            'User-Agent': `Mozilla/5.0 (Node.js ${nodeVersion}) MagicMirror/${global.version}`,
            'Cache-Control': 'max-age=0, no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
        };
        const url = `https://ais.boatnerd.com/passage/getPassageData?search=&sort=destination_eta&order=desc&offset=0&limit=${numberOfShips}&port=12`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), fetchTimeout);

        try {
            const response = await fetch(url, { headers, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const data = await response.json();
            if (!data || !Array.isArray(data.rows)) {
                throw new Error('Malformed data structure received');
            }
            Log.info('Pulling info...');
            this.sendSocketNotification('BOAT_LOCATIONS', data);
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                Log.error('********** Fetch timeout -', err);
                this.sendSocketNotification('FETCH_RETRY');
            } else {
                Log.error('********** Unable to fetch -', err);
                this.sendSocketNotification(
                    'FAILED_TO_FETCH',
                    'Failed to get boat data.\nPlease restart device\nor wait until the next reload.'
                );
            }
        }
    },

    socketNotificationReceived: function (notification, payload) {
        Log.info(`${this.name}: Starting to fetch schedule...`);
        if (notification === 'GET_BOAT_INFO') {
            this.fetchBoatData(payload);
        } else {
            Log.warn(`${this.name}: Unknown notification ${notification}`);
        }
    },
});
