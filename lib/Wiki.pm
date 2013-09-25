package Wiki;
use Mojo::Base 'Mojolicious';

use Mango;

#has db => sub { Mango->new('mongodb://localhost:27017')->db('wiki'); };

# This method will run once at server start
sub startup {
	my $self = shift;
	
	# Documentation browser under "/perldoc"
	#$self->plugin('PODRenderer');
	
	$self->helper(mango => sub { state $mango = Mango->new('mongodb://localhost:27017/wiki') });
	#$self->helper(db => sub { my $s = shift; $s->app->db;});
	#$self->helper(db => sub { $self->db });
	
	
	# Router
	my $r = $self->routes;
	
	# Normal route to controller
	$r->get('/')->to('example#welcome');
	
	$r->get('/wiki/:article')->to('articles#list');
	$r->get('/wiki')->to('articles#list');
	$r->post('/wiki')->to('articles#add');
	$r->put('/wiki')->to('articles#update');
	$r->delete('/wiki')->to('articles#remove');
}

1;
