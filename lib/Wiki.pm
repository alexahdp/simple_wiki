package Wiki;
use Mojo::Base 'Mojolicious';
use Mango;

use  strict;
use warnings;

#has db => sub { Mango->new('mongodb://localhost:27017')->db('wiki'); };
has conf => sub { do "config/wiki.conf" };

# This method will run once at server start
sub startup {
	my $self = shift;
	
	$self->mode('development');
	$self->secret($self->conf->{session}{secret});
	$self->sessions->default_expiration($self->conf->{session}{expiration});
	
	# Documentation browser under "/perldoc"
	#$self->plugin('PODRenderer');
	
	$self->plugin('DefaultHelpers');
	$self->plugin('Wiki::Plugin::Helpers');
	
	$self->helper(mango => sub { state $mango = Mango->new( $self->conf->{db}{address} ) });
	#$self->helper(db => sub { my $s = shift; $s->app->db;});
	#$self->helper(db => sub { $self->db });
	$self->log(Mojo::Log->new({'level' => 'info', path => 'log/mojo.log'}));
	open(STDERR, '>>', 'log/mojo.log');
	
	# Router
	for ($self->routes) {
		
		$_->get('/login')->to('user#login_form');
		$_->post('/login')->to('user#login');
		$_->get('/logout')->to('user#logout');
		
		$_->get('/registration')->to('user#registration_form');
		$_->post('/registration')->to('user#registration');
		
		# Authentication bridge
		for ($_->bridge->to('user#auth_bridge')) {
			
			$_->get('/wiki/:url_title')->to('articles#list', url_title => undef)->name('wiki');
			$_->post('/wiki')->to('articles#create');
			$_->put('/wiki/:id')->to('articles#update');
			$_->delete('/wiki/:url_title')->to('articles#remove');
			
			$_->get('/wall/:page')->to('wall#list', page => 1)->name('wall');
			$_->post('/wall')->to('wall#add');
			#$r->get('/:any') => sub{shift->redirect_to('wall#list')};
			
			$_->get('/tasks/:uname')->to('tasks#list', 'uname' => undef)->name('tasks');
			$_->get('/jtasks_complete/:uname')->to('tasks#complete_tasks', 'uname' => undef);
			$_->get('/jtasks_/:uname/:page')->to('tasks#tasks', 'uname' => undef, page => 0);
			$_->get('/jtasks_updates/:uname')->to('tasks#updates', 'uname' => undef);
			$_->post('/tasks')->to('tasks#create');
			$_->put('/tasks/:id')->to('tasks#update');
			$_->delete('/tasks/:id')->to('tasks#remove');
			$_->post('/task_sort')->to('tasks#sort');
			$_->post('/tasks/change_user/:exec')->to('tasks#change_user', exec => '');
			
			$_->get('/discussion/:url_title')->to('discussion#index', url_title => undef)->name('discussion');
			$_->post('/discussion')->to('discussion#create');
			$_->post('/discussion/add_answer/:url_title')->to('discussion#add_answer');
		}
		$_->get('/' => sub {shift->redirect_to('/wiki')});
	}
}

1;
