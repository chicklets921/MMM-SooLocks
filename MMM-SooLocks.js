Module.register('MMM-SooLocks', {
    // Default module config.
    defaults: {
        text: 'Loading boat data...',
        frequency: 30 * 60 * 1000,
    },

    start: function () {
        this.sendSocketNotification(
            'GET BOAT INFO',
            'Starting to fetch schedule...'
        );
        setInterval(() => {
            this.sendSocketNotification(
                'GET BOAT INFO',
                'Starting to fetch schedule...'
            );
        }, this.config.frequency);
    },

    processBoatInfo: function (data) {
        let boatScheduleWrapper = document.getElementById(
            'boatScheduleWrapper'
        );
        boatScheduleWrapper.innerHTML = '';
        for (let ship of data.rows) {
            let info = document.createElement('tr');
            info.innerHTML = `<div class='small'>${
                ship.vessel_name.split(';')[0]
            }</div><div class='small'>${ship.direction_lbl} @ ${
                ship.destination_eta
            }</div><div class='small'>Dest: ${ship.destination}</div><hr />`;
            boatScheduleWrapper.appendChild(info);
        }
    },

    // Override dom generator.
    getDom: function () {
        let wrapper = document.createElement('div');
        wrapper.id = 'boatScheduleWrapper';
        wrapper.innerHTML = this.config.text;
        return wrapper;
    },
    getHeader: function () {
        return 'Soo Locks';
    },
    // socketNotificationReceived from helper
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'BoatLocations') {
            this.processBoatInfo(payload);
        }
    },
});
