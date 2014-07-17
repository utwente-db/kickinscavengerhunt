var SERVERS = new Array('http://farm10.ewi.utwente.nl:8080/kiss/', 'http://farm11.ewi.utwente.nl:8080/kiss/', 'http://castle.ewi.utwente.nl:8080/kiss/');
var serverId = 0;
var deviceId;
var map;

var MAP_SCRIPT_URL = 'https://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&s=1';

var maxNrConsecutiveFails = 3;

var MESSAGES_URL;
var IMAGE_LIST_URL;
var IMAGE_URL;
var GPS_UPLOAD_URL;

var GAME_LATITUDE = 52.262296;
var GAME_LONGITUDE = 6.793611;

function initURLs() {
	var BASE_URL = SERVERS[serverId];
	
	MESSAGES_URL = BASE_URL + 'Messages';
	IMAGE_LIST_URL = BASE_URL + 'ImageList';
	IMAGE_URL = BASE_URL + 'Image';
	GPS_UPLOAD_URL = BASE_URL + 'GPSUpload';
}

var fullStarFile = 'images/star.gif';
var emptyStarFile = 'images/star_empty.gif';

var lastGpsSignal = new Date().getTime();
var favorites = new Array();
var screenStack = new Array();

var exerciseId = 0;
var readMessages = new Array();

var tipsAndTricks = new Array(
						new Array($('#wrapper').width() - 135, 29, 'CHANGE_LANGUAGE_EXPLANATION'),
						new Array($('#wrapper').width() - 195, 29, 'MAP_EXPLANATION'),
						new Array(87, 34, 'MESSAGES_EXPLANATION'), 
						new Array(29, 29, 'MENU_EXPLANATION'),
						new Array(90, 88, 'EXERCISE_EXPLANATION'),
						new Array(16, 88, 'STAR_EXPLANATION')
					);

$(document).bind('appDirectory:loaded', createGPSFile);
$(document).bind('appDirectory:loaded', function() {
	window.setInterval(uploadGPSFile, 60000);
});

$(document).bind('gps:success', gpsSuccess);

document.addEventListener('deviceready', loadGame, false);
document.addEventListener('deviceready', loadFileSystemOperations, false);
document.addEventListener('deviceready', setDeviceId, false);

function loadGame() {
	var readMessagesCookie = $.cookie('readMessages');
	
	if (readMessagesCookie != undefined) {
		readMessages = readMessagesCookie.split(',');
		
		if (readMessages[0] == "") {
			readMessages.splice(0, 1);
		}
	}
	
	initURLs();
	
	loadExercises();
	loadButtons();
	
	window.setTimeout(checkGPS, 60000);

	window.setInterval(getNewMessages, 60000);
	getNewMessages();
	
	$(window).resize(setLogo);
	document.addEventListener('backbutton', openPreviousScreen, false);

	loadLanguageItems();
	openScreen('exercises');
	
	introduction();
	$(document).on('language:switched', introduction);

	// First load phonegap, then map
	$.getScript(MAP_SCRIPT_URL, loadGoogleMap);
}

function setDeviceId() {
	deviceId = device.uuid;
}

function loadButtons() {
	$('#menu').click(function() {
		openScreen('exercises');
	});
	
	$('#envelope').click(function() { 
		loadMessages();
		openScreen('messages'); 
	});
	
	$('#unread').click(function() {
		loadMessages();
		openScreen('messages'); 
	});
	
	$('#logo').click(function() {
		openScreen('about');
	});
	
	$('#bigImage').click(function() {
		// Go back one screen
		openScreen('');
	});
	
	$('#uploadSuccessImage').click(function() {
		openScreen('exercises');
	});
	
	$('#mapButton').click(function() {
		openScreen('map');
	});
	
	$('#exerciseImage').click(function() {
		openBigImage($(this).attr('src'));
	});
	
	$('#camera').click(takePicture);
	$('#cameraFailedImage').click(takePicture);
	$('#uploadFailedImage').click(uploadPicture);
	$('#declineButton').click(openPreviousScreen);
}

function takePicture() {
	openScreen('loader');
	navigator.camera.getPicture(uploadPicture, cameraFailed, {quality: 50, encodingType: Camera.EncodingType.JPEG, destinationType: Camera.DestinationType.FILE_URI});
}

function uploadPicture(imagePath) {
	uploadFile(imagePath, IMAGE_URL, {deviceId: deviceId, exerciseId: exerciseId, timestamp: new Date().getTime()}, pictureUploadSuccess, uploadFailed);
}

function cameraFailed() {
	openScreen('cameraFailed');
}

function pictureUploadSuccess() {
	$('#exercise_' + exerciseId).addClass('completed').off().click(openImageScreen);
	openScreen('uploadSuccess');
}

function uploadFailed(error, message) {
	openScreen('uploadFailed');
}

function cleanUpSuccess() {
    console.log("Camera cleanup success.")
}

function cleanUpFail(message) {
    alert('Cleanup failed because: ' + message);
}

function loadFileSystemOperations() {
	$(document).bind('appDirectory:loaded', createGPSFile);

	initFileSystem();
	startGPSTracking();
}

function endGame() {
	uploadGPSFile(closeApp);
}

function closeApp() {
	navigator.app.exitApp();
}

function gpsActive() {
	return new Date().getTime() <= (lastGpsSignal + 600000);
}

function checkGPS() {
	if (!gpsActive()) {
		openScreen('noGPS');
		return false;
	}
	
	return true;
}

function uploadGPSFile(callback) {
	if (!checkGPS()) {
		return;
	}
	
	if (callback == undefined) {
		callback = resetGPSFile;
	}
	
	uploadFile(GPS_FILE_URL, GPS_UPLOAD_URL, {deviceId: deviceId}, callback);
}

function resetGPSFile() {
	gpsFileWriter = null;
	applicationDirectory.getFile(GPS_FILE_NAME, {create: false, exclusive: false}, resetGPSFileEntry, fail);
}

function resetGPSFileEntry(fileEntry) {
	fileEntry.remove(createGPSFile);
}

function loadExercises() {
	var exercises = textItems.exercises;
	var exercisesNode = $('#exercises')[0];
	exercisesNode.innerHTML = '';
	
	for (i = 0; i < exercises.length; i++) {
		var exercise = exercises[i];
		var exerciseNode = document.createElement('div');
		exerciseNode.id = 'exercise_' + i;
		
		var starNode = document.createElement('img');
		starNode.id = 'star_' + i;
		starNode.src = favorites.indexOf(starNode.id) >= 0 ? fullStarFile : emptyStarFile;
		starNode.setAttribute('class', 'star');
		
		var exerciseTitleNode = document.createElement('span');
		$(exerciseTitleNode).attr('text', 'exercise_' + i + '_title');
		
		exerciseNode.appendChild(starNode);
		exerciseNode.appendChild(exerciseTitleNode);
		exercisesNode.appendChild(exerciseNode);
		
		$(exerciseNode).click(openExercise);
	}
	
	$('#exercises img').click(toggleStar);
	loadLanguageItems();
}

function loadMessages() {
	var messagesNode = $('#messages')[0];
	messagesNode.innerHTML = '';
	
	for (i = 0; i < messages.length; i++) {
		var message = messages[i];
		var messageNode = document.createElement('div');
		
		if (readMessages.indexOf("" + i) == -1) {
			$(messageNode).attr('class', 'unread');
		}

		messageNode.id = 'message_' + i;
		$(messageNode).attr('text', 'message_' + i + '_title');
		
		messagesNode.appendChild(messageNode);
		$(messageNode).click(openMessage);
	}
}

function openMessage() {
	$(this).removeClass('unread');
	
	var id = $(this)[0].id;
	id = id.substring(id.indexOf('_') + 1);
	
	var message = messages[id][currentLanguage];
	
	$('#messageTitle').attr('text', 'message_' + id + '_title');
	$('#messageText').attr('text', 'message_' + id + '_text');
	
	if (readMessages.indexOf(id) == -1) {
		readMessages[readMessages.length] = id;
		$.cookie('readMessages', readMessages.join(','));
		updateUnreadMessagesCounter();
	}

	openScreen('message');
}

function updateUnreadMessagesCounter() {
	$('#unread').html(messages.length - readMessages.length);
	
	if (readMessages.length == messages.length) {
		$('#unread').css('display', 'none');
	} else {
		$('#unread').css('display', 'block');
	}
}

function toggleStar() {
	var id = $(this).attr('id');
	var index = favorites.indexOf(id);
	
	if (index >= 0) {
		favorites.splice(index, 1);
		$(this).attr('src', emptyStarFile);
	} else {
		favorites[favorites.length] = id;
		$(this).attr('src', fullStarFile);
	}
	
	return false;
}

function openExercise(id) {
	if (isNaN(parseInt(id))) {
		id = $(this)[0].id;
		id = id.substring(id.indexOf('_') + 1);
	}

	$('#exerciseTitle').attr('text', 'exercise_' + id + '_title');
	$('#exerciseText').attr('text', 'exercise_' + id + '_text');
	$('#exerciseImage').attr('src', 'images/exercises/' + id + '.jpg');
	
	exerciseId = id;
	openScreen('exercise');
	
	hideAllMarkers();
	displayMarker(id);
}

function gpsSuccess() {
	lastGpsSignal = new Date().getTime();
	
	if ($('#noGPS').css('display') != 'none') {
		openScreen();
	}
}

function openPreviousScreen() {
	// improving readability of code
	openScreen();
}

function getNewMessages(nrCalls) {
	if (nrCalls == undefined) {
		nrCalls = 0;
	}
	
	$.ajax({url: MESSAGES_URL}).done(setNewMessages).fail(function() { connectionFailed(getNewMessages, nrCalls); });
}

function setNewMessages(responseText) {
	messages = $.parseJSON(responseText);
	
	updateUnreadMessagesCounter();
}

function openImageScreen() {
	var id = $(this)[0].id;
	id = id.substring(id.indexOf('_') + 1);
	
	exerciseId = id;
	$('#images').html('');

	openScreen('images')
	getImages();
}

function getImages(nrCalls) {
	if (nrCalls == undefined) {
		nrCalls = 0;
	}
	
	$.ajax({url: IMAGE_LIST_URL + '?exerciseId=' + exerciseId}).done(setImages).fail(function() { connectionFailed(getImages, nrCalls); });
}

function setImages(responseText) {
	var imagesNode = document.getElementById('images');
	var images = $.parseJSON(responseText);
	
	$(imagesNode).html('');
	
	for (var i = 0; i < images.length; i++) {
		var image = images[i];
		
		var imageNode = document.createElement('img');
		imageNode.src = IMAGE_URL + '?imagePath=' + images[i];

		imagesNode.appendChild(imageNode);
		$(imageNode).click(openBigImage);
	}
}

function openBigImage(src) {
	if (typeof(src) != 'string') {
		src = $(this).attr('src');
	}

	$('#bigImage').one("load", setLogo).attr('src', src);
	
	openScreen('image');
}

function setLogo() {
	$('#bigImageLogoContainer').css({'top':  $('#bigImage').height() - 50,
									 'left': ($('#wrapper').width() + $('#bigImage').width()) / 2 - 95});
}

function connectionFailed(retryFunction, nrCalls) {
	switchServer();

	if (nrCalls++ >= maxNrConsecutiveFails || retryFunction == undefined) {
		return;
	}
	
	retryFunction(nrCalls);
}

function switchServer() {
	serverId = (serverId + 1) % SERVERS.length;
	initURLs();
}

function screenTest() {
	lastGpsSignal = new Date().getTime();
	
	openExercise(0);
	
	testScreen(0);
}

function testScreen(i) {
	var screens = $('.screen');
	
	openScreen(screens[i].id);
	
	if (i == screens.length - 1) {
		return;
	}
	
	setTimeout(function() { 
				testScreen(i + 1); 
			   }, 5000);
}



function tooltip(x, y, textItem) {
	$('#tooltipTriangle').css({left: x - 9, top: y});
	$('#tooltipInfo').css({top: y + 15, width: $('#wrapper').width() - 16}).attr('text', textItem);
	
	loadLanguageItems();
	$('#tooltip').off().click(closeTooltip).css({display: 'block'});
}

function closeTooltip() {
	$('#tooltip').css({display: 'none'});
	$(document).trigger('tooltip:closed');
}

function introduction(step) {
	if (isNaN(step)) {
		step = 0;
	}
	
	if ((getCurrentScreen() != 'exercises') || (tipsAndTricks[step] == undefined)) {
		return;
	}
	
	var logoWidth = $('#logo').width() + 10;
	
	if ($('#wrapper').width() < 360) {
		$('#logo').hide();
		
		logoWidth = 0;
	}
	
	// Timing issue
	tipsAndTricks[0][0] = $('#wrapper').width() - 39 - logoWidth;
	tipsAndTricks[1][0] = $('#wrapper').width() - 110 - logoWidth;
	
	var tip = tipsAndTricks[step];
	tooltip(tip[0], tip[1], tip[2]);
	
	// After this tip, go to the next one
	$(document).off('tooltip:closed').on('tooltip:closed', function() {
		introduction(step + 1);
	});
}

function getCurrentScreen() {
	return screenStack[screenStack.length - 1];
}

//function initializeMap() {
//	$('#map').width($(window).width());
//	$('#map').height($(window).height() - 61);
//	
//    var mapOptions = {
//        credentials: "AiPx2C9sZqn3lH2wWmmGCyC1PBAkCb5v0iMtWcOg1_VbBCG_CzjWQ81oSVZUa3PF",
//        mapTypeId: Microsoft.Maps.MapTypeId.road,
//        center: new Microsoft.Maps.Location(GAME_LATITUDE, GAME_LONGITUDE),
//        zoom: 15
//    };
//    
//    map = new Microsoft.Maps.Map(document.getElementById("map"), mapOptions);
//
//    createMapMarkers(map);
//}
//
//function waitForMapService(callback) {
//	console.log('wait');
//
//	if (typeof(Microsoft) == 'undefined' || typeof(Microsoft.Maps) == 'undefined' || typeof(Microsoft.Maps.Location) == 'undefined') {
//		setTimeout(function() { waitForMapService(callback); }, 100);
//		return;
//	}
//
//	callback();
//}

function loadGoogleMap() {
	$('#map').width($(window).width());
	$('#map').height($(window).height());
	
	var script = document.createElement('script');
	
	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=initializeGoogleMap';
  
	document.body.appendChild(script);
}

function initializeGoogleMap() {
	var mapOptions = {
		  zoom: 15,
		  center: new google.maps.LatLng(GAME_LATITUDE, GAME_LONGITUDE)
	};

	map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function createMapMarkers(map) {
	var exercises = textItems.exercises;
	
	for (var i = 0; i < exercises.length; i++) {
		var exercise = exercises[i];
		
		var loc = new Microsoft.Maps.Location(exercise.latitude, exercise.longitude);
		var pin = new Microsoft.Maps.Pushpin(loc, {text: '' + (i + 1)});
		markers[markers.length] = pin;
		
        pinInfobox = new Microsoft.Maps.Infobox(loc, {title: exercise.title, visible: true});
        infoboxes[i] = pinInfobox;
        
        // Add a handler for the pushpin click event.
        Microsoft.Maps.Events.addHandler(pin, 'click', displayInfobox);
        
        // Add the pushpin and info box to the map
        map.entities.push(pin);
        map.entities.push(pinInfobox);
    }
	
    // Hide the info boxes when the map is moved.
    Microsoft.Maps.Events.addHandler(map, 'viewchange', hideInfoboxes);	
}

function hideAllMarkers() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setOptions({ visible: false });
	}
}

function displayMarker(markerId) {
	markers[markerId].setOptions({ visible: true });
}

function displayAllMarkers() {
	for (var i = 0; i < markers.length; i++) {
		displayMarker(i);
	}
}

var markers = [];
var infoboxes = [];

function displayInfobox(e) {
	var index = parseInt(e.target._text) - 1;

	var infobox = infoboxes[index];
    infobox.setOptions({ visible: true });
}

function hideInfoboxes(e) {
	for (var i = 0; i < infoboxes.length; i++) {
		infoboxes[i].setOptions({ visible: false });
	}
}

$(document).ready(function() {
	// Browser mode
	$.ajax('cordova.js', {error: loadGame});
});

//if (window.location.protocol == 'file:') {
//	alert('debug mode');
//	// Debug mode
//	$(document).ready(loadGame);
//
//	window.setTimeout(function() {
//		$('#exercise_1').addClass('completed').off().click(openImageScreen);
//	}, 500);
//}