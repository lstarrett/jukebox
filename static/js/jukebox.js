// Don't run scripts until initial document is loaded
$(document).ready(function() {
	
	// Object that contains all the state information of the jukebox
	// which is distributed to all clients
	var state = null;
	var me = 'spectator';
	var controlling = false;
	
	// Intitial sync with server, then routine update polling
	$.getJSON('sync', function(data) {
		state = data;
	});

	setInterval(function() {
		sync();
	}, 2000);

	function sync() {
		var control = me;
		if (state != null && controlling == true) {
			control = JSON.stringify(state);
			console.log("~~~~~~~DEBUG: sent state: " + control);
		}
		$.getJSON('sync', control, function(data) {
			var sent_state = state;
			state = data;
			console.log("~~~~~~~DEBUG: received state: " + JSON.stringify(state));
			console.log("");
			if (me != 'spectator') {
				if (state.controlling == me) {
					$('#participate').addClass('controlling').removeClass('take-control').removeClass('control-disabled');
					$('#participate').html('RELEASE CONTROL');
					$('#upload').removeClass('upload-btn-disabled');
					if (state.playing == 'true') {
						$('#playpause').addClass('playing-control');
					}
					else { 
						$('#playpause').addClass('paused-control');
					}
					$('#playpause').removeClass('playing').removeClass('paused');
					addRemoveButtons();
					if (state.songs.length < sent_state.songs.length) {
						removeSong($('#sortable li:last-child'));
					}
				}
				else if (state.controlling != 'none') {
					controlling = false;
					$('#participate').addClass('control-disabled').removeClass('controlling').removeClass('take-control');
					$('#participate').html(state.controlling + ' Controlling');
					$('#upload').addClass('upload-btn-disabled');
				}
				else {
					controlling = false;
					$('#participate').addClass('take-control').removeClass('control-disabled').removeClass('controlling');
					$('#participate').html('TAKE CONTROL');
					$('#upload').addClass('upload-btn-disabled');
				}
			}
			if (state != null && !controlling) {
				setupSongs();
				colorPlayButton();
			}
			setupUsers();
			colorMusicPanel();
			checkRanges();
		});
	}

	function checkRanges() {
		if ($('#sortable li').length >= 6) {
			$('#upload').addClass('upload-btn-disabled');
		}
		else {
			if (state.controlling == me) {
				$('#upload').removeClass('upload-btn-disabled');
			}
		}
		if ($('#userlist li').length >= 5) {
			$('.participate').addClass('participate-disabled').removeClass('participate');
		}
		else {
			$('.participate-disabled').addClass('participate').removeClass('participate-disabled');
		}
	}

	function addRemoveButtons() {
		$("#sortable").each(function() {
			$("li", this).each(function(index) {
				if (!$(this).has("div").length) {
					$(this).append('<div class="card song-remove-btn">X</div>');
				}
			});
		});
	}

	function removeEndedSong() {
		if (state.songs.length < $('#sortable li').length) {
			removeSong($('#sortable li:last-child'));
		}
	}
	
	// Setup songs
	function setupSongs() {
		$('#sortable').empty();
		$('#placeholders').empty();
	
		for (var i = 0; i < 6; i++) {
			var placeholder = document.createElement("li");
			placeholder.className = 'card song-block';
			placeholder.style.visibility = 'hidden';
			$(placeholder).prependTo('#placeholders');
		}
	
		for (var i = 0; i < state.songs.length; i++) {
			$('#placeholders li:first-child').remove();
			var song = document.createElement("li");
			song.className = 'card song-block';
			song.innerHTML = state.songs[i];
			$(song).prependTo('#sortable');
		}
		//$('#sortable').sortable().bind('sortupdate', updateOrder());
	}
	
	// Setup users
	function setupUsers() {
		$('#userlist').empty();
		for (var i = 0; i < state.users.length; i++) {
			var user = document.createElement("li");
			user.className = 'card userlist-user';
			user.innerHTML = state.users[i];
			$(user).appendTo('#userlist');
		}
	}
	
	function colorMusicPanel() {
		if (state.playing == 'true') {
			$('#musicpanel').addClass('music-control-panel-playing');
		}
		else {
			$('#musicpanel').removeClass('music-control-panel-playing');
		}
	}
	function colorPlayButton() {
		if (state.playing == 'true') {
			$('#playpause').addClass('playing').removeClass('paused');
			$('#playpause').html('PLAYING');
		}
		else {
			$('#playpause').addClass('paused').removeClass('playing');
			$('#playpause').html('PAUSED');
		}
		$('#playpause').removeClass('paused-control').removeClass('playing-control');
	}
	
	// Make songs rearrangeable
	$(function() {
		//$('#sortable').sortable().bind('sortupdate', updateOrder());
	});
	
	// Add new song
	function addSong(listItem){
		// Add song to state
		state.songs.push(listItem.id);
		sync();

		// Push song onto HTML list
		$("#placeholders li:first-child")
			.remove()
		$(listItem)
			.css('opacity',0.0)
			.prependTo('#sortable')
			.animate({opacity: 1.0})
		//$('#sortable').sortable().bind('sortupdate', updateOrder());
	}
	
	// Remove a song
	function removeSong(listItem){
		// Remove song from state
		state.songs.splice(state.songs.indexOf($(listItem).clone().children().remove().end().text()), 1);
		sync();
	
		var placeholder = document.createElement("li");
		placeholder.className = 'card song-block';
		placeholder.style.visibility = 'hidden';
		$(listItem)
			.animate({opacity: 0.0}, function() {
				$(listItem)
					.slideUp('fast', function() {
						this.remove()
					})
				$(placeholder)
					.hide()
					.prependTo('#placeholders')
					.slideDown('fast')
			})
		//$('#sortable').sortable().bind('sortupdate', updateOrder());
	}

	// Update song order in state list
	// TODO DEBUG: this doesn't seem to work right, enable sorting if there's time.
	function updateOrder() {
		// update state order
		//var order = $("#sortable2").sortable("toArray");
		//console.log("|||||||DEBUG: sorted order: " + order);
		//console.log("|||||||DEBUG: sorted order: ");
	}
	
	$(document).on('click', '.take-control', function(){
		state.controlling = me;
		controlling = true;
		$('#participate').html('WAITING...');
	});

	$(document).on('click', '.controlling', function(){
		state.controlling = 'release';
		controlling = true;
		$('#participate').html('RELEASING CONTROL...');
	});

	// Remove a song when 'X' on song block is clicked
	$(document).on('click', '.song-remove-btn', function(){
		removeSong($(this).closest('.song-block'));
	});
	
	// Display file chooser when upload button is clicked
	$("#upload").click(function() {
		if (this.className != 'card upload-btn upload-btn-disabled') {
			$("#chooser").click();
		}
	});
	
	// Initialize the jQuery File Upload plugin for the upload form
	$('#upload-form').fileupload({
		dropZone: $('#drop'),
		add: function (e, data) {
			// Create a new song for this file
			var song = document.createElement("li");
			song.className = 'card song-block';
			song.id = data.files[0].name;
			song.innerHTML = data.files[0].name + '<div class="card song-remove-btn">X</div>';
			addSong(song);

			// Automatically upload the file once it is added to the queue
			var jqXHR = data.submit();
		},
		progress: function(e, data){
			var progress = parseInt(data.loaded / data.total * 100, 10);
		},
		fail:function(e, data){
			// Something has gone wrong!
			alert("File failed to upload.");
		}
	
	});

	// Send a PLAY signal when the PLAY button is clicked
	$(document).on('click', '.paused-control', function(){
		state.playing = 'true';
		sync();
		$('#playpause').addClass('playing-control').removeClass('paused-control');
		$('#playpause').html('PLAYING');
		$('#musicpanel').addClass('music-control-panel-playing');
	});
	// Send a PAUSE signal when the PAUSE button is clicked
	$(document).on('click', '.playing-control', function(){
		state.playing = 'false';
		sync();
		$('#playpause').addClass('paused-control').removeClass('playing-control');
		$('#playpause').html('PAUSED');
		$('#musicpanel').removeClass('music-control-panel-playing');
	});
	
	// Participate dialog
	$(function() {
		$('#participate').avgrund({
			height: 230,
			holderClass: 'card',
			template: '    <div class="card welcome-modal">WELCOME!</div>' +
			          '    <div class="form-group">' +
			          '        <input type="text" value placeholder="Nickname" id="nickname" class="form-control">' +
			          '    </div>' +
			          '    <div class="form-group has-success">' +
			          '        <input type="text" value placeholder="Channel Password" id="password" class="form-control">' +
			          '        <span class="input-icon fui-check-inverted"></span>' +
			          '    </div>'
		});
		
		// when the password box is in focus, continuously check password
		var checkloop;
		$(document).on('focus', '#password', function(){
			checkloop = setInterval(function() {
				var nickname = $('#nickname').val();
				var password = $('#password').val();
				if (nickname.length > 0 && valid(nickname) && password == 'test'){ //TODO DEBUG: replace plaintext check with hash
					clearInterval(checkloop);

					// Remove popin dialog
					$('body').removeClass('avgrund-active');
					setTimeout(function() {
						$('.avgrund-popin').remove();
					}, 500);

					// Add user and change "participate" to "take control"
					me = nickname;
					sync();
					$('#participate').replaceWith('<div id="participate" class="card userlist-btn"></div>');
					if (state != null && state.controlling != 'none') {
						$('#participate').addClass('control-disabled');
						$('#participate').html(state.controlling + ' Controlling');
					}
					else {
						$('#participate').addClass('take-control');
						$('#participate').html('TAKE CONTROL');
					}
				}
			}, 100); // check 10x per second
		});
		$(document).on('focusout', '#password', function(){
			clearInterval(checkloop);
		});
		// make sure nickname is alphanumeric
		function valid(nickname) {
			var regex = new RegExp("^[a-zA-Z0-9]+$");
			if (regex.test(nickname)) {
				return true;
			}
			return false;
		}
	});
});
