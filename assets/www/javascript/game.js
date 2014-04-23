// TODO: change this to farm10 or farm11 (if farm10 down)
var URL_BASE = 'http://localhost:8080/kiss/';

var MESSAGES_URL;
var IMAGE_LIST_URL;
var IMAGE_URL;

function initURLs() {
	MESSAGES_URL = URL_BASE + "Messages";
	IMAGE_LIST_URL = URL_BASE + "ImageList";
	IMAGE_URL = URL_BASE + "Image";
}

var fullStarFile = 'images/star.gif';
var emptyStarFile = 'images/star_empty.gif';

var lastGpsSignal = new Date().getTime();
var favorites = new Array();

var exerciseId = null;
var unreadMessages = new Array();

var currentLanguage = 'nl';

$(document).bind('gps:success', gpsSuccess);
$(document).ready(loadGame);

window.setInterval(uploadGPSFile, 60000);

document.addEventListener('deviceready', loadFileSystemOperations, false);

function loadGame() {
	initURLs();
	
	loadExercises();
	loadButtons();
	
	window.setInterval(getNewMessages, 60000);
	getNewMessages();
}

function loadButtons() {
	$('#menu').click(function() { openScreen('exercises'); });
	$('#envelope').click(function() { 
		loadMessages(); 
		openScreen('messages'); 
	});
	
	$('#unread').click(function() { 
		loadMessages(); 
		openScreen('messages'); 
	});
	
	$('#camera').click(function() {
		// TODO capture image from app instead
		openScreen('approve');
	});
	
	$('#approveButton').click(function() {
		uploadImage();
	});
	
	$('#declineButton').click(function() {
		openScreen('exercise');
	});
	
	$('#logo').click(function() {
		openScreen('about');
	});
	
	$('#bigImage').click(function() {
		openScreen('images');
	});
}

function uploadImage() {
	// TODO really upload image
	uploadSuccess();
}

function uploadSuccess() {
	$('#messageTitle').html('Uploaden is gelukt');
	$('#messageText').html('Ga verder met de volgende opdracht.');
	
	$('#messageImage')[0].src = 'images/menu_groot.jpg';
	
	$('#messageImage').click(function() {
		openScreen('exercises');
	});
	
	$('#exercise_' + exerciseId).addClass('completed').off().click(openImageScreen);
	
	openScreen('message');
}

function uploadFail() {
	$('#messageTitle').html('Het uploaden is mislukt');
	$('#messageText').html('Controleer de internetverbinding en druk op de knop hieronder.');
	
	// TODO testen
	$('#messageImage')[0].src = 'images/approve.png';
	
	$('#messageImage').click(function() {
		uploadImage();
	});
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

function getTextItem(label) {
	if (typeof data['textItems'][label] == 'undefined') {
		return label;
	}
	
	return data['textItems'][label];
}

function uploadGPSFile() {
	if (new Date().getTime() > (lastGpsSignal + 60000)) {
		alert(getTextItem('NO_LOCATION_FOR_ONE_MINUTE'));
		return;
	}
	
	uploadFile(applicationDirectory.fullPath + '/' + GPS_FILE_NAME, ANSWER_QUESTIONS_URL, {dataType: 'gps', teamId: teamId, deviceId: deviceId, language: language}, resetGPSFile);
}

function resetGPSFile() {
	gpsFileWriter = null;
	applicationDirectory.getFile(GPS_FILE_NAME, {create: false, exclusive: false}, resetGPSFileEntry, fail);
}

function resetGPSFileEntry(fileEntry) {
	fileEntry.remove(createGPSFile);
}

function notifyNoInternet() {
	alert(getTextItem('UNABLE_TO_CLOSE_APP') + ': ' + getTextItem('NO_INTERNET_AVAILABLE'));
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
		
		exercisesNode.appendChild(exerciseNode);
		exerciseNode.appendChild(starNode);
		exerciseNode.innerHTML += exercise.title;
		
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
		messageNode.innerHTML = message[currentLanguage].title;
		
		messagesNode.appendChild(messageNode);
		$(messageNode).click(openMessage);
	}
}

function openMessage() {
	var id = $(this)[0].id;
	id = id.substring(id.indexOf('_') + 1);
	
	// Clear image
	$('#messageImage')[0].src = '';
	
	var message = messages[id][currentLanguage];
	
	$('#messageTitle').html(message.title);
	$('#messageText').html(message.text);
	
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

function openExercise() {
	var id = $(this)[0].id;
	
	id = id.substring(id.indexOf('_') + 1);

	$('#exerciseTitle').html(textItems.exercises[id].title);
	$('#exerciseText').html(textItems.exercises[id].text);
	exerciseId = id;
	
	openScreen('exercise');
}

function gpsSuccess() {
	lastGpsSignal = new Date().getTime();
}

function openScreen(screenId) {
	$('.screen').css('display', 'none');
	$('#' + screenId).css('display', 'block');
}

function getNewMessages() {
	$.ajax({url: MESSAGES_URL}).done(setNewMessages);
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

function getImages() {
	$.ajax({url: IMAGE_LIST_URL + '?exerciseId=' + exerciseId}).done(setImages);
}

function setImages(responseText) {
	var imagesNode = document.getElementById('images');
	var images = $.parseJSON(responseText);
	
	$(imagesNode).html('');

	for (var i = 0; i < images.length; i++) {
		var image = document.createElement('img');
		image.src = IMAGE_URL + '?imagePath=' + images[i];
		
		imagesNode.appendChild(image);
		$(image).click(openBigImage);
	}
}

function openBigImage() {
	$('#bigImage').attr('src', $(this)[0].src);
	
	openScreen('image');
}