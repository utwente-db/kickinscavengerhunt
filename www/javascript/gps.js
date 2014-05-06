/*
 * requires file.js
 */

// variables
var gpsTimeoutVal = 60000;
var lastPosition;
var GPS_FILE_NAME = "gpsdata.txt";
var watchID = null;
var gpsOn = false;
var gpsFileWriter = null;

function startGPSTracking() {
    watchID = navigator.geolocation.watchPosition(onGPSSuccess, onGPSError, {enableHighAccuracy: true, timeout: gpsTimeoutVal, maximumAge: 0 });
}

function endGPSTracking() {
	navigator.geolocation.clearWatch(watchID);
}

/**
 * onGPSSuccess receives a Position object
 */
function onGPSSuccess(position) {
	gpsOn = true;
	lastPosition = position;
	
	if (gpsFileWriter == null) {
		// Possibly resetting gpsFileWriter, skip this coordinate
		return;
	}
	
	message = "" + position.coords.latitude + "," + position.coords.longitude + "," + position.coords.altitude + "," + position.coords.accuracy
				 + "," + position.coords.altitudeAccuracy + "," + position.coords.heading + "," + position.coords.speed + "," + position.timestamp + "\n";          		

	gpsFileWriter.write(message);
	$(document).trigger('gps:success');
}

/**
 * onGPSError Callback receives a PositionError object
 */
function onGPSError(error) {
	// TODO: write error to log file
	gpsOn = false;
}

function isGpsOn() {
	return gpsOn;
}

function createGPSFile() {
	applicationDirectory.getFile(GPS_FILE_NAME, {
		create : true,
		exclusive : false
	}, createGPSFileWriter, fail);
}

function createGPSFileWriter(fileEntry) {
	createFileWriter(fileEntry, gpsFileWriterCreated);
}

function gpsFileWriterCreated(writer) {
	gpsFileWriter = writer;
	
	if (gpsFileWriter.length == 0) {
		gpsFileWriter.write("Latitude,Longitude,Altitude,Accuracy,Altitude Accuracy,Heading,Speed,Timestamp\n");
	} else {
		gpsFileWriter.seek(gpsFileWriter.length);
	}
}