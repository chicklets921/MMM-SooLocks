const NodeHelper = require('node_helper');
const Log = require('logger');

module.exports = NodeHelper.create({
    start() {
        Log.log(`Starting module helper: ${this.name}`);
    },

    stop() {
        Log.log(`Stopping module helper: ${this.name}`);
    },

    async fetchBoatData(config) {
        const { numberOfShips, maxRetries, retryDelay } = config;
        const nodeVersion = process.versions.node;

        const headers = {
            'User-Agent': `Mozilla/5.0 (Node.js ${nodeVersion}) MagicMirror/${global.version}`,
            'Cache-Control': 'max-age=0, no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
        };
        const url = `https://ais.boatnerd.com/passage/getPassageData?search=&sort=destination_eta&order=desc&offset=0&limit=${numberOfShips}&port=12`;

        const attemptFetch = async (attempt) => {
            try {
                const response = await fetch(url, { headers });
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
                if (attempt < maxRetries) {
                    const delay = retryDelay * Math.pow(2, attempt);
                    const attemptNumber = attempt + 1;
                    Log.error(
                        'Unable to fetch -',
                        err,
                        `Retry ${attemptNumber}/${maxRetries} in ${delay / 1000}s`
                    );
                    this.sendSocketNotification(
                        'FETCH_RETRY',
                        `Retry ${attemptNumber}/${maxRetries} in ${Math.round(
                            delay / 1000
                        )}s...`

                    );
                    setTimeout(() => attemptFetch(attempt + 1), delay);
                } else {
                    Log.error('********** Unable to fetch after retries -', err);
                    this.sendSocketNotification(
                        'FAILED_TO_FETCH',
                        'Failed to get boat data.\nPlease restart device\nor wait until the next reload.'
                    );
                }
            }
        };

        attemptFetch(0);
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
