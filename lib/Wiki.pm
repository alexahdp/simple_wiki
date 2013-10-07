package Wiki;
use Mojo::Base 'Mojolicious';
use Mango;

use  strict;
use warnings;

#has db => sub { Mango->new('mongodb://localhost:27017')->db('wiki'); };

# This method will run once at server start
sub startup {
	my $self = shift;
	
	# Documentation browser under "/perldoc"
	#$self->plugin('PODRenderer');
	
	$self->plugin('DefaultHelpers');
	$self->plugin('Wiki::Plugin::Helpers');
	
	$self->helper(mango => sub { state $mango = Mango->new('mongodb://localhost:27017/wiki') });
	#$self->helper(db => sub { my $s = shift; $s->app->db;});
	#$self->helper(db => sub { $self->db });
	
	# Router
	my $r = $self->routes;
	
	$r->get('/login')->to('user#login_form');
	$r->post('/login')->to('user#login');
	$r->get('/logout')->to('user#logout');
	
	$r->get('/registration')->to('user#registration_form');
	$r->post('/registration')->to('user#registration');
	
	# Authentication bridge
	my $aub = $r->bridge->to('user#auth_bridge');
	
	$aub->get('/wiki/:url_title')->to('articles#list')->name('wiki');
	$aub->get('/wiki')->to('articles#list');
	$aub->post('/wiki')->to('articles#add');
	$aub->put('/wiki/:url_title')->to('articles#update');
	$aub->delete('/wiki/:url_title')->to('articles#remove');
	
	$aub->get('/wall/:page')->to('wall#list', page => 1)->name('wall');
	$aub->post('/wall')->to('wall#add');
	#$r->get('/:any') => sub{shift->redirect_to('wall#list')};
	
	$aub->get('/tasks/:uname')->to('tasks#list', 'uname' => undef)->name('tasks');
	$aub->post('/tasks')->to('tasks#create');
	$aub->put('/tasks/:id')->to('tasks#update');
	$aub->delete('/tasks/:id')->to('tasks#remove');
	
	$r->get('/' => sub {shift->redirect_to('/login')});
#	$r->get('/(*any)') => sub { shift->redirect_to('/login');  };

}

1;
