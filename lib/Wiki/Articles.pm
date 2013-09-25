package Wiki::Articles;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mojo::JSON;
use Mango::BSON::ObjectID;
use  strict;
use warnings;

sub list {
	my $s = shift;
	
	$s->render(
		'articles' => $s->mango->db->collection('articles')->find->all || [],
		'current'  => $s->param('article') || 0
	);
}

sub add {
	my $s = shift;
	
	my $article = {
		author => $s->param('title'),
		content => $s->param('content') || ""
	};
	
	$s->mango->db->collection('articles')->insert($article);
	$s->render(json => {'success' => Mojo::JSON->true});
}

sub update {
	my $s = shift;
	my $content = $s->param('content');
	$s->mango->db->collection('articles')->update({_id => Mango::BSON::ObjectID->new($s->param('id'))}, {'$set' => { content => $content }});
	$s->render(json => {'success' => Mojo::JSON->true});
};

sub remove {
	my $s = shift;
	$s->mango->db->collection('articles')->remove({'_id' => Mango::BSON::ObjectID->new($s->param('id'))});
	$s->render(json => {'success' => Mojo::JSON->true});
}

1;
