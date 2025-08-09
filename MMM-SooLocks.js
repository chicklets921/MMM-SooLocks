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
        const boatScheduleWrapper = document.getElementById(
            'boatScheduleWrapper'
        );
        boatScheduleWrapper.innerHTML = '';

        const fragment = document.createDocumentFragment();

        for (const ship of data.rows) {
            const info = document.createElement('tr');

            const vesselParts = ship.vessel_name.split(';');

            const vessel_name = document.createElement('div');
            vessel_name.className = 'xsmall';
            vessel_name.innerText = vesselParts[0];

            const vessel_direction = document.createElement('div');
            vessel_direction.className = 'xsmall';
            vessel_direction.innerText = `${ship.direction_lbl} @ ${ship.destination_eta}`;

            const vessel_destination = document.createElement('div');
            vessel_destination.className = 'xsmall';
            vessel_destination.innerText = `Dest: ${
                ship.destination || 'Not Available'
            }`;

            info.append(vessel_name, vessel_direction, vessel_destination);

            if (this.config.showImages) {
                const vessel_image = document.createElement('img');
                vessel_image.src = vesselParts[4];
                vessel_image.width = '100';
                vessel_image.style = 'aspect-ratio:3/2';
                info.append(vessel_image);
            }

            info.append(document.createElement('hr'));
            fragment.appendChild(info);
        }

        boatScheduleWrapper.appendChild(fragment);
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
