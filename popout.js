(function($) {
    $(document).ready(function() {
        // Require Statements
        const { SerialPort } = require('serialport')
        const { ReadlineParser } = require('@serialport/parser-readline');
        const { ipcRenderer } = require('electron');
        var Chart = require('chart.js');

        // Variable Definitions
        const port = new SerialPort({
            path:'COM5',
            baudRate:115200,
            parser: new ReadlineParser("\n")
        });
        const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));// Read the port data
        var vsel = false;
        var selector;
        var dataArray = [];
        var xAxis = [];
        var i = 0;
        var index = 0;
        var number, ctx, chart, reset;

        ctx = document.getElementById('chart').getContext('2d');
        
        chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: xAxis,
                datasets: [{
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "rgba(0,168,255,0.4)",
                    borderColor: "rgba(0,168,255,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(0,168,255,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(0,168,255,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: dataArray,
                    spanGaps: false,
                }]
            },
            // Configuration options go here
            options: {}
        });

        // Open Serial Port
        port.on("open", () => {
            console.log('serial port open');
        });

        // Read data realtime
        parser.on('data', data => {
            if(reset) {
                dataArray = [];
                xAxis = [];
                i = 0;
                index = 0;
                reset = false;
                chart.destroy();
                chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'line',
        
                    // The data for our dataset
                    data: {
                        labels: xAxis,
                        datasets: [{
                            fill: false,
                            lineTension: 0.1,
                            backgroundColor: "rgba(0,168,255,0.4)",
                            borderColor: "rgba(0,168,255,1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(0,168,255,1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 1,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: "rgba(0,168,255,1)",
                            pointHoverBorderColor: "rgba(220,220,220,1)",
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 10,
                            data: dataArray,
                            spanGaps: false,
                        }]
                    },
                    // Configuration options go here
                    options: {}
                });
            }
            selector = data.substring(0,1);
            
            xAxis[index] = i;
            /*\\if (index > 20) {
                xAxis.shift();
                dataArray.shift();
                dataArray[index] = number;
            }*/
            number = Number(data.substring(1))
            dataArray[index] = number;
            chart.update();
            console.log(xAxis)

            $("#value").text(data.substring(1) + "uF");
            switch (Number(selector)) {
                case 1:
                    $("#value").text(data.substring(1) + "V");
                    break;
                case 2:
                    $("#value").text(data.substring(1) + "A");
                    break;
                case 3:
                    $("#value").text(data.substring(1) + "nF");
                    break;
                case 4:
                    $("#value").text(data.substring(1) + "H");
                    break;
                case 5:
                    $("#value").text(data.substring(1) + "T");
                    break;
                default:
                    break;
            }

            i++;
            index++;
        });

        document.getElementById("back").addEventListener("click", () => {
            // Some data that will be sent to the main process
            let Data = {};
            window.close();
            port.close(function (err) {
                console.log('port closed', err);
            });
            ipcRenderer.send('request-port-open', Data);
        }, false);

        $("#clear").on('click', function() {
            reset = true;
        })

    });
})( jQuery );