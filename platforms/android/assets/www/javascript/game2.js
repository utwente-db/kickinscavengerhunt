document.addEventListener('deviceready', takePicture, false);

function takePicture() {
	navigator.camera.getPicture(uploadPicture, cameraFailed, {quality: 50, encodingType: Camera.EncodingType.JPEG, destinationType: Camera.DestinationType.FILE_URI});
}

function cameraFailed() {
	alert('cam failed');
}

function uploadPicture(imagePath) {
	$('#approveImage').attr('src', imagePath);
	
	$('.screen').css({'display': 'none'});
	$('#approve').css({'display': 'block'});
	
	uploadFile(imagePath, 'http://farm10.ewi.utwente.nl:8080/kiss/Image', {deviceId: '123', exerciseId: '0', timestamp: new Date().getTime()}, pictureUploadSuccess, uploadFailed);
}

function pictureUploadSuccess(message) {
	alert('upload success');
	alert(message);
}

function uploadFailed(error, message) {
	alert('uploadFailed');
	
	alert(error.code);
	alert(message);
	alert(error);
}

function uploadFile(sourceFileURI, serverURI, params, callBackFunction, failFunction) {
    var options = new FileUploadOptions();
    
    options.fileKey = "data";
	options.fileName = sourceFileURI.substr(sourceFileURI.lastIndexOf('/') + 1);
    options.mimeType = "text/plain";

    alert(options.fileName);

    if (params == undefined) {
    	params = {};
    }
    
    options.params = params;
    
    var ft = new FileTransfer();
    ft.upload(sourceFileURI, encodeURI(serverURI), callBackFunction, failFunction, options);	
}