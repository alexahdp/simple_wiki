function Task(args) {
	if ($.type(args.task) !== 'string' || args.task === '') {
		throw "Error, task not defined";
	}
	
	var task = $.extend({
		complete: '0',
		date_add: new Date().getTime()
	}, args);
	
	return task;
}