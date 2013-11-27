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

$("#upload").click(function() {
	$("#chooser").click();
});
