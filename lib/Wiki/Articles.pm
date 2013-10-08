package Wiki::Articles;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mango::BSON::ObjectID;
use  strict;
use warnings;

sub list {
	my $s = shift;
	
	$s->render(
		template     => 'wiki',
		'articles'   => $s->mango->db->collection('articles')->find->all || [],
		'url_title'  => $s->p('url_title') || ''
	);
}

sub add {
	my $s = shift;
	
	my $u = {username => 'alex'};
	
	my $url_title = lc $s->win2translit($s->p('title'));
	
	my $article = {
		author      => $u->{'username'},
		title       => $s->p('title'),
		url_title   => $url_title,
		date_add    => time,
		date_update => time,
		content     => $s->p('content') || ""
	};
	
	$s->mango->db->collection('articles')->insert($article);
	
	my $wall_post = {
		author   => 'system',
		date_add => time,
		content  => $u->{'username'}." add new article [b]".$article->{'title'}."[/b] to wiki"
	};
	
	$s->mango->db->collection('wall')->insert($wall_post);
	
	$s->render(json => {'success' => $s->json->true, url_title => $url_title});
}

sub update {
	my $s = shift;
	my $content = $s->p('content');
	
	# КАК ЭТО РАБОТАЕТ?!?!?! КАКОЙ-ТО ПИЗДЕЦ
	$s->mango->db->collection('articles')->update(
		{_id => Mango::BSON::ObjectID->new($s->p('url_title'))},
		{'$set' => { content => $content, date_update => time }}
	);
	$s->render(json => {'success' => $s->json->true});
};

sub remove {
	my $s = shift;
	$s->mango->db->collection('articles')->remove({'_id' => Mango::BSON::ObjectID->new($s->p('url_title'))});
	$s->render(json => {'success' => $s->json->true});
}

1;
