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
		console.log(JSON.stringify(state));//DEBUG
	});
	setInterval(function() {
		var control = me;
		console.log("DEBUG!!: control (should equal me or spectator) is: " + control);
		if (state != null && controlling == true) {
			control = JSON.stringify(state);
		}
		$.getJSON('sync', control, function(data) {
			state = data;
			if (me != 'spectator') {
				if (state.controlling == me) {
					$('#participate').addClass('controlling').removeClass('take-control').removeClass('control-disabled');
					$('#participate').html('RELEASE CONTROL');
					console.log("        DEBUG: sync finalized, I'm in control");
				}
				else if (state.controlling != 'none') {
					controlling = false;
					$('#participate').addClass('control-disabled').removeClass('controlling').removeClass('take-control');
					$('#participate').html(state.controlling + ' Controlling');
					console.log("        DEBUG: sync said someone else is already controlling, disabling button");
				}
				else {
					controlling = false;
					$('#participate').addClass('take-control').removeClass('control-disabled').removeClass('controlling');
					$('#participate').html('TAKE CONTROL');
					console.log("        DEBUG: sync says no one is in control, re-enabling control button.");
				}
			}
			if (state != null && !controlling) {
				setupSongs();
				setupUsers();
			}
		});
		if (state != null && !controlling) {
			setupSongs();
			setupUsers();
		}
	}, 1000);
	
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
			song.innerHTML = state.songs[i] + '<div class="card song-remove-btn">X</div>';
			$(song).prependTo('#sortable');
		}
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
		$('#sortable').sortable();
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
	}
	
	// Remove a song
	function removeSong(listItem){
		// Remove song from state
		state.songs.splice(state.songs.indexOf(listItem.id), 1);
		console.log(JSON.stringify(state));//DEBUG
	
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
	}
	
	$(document).on('click', '.take-control', function(){
		state.controlling = me;
		controlling = true;
		$('#participate').html('WAITING...');
		console.log("    DEBUG: taking control, waiting for sync to finalize");
	});

	$(document).on('click', '.controlling', function(){
		state.controlling = 'release';
		controlling = true;
		$('#participate').html('RELEASING CONTROL...');
		console.log("    DEBUG: releasing control, waiting for sync to finalize");
	});

	// Remove a song when 'X' on song block is clicked
	$(document).on('click', '.song-remove-btn', function(){
		removeSong($(this).parent());
	});
	
	// Display file chooser when upload button is clicked
	$("#upload").click(function() {
		$("#chooser").click();
		// add an item to the list, just to see it work
//		var item = document.createElement("li");
//		item.id = 'Uploaded Song';
//		item.className = 'card song-block';
//		item.innerHTML = item.id + '<div class="card song-remove-btn">X</div>'
//		addSong(item);
//		$('#sortable').sortable();
	});
	
	// When a file is chosen, push it to the server
	$("#chooser").change(function() {
		$("#chooser-submit").click();
	
		// TODO: I wish uploads worked over ajax. It would be cleaner.
		/*alert("chooser has a file!");
		//var file = this.files[0];
		//var formData = new FormData($("#fileform")[0]);
		var formData = new FormData($('form')[0]);
		$.ajax({
			url: 'upload',
			type: 'POST',
			xhr: function() {  // Custom XMLHttpRequest
				var myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){ // Check if upload property exists
					myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
				}
				return myXhr;
			},
			success: null,
			error: function(xhr, status) {
				alert(xhr.status)
			},
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
		});*/
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
				console.log("Checking password...");
				var nickname = $('#nickname').val();
				var password = $('#password').val();
				if (nickname.length > 0 && valid(nickname) && password == 'pimpsonly'){ //TODO: replace plaintext check with hash
					clearInterval(checkloop);
					// Add user and change "participate" to "take control"
					console.log("Welcome!");//DEBUG
					me = nickname;
					$('#participate').replaceWith('<div id="participate" class="card userlist-btn"></div>');
					if (state != null && state.controlling != 'none') {
						console.log("DEBUG: signed in and someone else is controlling");
						$('#participate').addClass('control-disabled');
						$('#participate').html(state.controlling + ' Controlling');
					}
					else {
						console.log("DEBUG: signed in, should see take control");
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
