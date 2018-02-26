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
	let songId;
	let value;
	let keyLength;
	let currentlyPlaying;
	let songs = [];
	let audio = [];

	getToken();

	$(".buttonSubmit").on("click", function(){
		value = $(".date").val();
		if(value){
			index = 1;
			songs = [];
			audio = [];
			getDates();
		}
	});

	 $(".selectButton").on("click", function(){
 		if(songs.length === 10){
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
		$.ajax({
			method: "POST",
			url: proxy + "https://accounts.spotify.com/api/token",
			data: {"grant_type": "client_credentials",
						"client_secret": "1e2230bc246840cab4e3412883e83f18",
						"client_id": "3b6549a0623b403e89dc4625b9a9e0ae"},
			datatype: "jsonp",
			success: function(data){
				accessToken.push(data);
			}
		})
	}

	function loadAudio(){
		if(currentlyPlaying){
			currentlyPlaying.pause();
			currentlyPlaying.currentTime = 0;
		}
		if(Object.keys(audio[currentButton - 1]).length === 1){
			currentlyPlaying = new Audio(audio[currentButton - 1].tracks.items[0].preview_url);
		} else {
			currentlyPlaying = new Audio(audio[currentButton - 1].preview_url);
		}
		playAudio();
	}

	function playAudio(){
		if(currentlyPlaying){
			currentSong = $(".title" + currentButton).text();
			currentArtist = $(".artist" + currentButton).text();
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
		console.log("charts");
		$(".infoText").removeClass("scroll");
		$(".infoText").empty();
		$(".infoText").append("Loading Song " + (audio.length + 1) + "/10");
		$(".infoText").addClass("loading");
		$.ajax({
			type: "GET",
			url: proxy + billboardUrl + index + "?from=" + currentDate + "&to=" + futureDate,
			header: { "Access-Control-Allow-Origin": "*://*/*" },
			datatype: "json",
			success: function(data){
				songs.push(data);
				getAudio();
			}
		});
	}

	function getAudio(){
		songId = songs[songs.length - 1][0].spotify_id;
		songName = songs[songs.length - 1][0].song_name;
		artistName = songs[songs.length - 1][0].display_artist;
		artist = artistName.replace(/\s+/g, '+');
		artistUrl = spotifyUrl + "search?q=" + songName + "&type=track&limit=1" + "&market=US";
		idUrl = spotifyUrl + "tracks/" + songId + "?market=US";
		$.ajax({
			type: "GET",
			url: (songId) ? idUrl : artistUrl,
			contentType: "application/json",
			headers: { "Authorization": "Bearer " + accessToken[0].access_token },
			datatype: "json",
			success: function(data){
				audio.push(data);
				if(songs.length === index && songs.length !== 10){
					index++
					getCharts(index);
				} else if(songs.length === 10){
					printBoard();
				}
			}
		})
	}

	function getDates(){
		date = new Date(value);
		isoDate = new Date(value);
		newDate = isoDate.setDate(isoDate.getDate() + 7);
		currentDate = date.toISOString().substring(0, 10).replace(/-0+/g, '-');
		newIsoDate = new Date(newDate);
		futureDate = newIsoDate.toISOString().substring(0, 10).replace(/-0+/g, '-');
		getCharts(index);
	}

	function printBoard(){
		console.log(songs);
		console.log(audio);
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
		for(var i = 1; i <= songs.length; i++){
			let j = i - 1;
			keyLength = Object.keys(audio[j]).length;
			$(".title" + i).append(songs[j][0].song_name.substring(0, 35));
			$(".artist" + i).append(songs[j][0].display_artist.substring(0, 25));
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