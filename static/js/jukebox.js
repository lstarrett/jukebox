// Object that contains all the state information of the jukebox
// which is distributed to all clients
var state;

setInterval(function() {
	$.getJSON('sync', function(data) {
		state = data;
		console.log(JSON.stringify(state));
		console.log(state.controlling);
	});
	setupSongs();
	setupUsers();
}, 2000);

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
		song.innerHTML = state.songs[i] + '<div class="card song-remove-btn" id="foo">X</div>';
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
	$("#placeholders li:first-child")
		.remove()
	$(listItem)
		.css('opacity',0.0)
		.prependTo('#sortable')
		.animate({opacity: 1.0})
}

// Remove a song
function removeSong(listItem){
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
	item.className = 'card song-block';
	item.innerHTML = 'Song 6<div class="card song-remove-btn" id="foo">X</div>'
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

// Display modal dialog using Avgrund
$(function() {
	$('#participate').avgrund({
		height: 230,
		holderClass: 'card',
		template: '    <div class="card welcome-modal">WELCOME!</div>' +
		          '    <div class="form-group">' +
		          '        <input type="text" value placeholder="Nickname" class="form-control">' +
		          '    </div>' +
		          '    <div class="form-group has-success">' +
		          '        <input type="text" value placeholder="Channel Password" class="form-control">' +
		          '        <span class="input-icon fui-check-inverted"></span>' +
		          '    </div>'
	});
});
