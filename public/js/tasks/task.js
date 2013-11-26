function TaskPull({opts}) {
	
	this.el = $(opts.el);
	this.items = [];
	
	this.add = function(task) {
		var t = new Task(task);
		this.items.push(t);
		this.el.append(t.render());
	};
	
	this.remove = function(id) {
		var me = this;
		$(this.items).each(function(i, li) {
			if (li.id === id) {
				me.items.remove(i);
				return false;
			}
		});
	};
	
	this.get = function(id) {
		var me = this;
		var task = null;
		$(this.items).each(function(i, li) {
			if (li.id === id) {
				task = this;
				return false;
			}
		});
		return task;
	}
}

function Task(args) {
	if ($.type(args.task) !== 'string' || args.task === '') {
		throw "Error, task not defined";
	}
	
	if ($.type(args.id) !== 'string' || args.id === '') {
		throw "Error, id not defined";
	}
	
	args = $.extend({
		complete: '0',
		date_add: new Date().getTime()
	}, args);
	
	for (key in args) {
		this[key] = args[key];
	}
}

Task.prototype.render = function(){
	var task_tmpl = _.template($('#task_tmpl').html());
	return task_tmpl(this);
}