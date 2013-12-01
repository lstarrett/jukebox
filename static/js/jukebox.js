// Don't run scripts until initial document is loaded
$(document).ready(function() {
	
	// Object that contains all the state information of the jukebox
	// which is distributed to all clients
	var state = null;
	var me = 'none';
	var controlling = false;
	
	// Intitial sync with server, then routine update polling
	$.getJSON('sync', function(data) {
		state = data;
		console.log(JSON.stringify(state));//DEBUG
	});
	setInterval(function() {
		var control = me;
		if (state != null && controlling == true) {
			control = JSON.stringify(state);
			console.log("DEBUG: apparently this guy is in control");//DEBUG
		}
		$.getJSON('sync', control, function(data) {
			state = data;
		});
		if (!controlling) {
			setupSongs();
			setupUsers();
		}
	}, 5000);
	
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
			$(user).prependTo('#userlist');
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
	
	// Display file chooser when upload button is clicked
	$(document).on('click', '.song-remove-btn', function(){
		removeSong($(this).parent());
	});
	
	// Display file chooser when upload button is clicked
	$("#upload").click(function() {
		//$("#chooser").click();
		// add an item to the list, just to see it work
		var item = document.createElement("li");
		item.id = 'Uploaded Song';
		item.className = 'card song-block';
		item.innerHTML = item.id + '<div class="card song-remove-btn">X</div>'
		addSong(item);
		$('#sortable').sortable();
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
