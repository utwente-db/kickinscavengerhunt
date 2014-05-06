// Store GPS data to SD-Card
var zipFile = null;
var applicationDirectory = null;
var fileSystem = null;
var filesInZip = 0;
var extractedFiles = 0;

/*
 * INITIALIZE FILE SYSTEM - START
 */
function initFileSystem() {
	if (applicationDirectory != undefined) {
		console.warn("Attempting to initialize file system twice.");
		return;
	}
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, openFileSystem, failFS);
}

function openFileSystem(fileSystemParam) {
	fileSystem = fileSystemParam;
	openAppFileSystem();
}

function openAppFileSystem() {
	fileSystem.root.getDirectory(FILE_SYSTEM_HOME, {
			create : true,
			exclusive : false
		}, onGetAppDirectory, onGetDirectoryFail);
}

function onGetAppDirectory(directory) {
	applicationDirectory = directory;
	directories[''] = applicationDirectory;
	$(document).trigger('appDirectory:loaded');
}
/*
 * INITIALIZE FILE SYSTEM - END
 */

function createFileWriter(fileEntry, callbackFunction) {
	fileEntry.createWriter(callbackFunction, fail);
}

function failFS(evt) {
	fail(evt, "Opening file System failed with error " + evt.code);
}

function onGetDirectoryFail(evt) {
	fail(evt, "Creating directory failed with error " + evt.code);
}

function uploadFile(sourceFileURI, serverURI, params, callBackFunction, failFunction) {
	if (failFunction == undefined) {
		failFunction = onUploadFail;
	}
	
    var options = new FileUploadOptions();
    
    options.fileKey = "data";
	options.fileName = sourceFileURI.substr(sourceFileURI.lastIndexOf('/') + 1);
    options.mimeType = "text/plain";

    if (params == undefined) {
    	params = {};
    }
    
    options.params = params;
    
    var ft = new FileTransfer();
    ft.upload(sourceFileURI, encodeURI(serverURI), callBackFunction, failFunction, options);	
}

function onUploadOK(metadata) {
//	alert("Uploaded " + (Math.round(metadata.bytesSent / 102.4) / 10) + " MB");
	console.log("Code = " + metadata.responseCode);
	console.log("Response = " + metadata.response);
	console.log("Sent = " + metadata.bytesSent);
}

function onUploadFail(error) {
	fail(error, "An error has occurred: Code = " + error.code);
	
	console.log("upload error source " + error.source);
	console.log("upload error target " + error.target);
}

function onFileSystemSuccess(downloadURI, destinationFileName, callBackFunction) {
	var fileTransfer = new FileTransfer();
	
	if (applicationDirectory == null) {
		alert("failed to create folder for application data on local storage.");
		return;
	}
	
	fileTransfer.download(downloadURI,
		applicationDirectory.fullPath + '/' + destinationFileName,
		function(file) { downloadSuccess(file, callBackFunction); },
		downloadError);
}

function openFileSystemRead(pathToFile, callBackFunction, asText) {
	if (asText == undefined) {
		asText = false;
	}
	
	applicationDirectory.getFile(pathToFile, {
		exclusive : false
	}, function(fileEntry) { readFileEntry(fileEntry, callBackFunction, asText); }, fail);
}

function readFileEntry(fileEntry, callBackFunction, asText) {
	fileEntry.file(function(file) { readFile(file, callBackFunction, asText); }, fail);
}

function readFile(file, callBackFunction, asText) {
	var reader = new FileReader();
	 
	reader.onload = callBackFunction;
	reader.onerror = fail;
	 
	if (asText) {
		reader.readAsText(file); 
	} else {
		reader.readAsDataURL(file);
	}
}

function getFileName(fileName) {
	if (!fileName.lastIndexOf("/") < 0) {
		return fileName;
	}
	
	return fileName.substring(fileName.lastIndexOf("/") + 1);
}

function displayError(errorMessage) {
	$('.infoText').html(errorMessage);
	$('.infoText').css('color', 'red');
	$('.infoButton').css('display', 'none');
}

function fail(evtOrError, message) {
	alert(error.code);
	alert(message);
	alert(evtOrError);
	
	if (message != undefined) {
		displayError(message);		
	}
	
	if (evtOrError != undefined) {
		if (evtOrError.target != undefined && evtOrError.target.error != undefined) {
			evtOrError = evtOrError.target.error;
		}
		
		if (evtOrError.code != undefined) {
			console.log(evtOrError.code);
		}
	}
}

var directories = new Array();

function getDirectory(fileName) {
	var dirName = getDirectoryName(fileName);
	
	if (directories[dirName] != undefined) {
		return directories[dirName];
	}
	
	alert('Directory ' + dirName + ' not found');
}

function getDirectoryName(fileName) {
	if (!fileName.lastIndexOf("/") < 0) {
		return "";
	}
	
	return fileName.substring(0, fileName.lastIndexOf("/"));
}

function getFileName(fileName) {
	if (!fileName.lastIndexOf("/") < 0) {
		return fileName;
	}
	
	return fileName.substring(fileName.lastIndexOf("/") + 1);
}

/*
 * END OF DOWNLOAD FILE
 */

function fileExists(path, fileExistsCallback, fileDoesNotExistCallback) {
    applicationDirectory.getFile(path, { create: false }, fileExistsCallback, fileDoesNotExistCallback);
}