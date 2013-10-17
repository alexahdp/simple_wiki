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
	
	# Для каждого url_title надо получить max версию
	# Mongo группирует и возвращает все как надо, кроме одного: url_title называется _id.
	# Поэтому приходится дополнительно пробегаться map'ом
	my $res = [
		map {
			{
				url_title => $_->{_id},
				version   => $_->{version},
			}
		} @{ $collection->aggregate([{'$group' => {_id => '$url_title', version => {'$max' => '$version'}}}]) }
	];
	# После того, как у нас есть url_title и version всех заметок, можем спокойно выбирать по этим ключам
	my $articles = $s->mango->db->collection('articles')->find({'$or' => $res})->all;
	
	#my $articles = $s->mango->db->collection('articles')->find->all || [];
	$s->render(
		template     => 'wiki',
		'articles'   => $articles,
		'url_title'  => $s->p('url_title') || ''
	);
}

sub create {
	my $s = shift;
	my $u = $s->stash('user');
	
	my $url_title = lc $s->win2translit($s->p('title'));
	
	# url_title должно быть уникальным, поэтому проверяем на существование
	if ($s->mango->db->collection('articles')->find_one({url_title => $url_title})) {
		return $s->render(json => {'success' => $s->json->false, msg => 'Article with this title already exists'});
	}
	
	# TODO валидация данных
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
	
	# Добавить новость на стену
	$s->mango->db->collection('wall')->insert({
		author   => 'system',
		date_add => time,
		content  => $u->{'username'}." add new article [b]".$article->{'title'}."[/b] to wiki"
	});
	
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
	
	# Выбрать все версии указанного документа. Все версии нужны, чтобы знать количество и _id первого и последнего
	# Версий одного документа обычно хранится немного, поэтому позволительно
	my $all_versions = $s->mango->db->collection('articles')
		->find({ url_title => $article->{url_title} })
		->sort({version => 1})
		->all;
	
	# Вот здесь надо именно клонировать, иначе получу ссылку и геморрой
	my $new_article = {%{$all_versions->[-1]}};
	$new_article->{'content'} = $content;
	$new_article->{'date_update'} = time;
	$new_article->{'update_author'} = $s->stash('user')->{'username'};
	$new_article->{'version'}++;
	delete $new_article->{'_id'};
	
	$s->mango->db->collection('articles')->insert($new_article);
	
	if (@$all_versions > 3) {
		$s->mango->db->collection('articles')
			->remove({ _id => Mango::BSON::ObjectID->new($all_versions->[0]->{_id}) });
	}

	$s->render(json => {'success' => $s->json->true});
};

sub remove {
	my $s = shift;
	$s->mango->db->collection('articles')
		->remove({ '_id' => Mango::BSON::ObjectID->new($s->p('url_title')) });
	$s->render(json => {'success' => $s->json->true});
}

1;
