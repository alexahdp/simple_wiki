package Wiki::Articles;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mango::BSON::ObjectID;
use Mango::Collection;
use Mango::Cursor;
use strict;
use warnings;

sub list {
	my $s = shift;
	
	my $collection = Mango::Collection->new(db => $s->mango->db)->name('articles');
	my $res = $collection->aggregate([{'$group' => {_id => '$url_title', ver => {'$max' => '$version'}}}]);
	my $articles = [map {
		warn Dumper($_);
		$s->mango->db->collection('articles')->find_one({url_title => $_->{'_id'}, version => $_->{ver}});
	} @$res];
	
	#my $articles = $s->mango->db->collection('articles')->find->all || [];
	$s->render(
		template     => 'wiki',
		'articles'   => $articles,
		'url_title'  => $s->p('url_title') || ''
	);
}

sub add {
	my $s = shift;
	my $u = $s->stash('user');
	
	my $url_title = lc $s->win2translit($s->p('title'));
	
	if ($s->mango->db->collection('articles')->find_one({url_title => $url_title})) {
		return $s->render(json => {'success' => $s->json->false, msg => 'Article with this title already exists'});
	}
	
	my $article = {
		author      => $u->{'username'},
		title       => $s->p('title'),
		url_title   => $url_title,
		date_add    => time,
		date_update => time,
		content     => $s->p('content') || "",
		version     => 0,
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
	my $id = Mango::BSON::ObjectID->new($s->p('id'));
	
	# у меня есть только id, поэтому надо получить url_title
	my $article = $s->mango->db->collection('articles')->find_one({_id => $id});
	if (not $article) {
		return $s->render(json => {'success' => $s->json->false});
	}
	
	# 
	my $all_versions = $s->mango->db->collection('articles')->find({ url_title => $article->{url_title} })->sort({version => -1})->all;
	
	my $new_article = $all_versions->[(length @$all_versions) - 1];
	$new_article->{'content'} = $content;
	$new_article->{'date_update'} = time;
	$new_article->{version}++;
	delete $new_article->{_id};
	
	$s->mango->db->collection('articles')->insert($new_article);
	
	if (@$all_versions > 3) {
		$s->mango->db->collection('articles')->remove({_id => Mango::BSON::ObjectID->new($all_versions->[0]->{_id})});
	}
	
	$s->render(json => {'success' => $s->json->true});
};

sub remove {
	my $s = shift;
	$s->mango->db->collection('articles')->remove({'_id' => Mango::BSON::ObjectID->new($s->p('url_title'))});
	$s->render(json => {'success' => $s->json->true});
}

1;
