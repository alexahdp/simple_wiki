$(function(){
	
	$('.new-discussion').click(function(){
		alertify.prompt("Заголовок", function(e, str){
			if (e) {
				$.post('/discussion', {title: str, content: ""}, function(res){
					if (res.success) {
						window.location = '/discussion/' + res.url_title;
					}
				});
			}else{
				
			}
		});
	});
});