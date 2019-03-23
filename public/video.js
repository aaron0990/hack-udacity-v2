var posep;
const MAX_ITERS = 10;

var dist_op_lda = 0, dist_B_lda=0, dist_C_lda=0;
var dist_op_lua = 0, dist_B_lua=0, dist_C_lua=0;
var dist_op_rda = 0, dist_B_rda=0, dist_C_rda=0;
var dist_op_rua = 0, dist_B_rua=0, dist_C_rua=0;

(function() {
	
	var streaming = false,
		video        = document.querySelector('#video'),
		canvas       = document.querySelector('#canvas'),
		photo        = document.querySelector('#photo'),
		startbutton  = document.querySelector('#startbutton'),
		width = 320,
		height = 0;
	
	navigator.getMedia = ( navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);
	
	navigator.getMedia(
		{
			video: true,
			audio: false
		},
		function(stream) {
			if (navigator.mozGetUserMedia) {
				video.mozSrcObject = stream;
			} else {
				var vendorURL = window.URL || window.webkitURL;
				video.srcObject = stream;
			}
			video.play();
		},
		function(err) {
			console.log("An error occured! " + err);
		}
	);
	
	video.addEventListener('canplay', function(ev){
		if (!streaming) {
			height = video.videoHeight / (video.videoWidth/width);
			canvas.setAttribute('width', width);
			canvas.setAttribute('height', height);
			streaming = true;
		}
	}, false);

	var iter = 0;
	setInterval (function(){
		takepicture();
		
	}, 200);
	
	async function takepicture() {
		
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d').drawImage(video, 0, 0, width, height);
		var data = canvas.toDataURL('image/png');
		var photo = document.getElementById('photo');
		photo.setAttribute('src', data);
		haveAllTwoPositions(photo);
		++iter;
	}
	
	function getData(image, pose_default) {

		//Analizamos nuestra captura
		posenet.load().then(async function (net) {
			return await net.estimateSinglePose(image, imageScaleFactor, flipHorizontal, outputStride)
		}).then(function (pose_user) {
			console.log(pose_user, pose_default);
			compareTwoPoses(pose_user, pose_default);
		})
	}


	async function haveAllTwoPositions(pose_user) {
		//Analizamos la imagen de modelo que nos dan
		var imgDeft = document.getElementById('img1');
		posenet.load().then(async function (net) {
			return await net.estimateSinglePose(imgDeft, imageScaleFactor, flipHorizontal, outputStride)
		}).then(function(pose2){
			getData(pose_user, pose2);
		})
	}

	function compareTwoPoses(pose_user, pose_default) {
		arms(pose_user, pose_default);
		console.log(pose_user.keypoints);
	}

	function arms(pose_user, pose_default) {
		if (iter < MAX_ITERS){
			 dist_op_lda += (getDistance(pose_default.keypoints[6].position,pose_default.keypoints[10].position)/MAX_ITERS);
			 dist_B_lda += (getDistance(pose_default.keypoints[6].position,pose_default.keypoints[8].position)/MAX_ITERS);
			 dist_C_lda += (getDistance(pose_default.keypoints[8].position,pose_default.keypoints[10].position)/MAX_ITERS);
			
			 dist_op_lua += (getDistance(pose_user.keypoints[6].position,pose_user.keypoints[10].position)/MAX_ITERS);
			 dist_B_lua += (getDistance(pose_user.keypoints[6].position,pose_user.keypoints[8].position)/MAX_ITERS);
			 dist_C_lua	+= (getDistance(pose_user.keypoints[8].position,pose_user.keypoints[10].position)/MAX_ITERS);
			 
			 dist_op_rda += (getDistance(pose_default.keypoints[5].position,pose_default.keypoints[9].position)/MAX_ITERS);
			 dist_B_rda += (getDistance(pose_default.keypoints[5].position,pose_default.keypoints[7].position)/MAX_ITERS);
			 dist_C_rda += (getDistance(pose_default.keypoints[7].position,pose_default.keypoints[9].position)/MAX_ITERS);

			 dist_op_rua += (getDistance(pose_user.keypoints[5].position,pose_user.keypoints[9].position)/MAX_ITERS);
			 dist_B_rua += (getDistance(pose_user.keypoints[5].position,pose_user.keypoints[7].position)/MAX_ITERS);
			 dist_C_rua += (getDistance(pose_user.keypoints[7].position,pose_user.keypoints[9].position)/MAX_ITERS);
		}
		
		else {
			var left_default_angle = getAngle(dist_op_lda, dist_B_lda, dist_C_lda);
			var left_user_angle = getAngle(dist_op_lua, dist_B_lua, dist_C_lua);
			var right_default_angle = getAngle(dist_op_rda, dist_B_rda, dist_C_rda);
			var right_user_angle = getAngle(dist_op_rua, dist_B_rua, dist_C_rua);
			iter = 0;
			console.log(left_default_angle);
			console.log(right_user_angle);
			if(Math.abs(left_default_angle - left_user_angle) < 5){
				console.log("Left Correct")
			}
			console.log(right_default_angle);
			console.log(left_user_angle);
			if(Math.abs(right_default_angle - right_user_angle) < 5){
				console.log("Right Correct")
			}
		}
	}

	function getAngle(distance_opuesta, distance_B, distance_C) {
		var double_B = Math.pow(distance_B, 2);
		var double_C = Math.pow(distance_C, 2);
		var x = 2*distance_B*distance_C;
		var z = (double_B + double_C -(distance_opuesta*distance_opuesta)) / x;
		var angle = Math.acos(z);
		return (angle*180)/Math.PI;
	}

	function getDistance(a, b) {
		return Math.sqrt(Math.abs(a.x - b.x)*Math.abs(a.x - b.x) + Math.abs(a.y - b.y)*Math.abs(a.y - b.y))
	}
	
	function comparePartOfBody(pose_user, pose_default){
		if (pose_default.score > 0.75 && pose_user.score > 0.75){
			console.log("Part: " + pose_user.part);
			console.log("User x: " + pose_user.position.x);
			console.log("User y: " + pose_user.position.y);
			console.log("Default x: " + pose_default.position.x);
			console.log("Default y: " + pose_default.position.y);
		} 
	}
	
	startbutton.addEventListener('click', function(ev){
		takepicture();
		ev.preventDefault();
	}, false);
	
})();