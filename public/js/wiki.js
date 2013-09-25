$(function(){
	 var wb = $('.article-content-edit textarea').wysibb({
		buttons: "bold,italic,underline,|,img,link,|,code,quote"
	});
	
	$('.article-edit').click(function(){
		$('.article-content').hide();
		$('.article-content-edit').show();
		$('.edit-controls').show();
	});
	
	$('.cancel-article').click(function(){
		$('.article-content').show();
		$('.article-content-edit').hide();
		$('.edit-controls').hide();
	});
	
	$('.add-article').click(function(){
		alertify.prompt("Заголовок", function(e, str){
			if (e) {
				$.post('/wiki', {title: str, content: ""}, function(res){
					if (res.success) {
						window.location = '/wiki';
					}
				});
			}else{
				
			}
		});
	});
	
	$('.save-article').click(function(){
		$.ajax({
			url: '/wiki',
			type: 'put',
			data: {id: $('.article-id').text(), content: $('.article-content-edit textarea').bbcode()},
			success: function(res){
				if (res.success){
					window.location.href = '';
				}
			}
		})
	});
	
	$('.article-remove').click(function(){
		var me = $(this);
		$.ajax({
			url: '/wiki',
			type: 'delete',
			data: {id: me.parent().attr('data-id')},
			success: function(res){
				if (res.success) {
					window.location.href='';
				}
			}
		});
	});
});