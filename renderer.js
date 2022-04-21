// Windows: electron-packager ./ ics --platform=win32 --arch=x64 --electron-version=8.1.1
// Mac: electron-packager . daq-software --overwrite --platform=darwin --arch=x64 --prune=true --out=out
// Linux: electron-packager . electron-tutorial-app --overwrite --asar=true --platform=linux --arch=x64 --prune=true --out=out


// Require Statements
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { ipcRenderer } = require('electron');

var popOut = false;
var inter = 0;

(function($) {
    $(document).ready(function() {        

        setInterval(function () {
            SerialPort.list().then(function(ports){
                if (inter < 1) {
                    $("#select-port").append(`<option>${ports[0].path}</option>`);
                    inter++;
                }
            });
        },300)

        $("#submit-select").on('click', function() {
            if ($("#select-port option:selected").text() != "Select Port") {
                $("#port-container").hide();
                // Set MyGlobalVariable.
                ipcRenderer.send( "setPort",  $("#select-port option:selected").text());
                ipcRenderer.on( "port-val", (event, gPort) => {
                    const port = new SerialPort({
                        path: gPort,
                        baudRate:115200,
                        parser: new ReadlineParser("\n")
                    });    
                    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));// Read the port data
                    var selector, date, newDate;
                    var recordData = false;
                    var i = 0;
                    var index = 0;
                    var time = [];
                    var values = [];
                    var record = [];
                    
                    $("#popout").on('click', function() {
                        popOut = true;
                        port.close(function (err) {
                            console.log('port closed', err);
                        });

                        ipcRenderer.send( "popout" );
                    })

                    // Open Serial Port
                    port.on("open", () => {
                        console.log('serial port open');
                        popOut = false;
                    });

                    port.on("close", () => {
                        if (!popOut) {
                            $("#port-container").show();
                            $("#select-port").html('<option>Select Port</option>');
                            inter = 0;

                            $("#voltval").text("0.00 V");
                            $("#currentval").text("0.00 A");
                            $("#capval").text("0.00 nF");
                            $("#indval").text("0.00 mT");
                            $("#magval").text("0.00 mH");
                            $("#current, #cap, #mag, #ind, #voltage").css("border-color","#ddd");
                        }
                    })

                    // Read data realtime
                    parser.on('data', data => {
                        selector = data.substring(0,1);
                        date = new Date();
                        newDate = date.toString().slice(4,25);
                        
                        if (data.trim() == "switch") {
                            $("#voltval").text("0.00 V");
                            $("#currentval").text("0.00 A");
                            $("#capval").text("0.00 nF");
                            $("#indval").text("0.00 mT");
                            $("#magval").text("0.00 mH");
                        }

                        switch (Number(selector)) {
                            case 1:
                                $("#voltval").text(data.substring(1) + "V");
                                $("#voltage").css("border-color","#00A8FF");
                                $("#current, #cap, #mag, #ind").css("border-color","#ddd");
                                break;
                            case 2:
                                $("#currentval").text(data.substring(1) + "A");
                                $("#current").css("border-color","#00A8FF");
                                $("#voltage, #cap, #mag, #ind").css("border-color","#ddd");
                                break;
                            case 3:
                                $("#capval").text(data.substring(1));
                                $("#cap").css("border-color","#00A8FF");
                                $("#current, #voltage, #mag, #ind").css("border-color","#ddd");
                                break;
                            case 4:
                                $("#indval").text(data.substring(1) + "mH");
                                $("#ind").css("border-color","#00A8FF");
                                $("#current, #cap, #mag, #voltage").css("border-color","#ddd");
                                break;
                            case 5:
                                $("#magval").text(data.substring(1) + "mT");
                                $("#mag").css("border-color","#00A8FF");
                                $("#current, #cap, #voltage, #ind").css("border-color","#ddd");
                                break;
                            default:
                                break;
                        }

                        if (recordData == true) {
                            time[index] = newDate;
                            values[index] = data.substring(1);
                            record[index] = {
                                time: time[index],
                                value: values[index]
                            };
                            $("#data").text(values.length + " Data Points");
                            index++;
                        }
                        i++;
                    });

                    $("#download").on('click', function() {
                        ipcRenderer.send('show-dialog', record);
                    });
                    $("#record").on('click', function() {
                        if (recordData == false) {
                            recordData = true;
                            $("#record").text("Stop Recording");
                        } else {
                            recordData = false;
                            $("#record").text("Record Data");
                        }
                    });
                    $("#restart").on('click', function() {
                        time = [];
                        values = [];
                        record = [];
                        index = 0;
                        $("#data").text(values.length + " Data Points");
                        $("#notice").hide();
                    })
                    
                })

                
                
            }
        })   
            
        
        

    });
})( jQuery );