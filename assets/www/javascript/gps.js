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

function getDistance(lat1, lon1, lat2, lon2) {
	var R = 6371007.0; // radius of the earth in m
	var dLat = toRad(lat2-lat1);
	var dLon = toRad(lon2-lon1);
	var lat1 = toRad(lat1);
	var lat2 = toRad(lat2);

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	
	return d;
}

function toRad(degrees){
    return degrees * Math.PI / 180;
}

// The code below is here just for reference
// formally this should be used for computing the ellipsoidal distance on WGS1984 instead of the spherical distance formula above

function getEllipsoidalDistance(lat1, lon1, lat2, lon2) {
	// WGS1984: a = 6378137.0, 1/f = 298.257223563  
	var a = 6378137.0;
	var f_inv = 298.257223563;
	var f = 1.0 / f_inv;
	var e2 = 2.0 * f - f * f;
	var e = Math.sqrt(e2);
	
	lat1 = toRad(lat1);
	lat2 = toRad(lat2);
	lon1 = toRad(lon1);
	lon2 = toRad(lon2);
	var N1 = a / Math.sqrt(1.0 - e2 * Math.sin(lat1) * Math.sin(lat1));
	var N = a / Math.sqrt(1.0 - e2 * Math.sin(lat2) * Math.sin(lat2));
	var psi = Math.atan((1.0 - e2) * Math.tan(lat2) + e2 * N1 * Math.sin(lat1) / N / Math.cos(lat2));
	var azim = Math.atan2(Math.sin(lon2-lon1), Math.cos(lat1) * Math.tan(psi) - Math.sin(lat1) * Math.cos(lon2-lon1));
	var signCosAz = (Math.cos(azim)>0)?1:-1;
	var s = 0;
	if (Math.abs(Math.sin(azim)) < 1e-12 )
		s = signCosAz * asin(cos(lat1)*sin(psi) - sin(lat1)*cos(psi));
	else
		s = Math.asin(Math.sin(lon2-lon1) * Math.cos(psi)/Math.sin(azim));
	var G = e * Math.sin(lat1) / Math.sqrt(1 - e2);
	var H = e * Math.cos(lat1) * Math.cos(azim)/Math.sqrt(1 - e2);
	var s2 = s*s;
	var s4 = s2*s2;
	var d = N1*s*(1.0-s2*H*H*(1.0-H*H)/6+(s*s2/8)*G*H*(1-2*H*H) + (s4/120)*(H*H*(4-7*H*H)-3*G*G*(1-7*H*H)) - (s4*s/48)*G*H);
	return d;
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