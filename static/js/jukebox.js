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
		var control = me;
//		console.log("DEBUG!!: control (should equal me or spectator) is: " + control);
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
					addRemoveButtons();
//					removeEndedSong();
					if (state.songs.length < sent_state.songs.length) {
						console.log("DEBUG!!: removed the last-child of songs");
						removeSong($('#sortable li:last-child'));
					}
//					console.log("        DEBUG: sync finalized, I'm in control");
				}
				else if (state.controlling != 'none') {
					controlling = false;
					$('#participate').addClass('control-disabled').removeClass('controlling').removeClass('take-control');
					$('#participate').html(state.controlling + ' Controlling');
					$('#upload').addClass('upload-btn-disabled');
//					console.log("        DEBUG: sync said someone else is already controlling, disabling button");
				}
				else {
					controlling = false;
					$('#participate').addClass('take-control').removeClass('control-disabled').removeClass('controlling');
					$('#participate').html('TAKE CONTROL');
					$('#upload').addClass('upload-btn-disabled');
//					console.log("        DEBUG: sync says no one is in control, re-enabling control button.");
				}
			}
			if (state != null && !controlling) {
				setupSongs();
			}
			setupUsers();
		});
	}, 1000);

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
			console.log("DEBUG!!: removed the last-child of songs");
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
	
	
	// Make songs rearrangeable
	$(function() {
		//$('#sortable').sortable().bind('sortupdate', updateOrder());
	});
	
	// Add new song
	function addSong(listItem){
		// Add song to state
		state.songs.push(listItem.id);
		console.log(JSON.stringify(state));//DEBUG
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
//		console.log("DEBUGGGGGGGG: index is: " + state.songs.indexOf($(listItem).clone().children().remove().end().text()));
//		console.log("DEBUGGGGGGGG: listItem.id is: " + $(listItem).clone().children().remove().end().text());
		state.songs.splice(state.songs.indexOf($(listItem).clone().children().remove().end().text()), 1);
	
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
//		console.log("    DEBUG: taking control, waiting for sync to finalize");
	});

	$(document).on('click', '.controlling', function(){
		state.controlling = 'release';
		controlling = true;
		$('#participate').html('RELEASING CONTROL...');
//		console.log("    DEBUG: releasing control, waiting for sync to finalize");
	});

	// Remove a song when 'X' on song block is clicked
	$(document).on('click', '.song-remove-btn', function(){
		// TODO DEBUG: this is not working :(
		removeSong($(this).closest('.song-block'));
//		console.log($(this).closest('.song-block').id);
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
//			console.log("===============DEBUG: creating new song");
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
//			console.log("DEBUG UL!!!!!!!!!!!!!!!!!!: " + progress);
	
		},
		fail:function(e, data){
			// Something has gone wrong!
			alert("File failed to upload.");
		}
	
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
//				console.log("Checking password...");
				var nickname = $('#nickname').val();
				var password = $('#password').val();
				if (nickname.length > 0 && valid(nickname) && password == 'test'){ //TODO: replace plaintext check with hash
					clearInterval(checkloop);

					// Remove popin dialog
					$('body').removeClass('avgrund-active');
					setTimeout(function() {
						$('.avgrund-popin').remove();
					}, 500);

					// Add user and change "participate" to "take control"
//					console.log("Welcome!");//DEBUG
					me = nickname;
					$('#participate').replaceWith('<div id="participate" class="card userlist-btn"></div>');
					if (state != null && state.controlling != 'none') {
//						console.log("DEBUG: signed in and someone else is controlling");
						$('#participate').addClass('control-disabled');
						$('#participate').html(state.controlling + ' Controlling');
					}
					else {
//						console.log("DEBUG: signed in, should see take control");
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
