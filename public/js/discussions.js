$(function(){
	
	reset = function(){
		alertify.set({
			labels: {
				ok: "ok",
				cancel: "Cancel"
			},
			delay: 5000,
			buttonReverse: false,
			buttonFocus: 'ok'
		});
	};
	
	$('#answer-text').keydown(function(e){
		if (e.ctrlKey && e.keyCode == 13) {
			$('#answer-form').submit();
		}
	});
	
	$('#answer-form').submit(function(e){
		if ($('#answer-text').val().length == 0) {
			e.preventDefault();
			alertify.error("Answer text is empty");
		}
	});
	
	$('.new-discussion').click(function(){
		reset();
		alertify.prompt("Enter new discussion theme", function(e, str){
			if (e) {
				$.post('/discussion', {title: str, content: ""}, function(res){
					if (res.success) {
						window.location = '/discussion/' + res.url_title;
					}
				});
			}else{
				
			}
		}, 'Theme');
		return false;
	});
});