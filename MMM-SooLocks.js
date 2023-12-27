Module.register('MMM-SooLocks', {
    // Default module config.
    defaults: {
        showImages: false,
        numberOfShips: 5,
        fetchInterval: 30 * 60 * 1000,
    },

    start: function () {
        this.getBoatInfo();
        setInterval(() => {
            this.getBoatInfo();
        }, this.config.fetchInterval);
    },

    getHeader: function () {
        return 'Soo Locks';
    },

    getStyles: function () {
        return ['MMM-SooLocks.css'];
    },

    // Override dom generator.
    getDom: function () {
        let wrapper = document.createElement('div');
        wrapper.id = 'boatScheduleWrapper';
        wrapper.innerHTML = 'Loading boat data...';
        return wrapper;
    },

    getBoatInfo: function () {
        this.sendSocketNotification('GET_BOAT_INFO', this.config.numberOfShips);
    },

    processBoatInfo: function (data) {
        let boatScheduleWrapper = document.getElementById(
            'boatScheduleWrapper'
        );
        boatScheduleWrapper.innerHTML = '';

        for (let ship of data.rows) {
            let info = document.createElement('tr');

            let vessel_name = document.createElement('div');
            vessel_name.className = 'xsmall';
            vessel_name.innerText = ship.vessel_name.split(';')[0];

            let vessel_direction = document.createElement('div');
            vessel_direction.className = 'xsmall';
            vessel_direction.innerText = `${ship.direction_lbl} @ ${ship.destination_eta}`;

            let vessel_destination = document.createElement('div');
            vessel_destination.className = 'xsmall';
            vessel_destination.innerText = `Dest: ${
                ship.destination || 'Not Available'
            }`;

            let vessel_image = document.createElement('img');
            vessel_image.src = ship.vessel_name.split(';')[4];
            vessel_image.width = '100';
            vessel_image.style = 'aspect-ratio:3/2';

            info.append(vessel_name, vessel_direction, vessel_destination);
            if (this.config.showImages) info.append(vessel_image);
            info.append(document.createElement('hr'));
            boatScheduleWrapper.appendChild(info);
        }

        boatScheduleWrapper.appendChild(this.getTimeStamp());
    },

    getTimeStamp: function () {
        let timeStamp = document.createElement('div');
        timeStamp.className = 'xsmall dimmed';
        timeStamp.innerText = `Last Updated:\n${new Date().toLocaleString(
            'en-US'
        )}`;
        return timeStamp;
    },

    // socketNotificationReceived from helper
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'FAILED_TO_FETCH') {
            let boatScheduleWrapper = document.getElementById(
                'boatScheduleWrapper'
            );
            boatScheduleWrapper.innerText = payload;
            boatScheduleWrapper.appendChild(this.getTimeStamp());
        } else if (notification === 'BOAT_LOCATIONS') {
            this.processBoatInfo(payload);
        }
    },
});
