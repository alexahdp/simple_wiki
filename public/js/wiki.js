'use strict';

$(function(){
	 var wb = $('.article-content-edit textarea').wysibb({
		smileList: '',
		minHeight: 400,
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
						window.location = '/wiki/' + res.url_title;
					}
				});
			}else{
				
			}
		});
	});
	
	$('.save-article').click(function(){
		$.ajax({
			url: '/wiki/' + $('.article-id').text(),
			type: 'put',
			data: {content: $('.article-content-edit textarea').bbcode()},
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
			url: '/wiki/' + me.parent().attr('data-id'),
			type: 'delete',
			success: function(res){
				if (res.success) {
					window.location.href='';
				}
			}
		});
	});
});