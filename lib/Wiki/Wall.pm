package Wiki::Wall;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mojo::JSON;
use Mango::BSON::ObjectID;
use POSIX qw(ceil);

use strict;
use warnings;


sub list {
	my $s = shift;
	my $count = 10;
	my $page = $s->p('page');
	
	my $posts = [ reverse sort {$a->{date_add} <=> $b->{date_add}} @{$s->mango->db->collection('wall')->find->all || []} ];
	
	my $total = ceil(@$posts / $count);
	
	$posts = [splice @$posts, ($page - 1) * $count, $count];
	$s->render(
		template => 'wall',
		'posts'  => $posts,
		'total'  => $total,
		'page'   => $page,
	);
};


sub get {
	my $s = shift;
	
};


sub add {
	my $s = shift;
	
	my $post = {
		author      => 'alex',
		date_add    => time,
		content     => $s->p('post'),
	};
	
	$s->mango->db->collection('wall')->insert($post);
	$s->redirect_to('/wall');
};


sub update {
	my $s = shift;
	
};


sub remove {
	my $s = shift;
	
};

1;
