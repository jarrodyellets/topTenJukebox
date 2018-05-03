$(document).ready(function(){
	const billboardUrl = "http://billboard.modulo.site/rank/song/";
	const proxy = "https://cors-anywhere.herokuapp.com/";
	const spotifyUrl = "https://api.spotify.com/v1/"
	const headIcon = "<i class='fas fa-headphones'></i>";
	const spotIcon = "<i class='fab fa-spotify'></i>";
	let idUrl;
	let artistUrl;
	let accessToken = [];
	let currentButton;
	let currentSong;
	let currentArtist;
	let isoDate;
	let newDate;
	let newIsoDate;
	let currentDate
	let futureDate;
	let index = 1;
	let audioCounter = 0;
	let songId;
	let value;
	let keyLength;
	let currentlyPlaying;
	let songs = [];
	let audio = [];

	let today = new Date();
	let dd = today.getDate();
	let mm = today.getMonth()+1; //January is 0!
	let yyyy = today.getFullYear();
	 if(dd<10){
	        dd='0'+dd
	    } 
	    if(mm<10){
	        mm='0'+mm
	    } 
	
	today = yyyy+'-'+mm+'-'+dd;
	document.getElementById("date").setAttribute("max", today);

	$(".buttonSubmit").on("click", function(){
		value = $(".date").val();
		if(value){
			index = 1;
			audioCounter = 0;
			songs = [];
			audio = [];
			getToken();
		}
	});

	 $(".selectButton").on("click", function(){
 		if(songs[0].length === 10){
	 		$(".song").removeClass("lightOn");
	 		currentButton = $(this).attr("id").substr(6);
			$(".song" + currentButton).addClass("lightOn");
			loadAudio();
 		}
	});

	$(".buttonStop").on("click", function(){
		if(currentlyPlaying){
			currentlyPlaying.pause();
		}
	});

	$(".buttonPlay").on("click", function(){
		if(currentlyPlaying.paused){
			currentlyPlaying.play();
		}
	});

	function getToken() {
		$(".infoText").empty();
		$(".infoText").removeClass("scroll");
		$(".infoText").append("Loading");
		$(".infoText").addClass("loading");
		$.ajax({
			method: "GET",
			url: "/token",
			success: function(data){
				accessToken.push(data);
				getDates();
			}
		})
	}
	

	function loadAudio(){
		if(currentlyPlaying){
			currentlyPlaying.pause();
			currentlyPlaying.currentTime = 0;
		}
		currentlyPlaying = new Audio(audio[currentButton - 1].tracks.items[0].preview_url);
		playAudio();
	}

	function playAudio(){
		if(currentlyPlaying){
			currentSong = songs[0][currentButton - 1].title;
			currentArtist = songs[0][currentButton - 1].artist;
			let canPlay = $(currentlyPlaying).attr("src");
			if(canPlay != "null"){
				$(".infoText").empty();
				$(".infoText").append(currentSong + " - " + currentArtist);
				$(".infoText").addClass("scroll");
				currentlyPlaying.play();
			} else {
				$(".infoText").empty();
				$(".infoText").append("Click on song to listen on Spotify");
				$(".infoText").addClass("scroll");
			}
		}
	}

	function getCharts(index){
		$(".infoText").removeClass("scroll");
		$(".infoText").empty();
		$(".infoText").append("Loading Songs");
		$(".infoText").addClass("loading");
		$.ajax({
			method: "GET",
			url: "/billboard",
			data: {date: currentDate},
			success: function(data){
				songs.push(data);
				getAudio();
			}
		});
	}

	function getAudio(){
		songName = songs[0][audioCounter].title;
		formatSong = songName.replace(/\s+/g, '+');
		artistName = songs[0][audioCounter].artist;
		formatArtist = artistName.match(/.+?(?= Featuring)/);
		if(formatArtist){
			artist = formatArtist[0].replace(/\s+/g, '+');
		} else {
			artist = artistName.replace(/\s+/g, '+');
		}
		artistUrl = spotifyUrl + "search?q=track:" + formatSong + '%20artist:' + artist + "&type=track&limit=1" + "&market=US";
		$.ajax({
			type: "GET",
			url: artistUrl,
			contentType: "application/json",
			headers: { "Authorization": "Bearer " + accessToken[0].token },
			datatype: "json",
			success: function(data){
				audio.push(data);
				if(audioCounter < 9){
					audioCounter++
					getAudio();
				} else {
					printBoard()
				}
			}
		})

	}

	function getDates(){
		date = new Date(value);
		currentDate = date.toISOString().substring(0, 10);
		getCharts()
	}

	function printBoard(){
		$(".infoText").empty();
		$(".infoText").append("Pick Song");
		$(".infoText").removeClass("loading");
		$(".songTitle").empty();
		$(".artist").empty();
		$(".spotify").empty();
		$(".headphones").empty();
		checkAudio();
	}

	function checkAudio(){
		for(var i = 1; i <= songs[0].length; i++){
			let j = i - 1;
			keyLength = Object.keys(audio[j]).length;
			$(".title" + i).append(songs[0][j].title.substring(0, 35));
			$(".artist" + i).append(songs[0][j].artist.substring(0, 25));
			if(keyLength > 2 && audio[j].external_urls.spotify){
	 			$(".s" + i).attr("href", audio[j].external_urls.spotify);
	 			$(".spotify" + i).append(spotIcon);
	 			if(audio[j].preview_url){
	 				$(".headphones" + i).append(headIcon);
	 			}
 			} else {
	 				if(audio[j].tracks.items[0]){
	 					$(".s" + i).attr("href", audio[j].tracks.items[0].external_urls.spotify);
	 					$(".spotify" + i).append(spotIcon);
	 					if(audio[j].tracks.items[0].preview_url){
	 					$(".headphones" + i).append(headIcon);
	 				}
	 			}
 			}
		}
		$(".song").removeClass("lightOn");
	}
})