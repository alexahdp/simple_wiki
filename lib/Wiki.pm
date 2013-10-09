package Wiki;
use Mojo::Base 'Mojolicious';
use Mango;

use  strict;
use warnings;

#has db => sub { Mango->new('mongodb://localhost:27017')->db('wiki'); };

# This method will run once at server start
sub startup {
	my $self = shift;

	$self->secret('Kds7_adH3hs7h4KHsh_Hs2ox');
        $self->sessions->default_expiration(86400 * 30);

	
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
	
	$aub->get('/wiki/:url_title')->to('articles#list', url_title => undef)->name('wiki');
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
	$aub->post('/task_sort')->to('tasks#sort');
	
	$aub->get('/discussion/:url_title')->to('discussion#list', url_title => undef)->name('discussion');
	$aub->post('/discussion')->to('discussion#create');
	$aub->post('/discussion/add_answer/:url_title')->to('discussion#add_answer');
	
	$r->get('/' => sub {shift->redirect_to('/login')});
}

1;
