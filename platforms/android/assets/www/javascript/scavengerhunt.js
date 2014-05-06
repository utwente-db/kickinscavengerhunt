var FILE_SYSTEM_HOME = 'KickInScavengerHunt';

$(document).ready(loadScavengerHunt);

var currentLanguage = 'nl';

function loadScavengerHunt() {
	$('#language').click(switchLanguage);
	loadLanguageItems();
}

function loadLanguageItems() {
	$('*[text]').each(function() { 
					 $(this).html(getTextItem($(this).attr('text'))); 
				   });
}

function switchLanguage() {
	$('#language').attr('src', 'images/' + currentLanguage + '.jpg');
	
	if (currentLanguage == 'nl') {
		currentLanguage = 'en';
		textItems = textItemsEN;
	} else {
		currentLanguage = 'nl';
		textItems = textItemsNL;
	}
	
	loadLanguageItems();
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