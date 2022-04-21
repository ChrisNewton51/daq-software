// Require Statements
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline');
const { ipcRenderer } = require('electron');
var Chart = require('chart.js');


(function($) {
    $(document).ready(function() {
        ipcRenderer.send( "getPort" );
        ipcRenderer.on( "popout-port", (event, gPort) => {
            // Variable Definitions
            const port = new SerialPort({
                path: gPort,
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
                options: {
                    plugins:{   
                        legend: {
                            display: false
                        },
                    }    
                }
            });

            // Open Serial Port
            port.on("open", () => {
                console.log('serial port open');
            });

            var switchG;

            // Read data realtime
            parser.on('data', data => {
                if (data.trim() == "switch") {
                    reset = true;
                }

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
                        options: {
                            plugins:{   
                                legend: {
                                    display: false
                                },
                            }    
                        }
                    });
                }
                selector = data.substring(0,1);
                
                xAxis[index] = i;
                /*\\if (index > 20) {
                    xAxis.shift();
                    dataArray.shift();
                    dataArray[index] = number;
                }*/
                chart.update();

                $("#value").text(data.substring(1) + "uF");
                switch (Number(selector)) {
                    case 1:
                        number = Number(data.substring(1))
                        dataArray[index] = number;
                        $("#value").text(data.substring(1) + "V");
                        $("#title").text("Voltage");
                        break;
                    case 2:
                        number = Number(data.substring(1))
                        dataArray[index] = number;
                        $("#value").text(data.substring(1) + "A");
                        $("#title").text("Current");
                        break;
                    case 3:
                        var capVal = data.substring(1);
                        capVal = capVal.slice(0,-4);
                        number = Number(capVal)
                        dataArray[index] = number;
                        $("#value").text(data.substring(1));
                        $("#title").text("Capacitance");
                        break;
                    case 4:
                        number = Number(data.substring(1))
                        dataArray[index] = number;
                        $("#value").text(data.substring(1) + "mH");
                        $("#title").text("Inductance");
                        break;
                    case 5:
                        number = Number(data.substring(1))
                        dataArray[index] = number;
                        $("#value").text(data.substring(1) + "mT");
                        $("#title").text("Magnetic Field");
                        break;
                    default:
                        break;
                }

                i++;
                index++;
            });

            $("#clear").on('click', function() {
                reset = true;
            })

            document.getElementById("back").addEventListener("click", () => {
                
                port.close(function (err) {
                    console.log('port closed', err);
                });
                ipcRenderer.send('setPort', gPort);
                window.close();
            }, false);
        })
    });
})( jQuery );