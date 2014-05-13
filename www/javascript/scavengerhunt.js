var FILE_SYSTEM_HOME = 'KickInScavengerHunt';

$(document).ready(loadScavengerHunt);

var currentLanguage = 'nl';

function loadScavengerHunt() {
	loadLanguageItems();
	
	$('#language').click(toggleLanguage);
	$('.screen').height($(window).height() - $('#top').height() - 1);
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
	
	return textItem;
}

function toggleLanguage() {
	$('#language').attr('src', 'images/' + currentLanguage + '.jpg');

	if (currentLanguage == 'nl') {
		textItems = textItemsEN;
		currentLanguage = 'en';
	} else {
		textItems = textItemsNL;
		currentLanguage = 'nl';
	}
	
	loadLanguageItems();
	
	if (loadExercises != undefined) {
		loadExercises();
	}
}