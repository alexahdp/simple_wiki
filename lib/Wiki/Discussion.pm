package Wiki::Discussion;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mojo::JSON;
use Mango::BSON::ObjectID;
use utf8;

use strict;
use warnings;


sub index {
	my $s = shift;
	
	my $discussions = $s->mango->db->collection('discussion')->find()->all;
	my $discussion = [grep { $_->{'url_title'} eq $s->p('url_title') } @$discussions]->[0];
	
	$s->render(
		'template'     => 'discussion',
		'discussions'  => $discussions,
		'discussion'   => $discussion,
		'url_title'    => $s->p('url_title') || '',
	);
};


sub create {
	my $s = shift;
	my $url_title = lc $s->win2translit($s->trim($s->p('title')));
	
	unless (length $s->p('title') > 3 && $s->p('title') =~ /^[\w_]+$/) {
		$s->render(json => { 'success' => $s->json->false, msg => 'invalid discussion title' });
	}
	
	if ($s->mango->db->collection('discusson')->find_one({url_title => $url_title})) {
		$s->render(json => { 'success' => $s->json->false, msg => 'discussion already exists' });
	}
	
	my $discussion = {
		title     => $s->p('title'),
		url_title => $url_title,
		author    => $s->stash('user')->{'username'},
		date_add  => time,
		answers   => [],
	};
	
	$s->mango->db->collection('discussion')->insert($discussion);
	$s->render(json => {'success' => $s->json->true, url_title => $discussion->{url_title}});
};


sub add_answer {
	my $s = shift;
	my $url_title = $s->p('url_title');
	my $answer = {
		author   => $s->stash('user')->{username},
		date_add => time,
		text     => $s->p('answer'),
	};
	
	$s->mango->db->collection('discussion')->update(
		{ 'url_title' => $url_title             },
		{ '$push'     => { answers => $answer } }
	);
	$s->redirect_to('/discussion/'.$url_title);
};


1;
