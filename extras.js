(function($) {
    $(document).ready(function() {
        // Require Statements
        const { SerialPort } = require('serialport')
        const { ReadlineParser } = require('@serialport/parser-readline');
        var Chart = require('chart.js');
        const { ipcRenderer } = require('electron');

        // Variable Definitions
        const port = new SerialPort({
            path:'COM4',
            baudRate:115200,
            parser: new ReadlineParser("\n")
        });
        const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));// Read the port data
        var selector;
        var dataArray = [];
        var i = 0;

        ipcRenderer.on('open-port', (event, arg) => {
            port.open();
        });
        
        $("#popout").on('click', function() {
            port.close(function (err) {
                console.log('port closed', err);
            });
        })

        // Open Serial Port
        port.on("open", () => {
            console.log('serial port open');
        });

        // Read data realtime
        parser.on('data', data =>{
            selector = data.substring(0,1);
            i++;
            dataArray[i] = i + 1;
            switch (Number(selector)) {
                case 1:
                    $("#voltval").text(data.substring(1) + "V");
                    break;
                case 2:
                    $("#currentval").text(data.substring(1) + "A");
                    break;
                case 3:
                    $("#capval").text(data.substring(1));
                    break;
                case 4:
                    $("#indval").text(data.substring(1) + "H");
                    break;
                case 5:
                    $("#magval").text(data.substring(1) + "T");
                    break;
                default:
                    break;
            }
        });

    });
})( jQuery );