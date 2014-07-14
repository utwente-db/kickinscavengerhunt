var FILE_SYSTEM_HOME = 'KickInScavengerHunt';

$(document).ready(loadScavengerHunt);

var currentLanguage;

function loadScavengerHunt() {
	currentLanguage = $.cookie('lang');
	
	if (currentLanguage == undefined) {
		currentLanguage = 'nl';
	}
	
	toggleLanguage(currentLanguage);
	
	$('#language').click(toggleLanguage);
	$('.screen').height($(document).height() - $('#top').height() - 1);
}

function loadLanguageItems() {
	$('*[text]').each(function() { 
					 $(this).html(getTextItem($(this).attr('text'))); 
				   });
}

function getTextItem(label) {
	if (label == undefined || label == '') {
		return '';
	}

	var textItem = textItems[label];
	
	if (label.substring(0, 8) == 'exercise') {
		// e.g. 11_title
		var lastPart = label.substring(label.indexOf('_') + 1);
		
		var id = lastPart.substring(0, lastPart.indexOf('_'));
		var titleOrText = lastPart.substring(lastPart.indexOf('_') + 1);
		
		textItem = textItems['exercises'][id][titleOrText];
	}
	
	if (label.substring(0, 7) == 'message') {
		// e.g. 11_title
		var lastPart = label.substring(label.indexOf('_') + 1);
		
		var id = lastPart.substring(0, lastPart.indexOf('_'));
		var titleOrText = lastPart.substring(lastPart.indexOf('_') + 1);
		
		textItem = messages[id][currentLanguage][titleOrText];
	}
	
	if (textItem == undefined) {
		textItem = label;
	}
	
	return textItem;
}

function toggleLanguage(newLanguage) {
	if (newLanguage != 'en' && newLanguage != 'nl') {
		newLanguage = getOtherLanguage(currentLanguage);
	}
	
	$('#language').attr('src', 'images/' + getOtherLanguage(newLanguage) + '.jpg');

	if (newLanguage == 'nl') {
		textItems = textItemsNL;
	} else {
		textItems = textItemsEN;
	}
	
	currentLanguage = newLanguage;
	
	loadLanguageItems();
	
	if (typeof(loadExercises) != 'undefined') {
		loadExercises();
	}
	
	$.cookie('lang', currentLanguage);
	
	$(document).trigger('language:switched');
}

function getOtherLanguage(language) {
	return (language == 'nl') ? 'en' : 'nl';
}