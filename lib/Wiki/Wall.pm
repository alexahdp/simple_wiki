package Wiki::Wall;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mojo::JSON;
use Mango::BSON::ObjectID;

use  strict;
use warnings;


sub list {
	my $s = shift;
	
	$s->render(
		template => 'wall',
		'posts' => [ reverse sort {$a->{date_add} <=> $b->{date_add}} @{$s->mango->db->collection('wall')->find->all || []} ],
	);
}


sub get {
	my $s = shift;
	
}


sub add {
	my $s = shift;
	
	my $post = {
		author      => 'alex',
		date_add    => time,
		content     => $s->p('post'),
	};
	
	$s->mango->db->collection('wall')->insert($post);
	$s->redirect_to('/wall');
}


sub update {
	my $s = shift;
	
}


sub remove {
	my $s = shift;
	
}

1;
