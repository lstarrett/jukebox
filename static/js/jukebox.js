// Rearrangeable songs
$(function() {
	$('#sortable').sortable();
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


// Shift list items down when a new one is added
function prependListItem(listName, listItemHTML){
	$("#placeholders li:first-child")
		.slideUp('fast', function() { $(this).remove() })
	$(listItemHTML)
		.hide()
		.css('opacity',0.0)
		.prependTo('#' + listName)
		.slideDown('fast')
		.animate({opacity: 1.0})
}


// Display file chooser when upload button is clicked
$("#upload").click(function() {
	//$("#chooser").click();
	// add an item to the list, just to see it work
	var item = document.createElement("li");
	item.className = 'card song-block';
	item.innerHTML = 'Song 6<div class="card song-remove-btn">X</div>'
	prependListItem('sortable', item);
	$('#sortable').sortable();
});

// When a file is chosen, push it to the server
$("#chooser").change(function() {
	$("#chooser-submit").click();



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

