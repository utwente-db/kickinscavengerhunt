// TODO: check GPS at start of game
// TODO: create signed APKs
// TODO? prettier logo files
// TODO!!! test for multiple image uploads on device
// TODO: iOS only cleanup
// TODO: scroll only exercises etc, not menu

//var SERVERS = new Array('http://localhost:8080/kiss/', 'http://farm10.ewi.utwente.nl:8080/kiss/', 'http://farm11.ewi.utwente.nl:8080/kiss/');
var SERVERS = new Array('http://farm10.ewi.utwente.nl:8080/kiss/', 'http://farm11.ewi.utwente.nl:8080/kiss/');
var serverId = 0;
var deviceId;

var maxNrConsecutiveFails = 3;

var MESSAGES_URL;
var IMAGE_LIST_URL;
var IMAGE_URL;
var GPS_UPLOAD_URL;

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
var unreadMessages = new Array();

$(document).bind('appDirectory:loaded', createGPSFile);
$(document).bind('gps:success', gpsSuccess);
document.addEventListener('deviceready', loadGame, false);

document.addEventListener('deviceready', loadFileSystemOperations, false);
document.addEventListener('deviceready', setDeviceId, false);

function loadGame() {
	initURLs();
	
	loadExercises();
	loadButtons();
	
	window.setInterval(uploadGPSFile, 60000);
	window.setInterval(getNewMessages, 60000);
	
	getNewMessages();
	
	$(window).resize(setLogo);
	document.addEventListener('backbutton', openPreviousScreen, false);

	loadLanguageItems();
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
		openScreen('images');
	});
	
	$('#uploadSuccessImage').click(function() {
		openScreen('exercises');
	});
	
	$('#camera').click(takePicture);
	$('#cameraFailedImage').click(takePicture);
	$('#uploadFailedImage').click(uploadPicture);
	$('#approveButton').click(uploadPicture);
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
	
//	iOS only
//	navigator.camera.cleanup(cleanUpSuccess, cleanUpFail);
}

function uploadFailed(error, message) {
	openScreen('uploadFailed');
	
//	iOS only
//	navigator.camera.cleanup(cleanUpSuccess, cleanUpFail);
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

function closeGame() {
	uploadGPSFile();
	uploadAnswersFile(closeApp);
}

function closeApp() {
	navigator.app.exitApp();
}

function gpsActive() {
	return new Date().getTime() <= (lastGpsSignal + 600000);
}

function uploadGPSFile() {
	if (!gpsActive()) {
		openScreen('noGPS');
		return;
	}
	
	uploadFile(applicationDirectory.fullPath + '/' + GPS_FILE_NAME, GPS_UPLOAD_URL, {deviceId: deviceId}, resetGPSFile);
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
}

function loadMessages() {
	var messagesNode = $('#messages')[0];
	messagesNode.innerHTML = '';
	
	for (i = 0; i < messages.length; i++) {
		var message = messages[i];
		var messageNode = document.createElement('div');
		
		if (unreadMessages.indexOf(i) >= 0) {
			$(messageNode).attr('class', 'unread');
		}

		messageNode.id = 'message_' + i;
		$(messageNode).attr('text', 'message_' + i + '_title');
		
		messagesNode.appendChild(messageNode);
		$(messageNode).click(openMessage);
	}
}

function openMessage() {
	var id = $(this)[0].id;
	id = id.substring(id.indexOf('_') + 1);
	
	var message = messages[id][currentLanguage];
	
	$('#messageTitle').attr('text', 'message_' + id + '_title');
	$('#messageText').attr('text', 'message_' + id + '_text');
	
	var index = unreadMessages.indexOf(parseInt(id));
	
	if (index >= 0) {
		unreadMessages.splice(index, 1);
		updateUnreadMessages();
	}

	openScreen('message');
}

function updateUnreadMessages() {
	$('#unread').html(unreadMessages.length);
	
	if (unreadMessages.length == 0) {
		$('#unread').css('display', 'none');
	} else {
		$('#unread').css('display', 'block');
	}
}

function toggleLanguage() {
	if (textItems == textItemsNL) {
		textItems = textItemsEN;
	} else {
		textItems = textItemsNL;
	}
	
	loadExercises();
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
	
	exerciseId = id;
	openScreen('exercise');
}

function gpsSuccess() {
	lastGpsSignal = new Date().getTime();
	
	if ($('#noGPS').css('display') != 'none') {
		openScreen();
	}
}

function openScreen(screenId) {
	if ($('#noGPS').css('display') != 'none' && !gpsActive()) {
		return false;
	}
	
	if ($('#' + screenId).length > 0) {
		if (screenId != 'loader') {
			screenStack[screenStack.length] = screenId;
		}
	} else {
		if (screenStack.length == 0) {
			screenId = 'exercises';
		} else {
			// Throw away the last element, and take the previous one
			screenStack.pop();
			screenId = screenStack[screenStack.length - 1];
		}
	}
	
	loadLanguageItems();
	
	$('.screen').css('display', 'none');
	$('#' + screenId).css('display', 'block');
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
	var newMessages = $.parseJSON(responseText);
	
	for (var i = messages.length; i < newMessages.length; i++) {
		unreadMessages[unreadMessages.length] = i;
	}

	updateUnreadMessages();
	messages = newMessages;
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

function openBigImage() {
	$('#bigImage').attr('src', $(this)[0].src);
	
	openScreen('image');
	
	setTimeout(setLogo, 100);
}

function setLogo() {
	$('#bigImageLogoContainer').css({'top':  $('#bigImage').height() + 10,
									 'left': ($('#wrapper').width() + $('#bigImage').width()) / 2 - 80});
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
	
	console.log(screens[i]);
	openScreen(screens[i].id);
	
	if (i == screens.length - 1) {
		return;
	}
	
	setTimeout(function() { 
				testScreen(i + 1); 
			   }, 5000);
}