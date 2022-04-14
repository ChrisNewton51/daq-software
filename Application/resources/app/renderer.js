// electron-packager ./ ics --platform=win32 --arch=x64 --electron-version=8.1.1


// Require Statements
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { ipcRenderer } = require('electron');
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(function($) {
    $(document).ready(function() {        
        SerialPort.list().then(function(ports){
            $("#select-port").append(`<option>${ports[0].path}</option>`)
        });

        $("#submit-select").on('click', function() {
            if ($("#select-port option:selected").text() != "Select Port") {
                $("#port-container").hide();
                //global.port.com = $("#select-port option:selected").text();
                
                // Set MyGlobalVariable.
                ipcRenderer.send( "setPort",  $("#select-port option:selected").text());
                console.log(remote.getGlobal( "port" ));
                
                // Variable Definitions
                const port = new SerialPort({
                    path: remote.getGlobal( "port" ),
                    baudRate:115200,
                    parser: new ReadlineParser("\n")
                });         

                ipcRenderer.on('open-port', (event, arg) => {
                    port.open();
                });

                const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));// Read the port data
                var selector, date, newDate, path;
                var recordData = false;
                var i = 0;
                var index = 0;
                var time = [];
                var values = [];
                var record = [];
                
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
                            break;
                        case 2:
                            $("#currentval").text(data.substring(1) + "A");
                            break;
                        case 3:
                            $("#capval").text(data.substring(1));
                            break;
                        case 4:
                            $("#indval").text(data.substring(1) + "mH");
                            break;
                        case 5:
                            $("#magval").text(data.substring(1) + "mT");
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
            }
        })   
            
        $("#play").on('click', function() {
            let options = {
                // See place holder 1 in above image
                title : "Select File Location", 

                properties: ['openDirectory']
            }
            var newPath;

            dialog.showOpenDialog(options)
                .then(filePaths => {
                    path = String(filePaths.filePaths)
                    newPath = path.replace("undefined", "")
                    newPath = newPath + "\\data.csv";
                    const csvWriter = createCsvWriter({
                        path: newPath,
                        header: [
                            {id: 'time', title: 'Time'},
                            {id: 'value', title: 'Value'},
                        ]
                    });
            
                    csvWriter
                        .writeRecords(record)
                        .then(()=> console.log('The CSV file was written successfully'));

                    $("#notice").text("File has been downloaded at " + newPath);
                })
            
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
        

    });
})( jQuery );