'use strict';

// Initialise electron.
const { app, BrowserWindow, Tray, dialog } = require('electron');
const ipc = require('electron').ipcMain;

const iDeviceKit = require('idevicekit');
const axios = require('axios');
const idevicekit = require('idevicekit');
//const usbDetect = require('usb-detection');
 


//usbDetect.startMonitoring();

// Initialise ipcWindow variable for global use in this script.
var ipcWindow;

function getAppleInfo(sn) {
    const response = axios.get('https://di-api.reincubate.com/v1/apple-serials/' + sn + '/').then( (resp) => {
        return JSON.parse(response.body.explanation)
    }).catch( (err) => {
        console.log(err)
    })
          
}
async function getDevices() {

    var devicesTable = [];

    ipcWindow.webContents.send('got_device');
    try {
        iDeviceKit.listDevices().then( (res) => {
            var resI = 0;
            for (const n in res) {
                if (res.length == 1) {
                    //resI = n+1;
                } else {
                    resI = n;
                }


                iDeviceKit.getProperties(res[n])
                .then( (result) => {
                    // Got device.
                    iDeviceKit.diagnostics(res[n]).then( (out) => {
                        ipcWindow.webContents.send('new_device', result, out)
                    })
                    
                    
                })
                .catch( (error) => {
                    // Failed to get properties, all failed.
                    ipcWindow.webContents.send('lame_err', error)
                });
            }
            

            var interval = setInterval(function() {
                if (resI == res.length-1) {
                    if (res.length == 0) {
                        console.log("No devices.")
                        ipcWindow.webContents.send("lame_err", "no_devices");
                        clearInterval(interval)
                        return
                    }
                    console.log("Done!")
                    ipcWindow.webContents.send('success', "blar")
                    clearInterval(interval)
                } else {
                    console.log("resI " + resI)
                    console.log("res length " + res.length)
                }
            },1000)

            
        })
        .catch( (error) => {
            // Failed to list devices (catch 1)
            ipcWindow.webContents.send('lame_err', error)
        })
    } catch(error) {
        // Failed to list devices (failsafe).
        ipcWindow.webContents.send('lame_err', error)
    }

}

module.exports.init = function() {
    // Auto-trigger for USB plug.
    //usbDetect.on('change', function(device) {
        //getDevices();
    //});

    ipc.on('client_load', () => {
        console.log("[IPC] Client has confirmed loaded status.");
    });

    ipc.on('getDevices', () => {
        getDevices();
    })

    ipc.on('shutdown_device', (event, udid) => {
        iDeviceKit.shutdown(udid).then( () => {
            ipcWindow.webContents.send('shutdown_ok', udid)
        }).catch( ( err ) => {
            console.log("Error shutting down device.")
            console.log(err)
        });
    })

    ipc.on('restart_device', (event, udid) => {
        iDeviceKit.reboot(udid).then( () => {
            ipcWindow.webContents.send('reboot_ok', udid)
        }).catch( ( err ) => {
            console.log("Error rebooting device.")
            console.log(err)
        });
    })

    console.log("[IPC] IPC has been initialised.");
}

module.exports.setWindow = function(window) {
    console.log("[IPC] Binded window has been changed.");
    ipcWindow = window;
}