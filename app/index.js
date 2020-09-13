'use strict';

// iDeviceInfo_GUI
// Funey, 2020

// Initialise Electron app constant in this script, to set App ID and other pre-requesites.
const { app } = require('electron');

const releaseInformation = require("./releaseInfo")

// Get application-wide constants.
const AppConstants = require('../common/AppConstants');

// Display versioning information to log.
console.log("iDeviceInfo GUI " + releaseInformation.version);
console.log("On release branch: " + releaseInformation.branch);

if ( process.platform == 'win32' ) {
    // Windows can be a bit dodgy with icons and stuff.
    // This (apparently) fixes it.

    console.log("[LOADER] Win32 platform detected, setting App User Model ID.")
    app.setAppUserModelId(AppConstants.Global_AppID)
}

console.log("[INIT] Handing off to interface...")
require('./interface')