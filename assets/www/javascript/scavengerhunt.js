$(document).ready(loadLanguageItems);

function loadLanguageItems() {
	$('*[text]').each(function() { 
					 $(this).html(textItems[$(this).attr('text')]); 
				   });
}

// OLD
//var teamId = getGETParam('teamId');
//var language = getGETParam('language');
//
//var FILE_SYSTEM_HOME = 'KickInScavengerHunt' + teamId;
//
//var SERVER_NUMBER = teamId.substring(3);
//var KICK_IN_QUEST_SERVER_URL = 'http://farm' + SERVER_NUMBER + '.ewi.utwente.nl:8080/kick-in-quest-server';
//
//var GET_QUESTIONS_URL = KICK_IN_QUEST_SERVER_URL + '/GetQuestions?language=' + language + '&teamId=' + teamId;
//var ANSWER_QUESTIONS_URL = KICK_IN_QUEST_SERVER_URL + '/AnswerQuestions';
//
//var LOCAL_PACKAGE_FILE_NAME = 'quest-' + teamId + '.zip';
//var ANSWERS_FILE_NAME = "answers.txt";
//
//$(document).ready(initStyling);
//
//function initStyling() {
//	$('#backgroundImage').css('height', getBackgroundImageHeight());
//	$('#backgroundImage').css('width', getBackgroundImageWidth());
//}
//
//function getBackgroundImageHeight() {
//	var result = $('#wrapper').height() - $('#top').height() - $('#scoreBox').height();
//	
//	var topBorder = parseInt($('#top').css('border'));
//	
//	if (!isNaN(topBorder)) {
//		result -= topBorder;
//	}
//	
//	var topPadding = parseInt($('#top').css('padding'));
//	
//	if (!isNaN(topPadding)) {
//		result -= topPadding;
//	}
//	
//	var scoreBoxPadding = parseInt($('#scoreBox').css('padding'));
//	
//	if (!isNaN(scoreBoxPadding)) {
//		result -= scoreBoxPadding;
//	}
//	
//	var wrapperPadding = parseInt($('#wrapper').css('padding'));
//	
//	if (!isNaN(wrapperPadding)) {
//		result -= wrapperPadding;
//	}
//	
//	return result;
//}
//
//function getBackgroundImageWidth() {
//	var result = $('#wrapper').width();
//	
//	var wrapperPadding = parseInt($('#wrapper').css('padding'));
//	
//	if (!isNaN(wrapperPadding)) {
//		result -= wrapperPadding;
//	}
//	
//	return result;
//}
//
//function getBackgroundImageWidth() {
//	return $('#wrapper').width() - 10 /* paddings + borders */;
//}
//
//function loadInfoPage(infoText, callBackFunction, buttonText) {
//	$('.infoText').html(infoText);
//	loadInfoButton(callBackFunction, buttonText);
//}
//
//function loadInfoButton(callBackFunction, buttonText) {
//	$('.infoButton').html(buttonText);
//	
//	// Stop previous handlers for this button
//	$('.infoButton').unbind('click');
//	$('.infoButton').click(callBackFunction);
//}
//
//function cl(message) {
//	if (console != undefined) {
//		console.log(message);
//	}
//}
//
//function asWarning(message) {
//	return '<span class="warning">' + message + '</span>';
//}
//
//function getGETParam(paramName) {
//	var paramValuePairs = window.location.search.substring(1).split('&');
//	var result = '';
//
//	for (var i = 0; i < paramValuePairs.length; i++) {
//		var paramValueArray = paramValuePairs[i].split('=');
//		
//		if (paramValueArray[0] == paramName) {
//			result = paramValueArray[1];
//		}
//	}
//	
//	return result;
//}
//
//function createUUID() {
//    // http://www.ietf.org/rfc/rfc4122.txt
//    var s = [];
//    var hexDigits = "0123456789abcdef";
//    for (var i = 0; i < 36; i++) {
//        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
//    }
//    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
//    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
//    s[8] = s[13] = s[18] = s[23] = "-";
//
//    var uuid = s.join("");
//    return uuid;
//}
//
//function getPlatformName() {
//	if (navigator.userAgent.match(/Android/i)) {
//		return 'android';
//	} else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
//		return 'ios';
//	}
//}