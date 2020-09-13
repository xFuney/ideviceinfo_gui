'use strict';

// GUI Management Script

var remote = require("electron").remote;
var ipcRenderer = require("electron").ipcRenderer;

var Page = document.getElementById('page');
var PrintPage = document.getElementById('print_page');

var PageTitle = document.getElementById('title');

var Sidenav = document.getElementById('mobile-demo');
var Sidenav_button = document.getElementById('sidebutton');

var DeviceDB = [];
var DiagDB = [];

function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = Page.innerHTML;

    Page.innerHTML = printContents;

    window.print();

    Page.innerHTML = originalContents;
}

function getDevice() {
    ipcRenderer.send('getDevices')
}

function reboot_device(udid) {
    ipcRenderer.send('restart_device', udid)
}

function shutdown_device(udid) {
    ipcRenderer.send('shutdown_device', udid)
}


function resetPage(st, sn) {
    if (st == "device") {
        Page.innerHTML = `
        <br />
        <center>
          <a class="waves-effect waves-light btn" onmouseup="getDevice();">Go</a>
          <a class="waves-effect waves-light btn" onmouseup="printDiv('print_page');">Print</a>
          <a class="waves-effect waves-light btn red" onmouseup="reboot_device('` + sn + `');" id="rebootbutton" >Reboot</a>
          <a class="waves-effect waves-light btn red" onmouseup="shutdown_device('` + sn + `');" id="shutdownbutton">Shutdown</a>
        </center>
        `
    }

    PrintPage.innerHTML = "";
}

function resetSidebar() {
    Sidenav.innerHTML = `
    <li><a class="white-text" style="font-weight:bold;">Devices</a></li>
    `
}

function getDeviceTable(serial) {
    var found = false;
    for (const n in DeviceDB) {
        if (DeviceDB[n].SerialNumber == serial) {
            found = DeviceDB[n];
        }
    }

    return found;
}

function getDiagTable(serial) {
    var found = false;
    for (const n in DeviceDB) {
        if (DeviceDB[n].SerialNumber == serial) {
            found = DiagDB[n];
        }
    }

    return found;
}

function inspectDevice(serial) {
    // Get device.
    var Device = getDeviceTable(serial);
    var DeviceDiag = getDiagTable(serial);
    //console.log(Device)
    resetPage('device', Device.UniqueDeviceID);
    PageTitle.innerHTML = Device.ProductType + " - iOS " + Device.ProductVersion;
  
    Page.innerHTML += `
    <h4>Device Variant: ` + Device.ProductType + `</h4>
    `

    if(Device.ActivationState != "Activated") {
      Page.innerHTML += '<h3>Device Status: <span class="red-text">Not Activated</span></h3>';
      PrintPage.innerHTML += '<h3>Device Status: <span class="red-text">Not Activated</span></h3>';
    } else {
      Page.innerHTML += '<h3>Device Status: <span class="green-text">Activated</span></h3>';
      PrintPage.innerHTML += '<h3>Device Status: <span class="green-text">Activated</span></h3>';
    }

    var ethAdr = Device.EthernetAddress || "None"
    var hwPlt = Device.HardwarePlatform || Device.CPUArchitecture || "Unknown";

    Page.innerHTML += `
    <h5>System Info</h5>
    <pre><code>
    Hardware Model: ` + Device.HardwareModel + `
    Hardware Platform: ` + hwPlt + `
    Firmware Version: ` + Device.FirmwareVersion +  `
    --------------------------------------------------
    Serial Number: ` + Device.SerialNumber + `
    MLB Serial Number: ` + Device.MLBSerialNumber + `
    Die ID: ` + Device.DieID + `
    --------------------------------------------------
    WiFi Address: ` + Device.WiFiAddress + `
    Bluetooth Address: ` + Device.BluetoothAddress + `
    Ethernet Address: ` + ethAdr + `
    </code></pre>
    `

    PrintPage.innerHTML += `
    <h5><strong>System Info</strong></h5>
    <pre><code_print>
    Hardware Model: ` + Device.HardwareModel + `
    Hardware Platform: ` + hwPlt + `
    Firmware Version: ` + Device.FirmwareVersion +  `
    --------------------------------------------------
    Serial Number: ` + Device.SerialNumber + `
    MLB Serial Number: ` + Device.MLBSerialNumber + `
    Die ID: ` + Device.DieID + `
    --------------------------------------------------
    WiFi Address: ` + Device.WiFiAddress + `
    Bluetooth Address: ` + Device.BluetoothAddress + `
    Ethernet Address: ` + ethAdr + `
    </code_print></pre>
    `

    Page.innerHTML += `
    <h5>Battery Info</h5>
    <pre><code>
    Charge Cycle Count: ` + DeviceDiag.GasGauge.CycleCount + `
    Battery Design Capacity: ` +  DeviceDiag.GasGauge.DesignCapacity + `mAh
    Full Charge Capacity: ` + DeviceDiag.GasGauge.FullChargeCapacity +  `%
    </code></pre>
    `

    PrintPage.innerHTML += `
    <h5><strong>Battery Info</strong></h5>
    <pre><code_print>
    Charge Cycle Count: ` + DeviceDiag.GasGauge.CycleCount + `
    Battery Design Capacity: ` +  DeviceDiag.GasGauge.DesignCapacity + `mAh
    Full Charge Capacity: ` + DeviceDiag.GasGauge.FullChargeCapacity +  `%
    </code_print></pre>
    `

    if (Device.TelephonyCapability) {
        var iccid = Device.IntegratedCircuitCardIdentity || "No SIM";
        var imei = Device.InternationalMobileEquipmentIdentity || "None - Potential Bad Baseband";
        var imsi = Device.InternationalMobileSubscriberIdentity || "None - Potential Bad Baseband";
        var carrier = Device.CarrierBundleInfoArray[0].CFBundleIdentifier || "Not Identified";

        Page.innerHTML += `
        <h5>Cellular Information</h5>
        <pre><code>
    ICCID: ` + iccid + `
    IMEI: ` + imei + `
    IMSI: ` + imsi + `
    
    Carrier: ` + carrier + `
        </code></pre>
        `
    
        PrintPage.innerHTML += `
        <h5><strong>Cellular Information</strong></h5>
        <pre><code_print>
    ICCID: ` + iccid + `
    IMEI: ` + imei + `
    IMSI: ` + imsi + `
    
    Carrier: ` + carrier + `
        </code_print></pre>
        `
      }

}

function addDevice(device, diag) {
    DeviceDB.push(device);
    DiagDB.push(diag)
    var devName = device.DeviceName || device.SerialNumber
    Sidenav.innerHTML += `<li><a class="white-text" onmouseup="inspectDevice('` + device.SerialNumber + `');">` + devName + `</a></li>`
}

function setPage(type) {
    if (type == "error") {
        resetPage();
        Sidenav_button.style.display = "block";
        Page.innerHTML += '<h4 class="red-text">Error Encountered</span>';
        Page.innerHTML += `<pre><code>
    1. Check device is trusted (>iOS 6), you must be able to unlock and press
       TRUST on the screen of the device if you haven't trusted this system already.
    2. Ensure proper cable connection at both ends of the device, make sure the cable
       you are using is not damaged.
    3. Report this issue.
        </code></pre>`
    } else if (type == "wait") {
        Sidenav_button.style.display = "none";
        Page.innerHTML = "<h4>Gathering info...</h4>";
    } else if (type == "done") {
        resetPage();
        Sidenav_button.style.display = "block";
        Page.innerHTML += '<h4 class="green-text">Success!</span></h4><h5>You can now select a device in the sidebar to inspect.</h5>';
    }
}

function playAudio(type) {
    if (type == "waiting") {
        document.getElementById('au_fail').pause();
        document.getElementById('au_ok').pause();
        document.getElementById('au_wait').currentTime = 0;
        document.getElementById('au_wait').play();
    } else if (type == "ok") {
        document.getElementById('au_wait').pause();
        document.getElementById('au_fail').pause();
        document.getElementById('au_ok').currentTime = 0;
        document.getElementById('au_ok').play();
    } else if (type == "fail") {
        document.getElementById('au_wait').pause();
        document.getElementById('au_ok').pause();
        document.getElementById('au_fail').currentTime = 0;
        document.getElementById('au_fail').play();
    } else if (type == "device_disappear") {
        document.getElementById('au_deviceleave').currentTime = 0;
        document.getElementById('au_deviceleave').play();
    }
}

ipcRenderer.on('got_device', (event, db) => {
    console.log("[RENDERER] Main process has got a device.");
    resetSidebar();
    setPage('wait');
    playAudio("waiting")
});

ipcRenderer.on('new_device', (event, device, out) => {
    console.log(device)
    console.log(out)
    addDevice(device, out)
})

ipcRenderer.on('success', (event, result) => {
    playAudio('ok');
    setPage('done');
    console.log(result);
})

ipcRenderer.on('shutdown_ok', (event, udid) => {
    playAudio('device_disappear');
    document.getElementById('shutdownbutton').classList.add("disabled");
    document.getElementById('rebootbutton').classList.add("disabled");
})

ipcRenderer.on('reboot_ok', (event, udid) => {
    playAudio('device_disappear');
    document.getElementById('shutdownbutton').classList.add("disabled");
    document.getElementById('rebootbutton').classList.add("disabled");
})

ipcRenderer.on('lame_err', (event, error) => {
    playAudio('fail');
    setPage('error');
    console.log(error)
})

// Tell IPC we're loaded.
ipcRenderer.send("client_load")

console.log("[GUI_MGMT] Loaded")