# MMM-SooLocks

This is a module for the [MagicMirror²-Project](https://github.com/MichMich/MagicMirror/).

It displays current ship information for the Soo Locks

## Example

![](data/ship_data.png)

## Installation

Assuming `~/MagicMirror` is the directory where you installed MagicMirror².

### Clone and install

```bash
cd ~/MagicMirror/modules
git clone https://gitlab.com/chicklets921/MMM-SooLocks.git
```

### Update your config.js file

Add a configuration block to the modules array in the `~/MagicMirror/config/config.js` file:

```js
var config = {
    modules: [
        {
            module: 'MMM-SooLocks',
            position: 'top_right',
            config: {
                frequency: 30 * 60 * 1000,
            },
        },
    ],
};
```

This is the only config setup for now. More features may be added in the future.

## Update to new versions

Assuming `~/MagicMirror` is the directory where you installed MagicMirror².

```bash
cd ~/MagicMirror/modules/MMM-SooLocks
git pull
```

## Known issues and limitations

-   No error handing for now but that will be added soon
-   Need to add 'Last Updated' timestamp to make sure data is fresh
