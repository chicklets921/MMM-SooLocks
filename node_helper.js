var NodeHelper = require('node_helper');
const Log = require('logger');

let url =
    'https://ais.boatnerd.com/passage/getPassageData?search=&sort=destination_eta&order=desc&offset=0&limit=10&port=12';
module.exports = NodeHelper.create({
    start() {
        Log.log(`Starting module helper:${this.name}`);
    },

    stop() {
        Log.log(`Stopping module helper: ${this.name}`);
    },
    async fetchBoatData(url) {
        let data = fetch(url)
            .then((response) => {
                return response.json();
            })
            .catch(function (err) {
                Log.log('Unable to fetch -', err);
            });
        this.sendSocketNotification('BoatLocations', await data);
    },
    socketNotificationReceived: function (notification, payload) {
        Log.log(`${this.name}: ${payload}`);
        if (notification === 'GET BOAT INFO') {
            this.fetchBoatData(url);
        }
    },
});
