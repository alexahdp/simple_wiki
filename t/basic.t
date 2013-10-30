use Mojo::Base -strict;
use lib 'lib';
use Test::More;
use Test::Mojo;
use Mojo::JSON;
use Mango;
use Data::Dumper;


my $conf = do 'config/wiki.conf';
my $mango = Mango->new( $conf->{db}->{address} );

#BEGIN {plan tests => 15};

my $t = Test::Mojo->new('Wiki');
$t->get_ok('/')->status_is(302);

$t->post_ok('/login', form => {email => 'test@gmail.com', password => '1234567'})
	->status_is(302);

$t->get_ok('/wall')
	->status_is(200)
	->content_type_is('text/html;charset=UTF-8')
	->element_exists('#wall');

$t->post_ok('/wall', form => {post => '__test_post__'})
	->status_is(302);

if ( my $post = $mango->db->collection('wall')->find_one({content => '__test_post__'}) ) {
	$mango->db->collection('wall')->remove({_id => $post->{_id}});
	ok(1);
} else {
	ok(0);
}



$t->get_ok('/wiki')
	->status_is(200)
	->content_type_is('text/html;charset=UTF-8')
	->element_exists('.article-titles.nav');

$t->post_ok('/wiki', form => {title => '__test_wiki__', content => '__TEST__'})
	->status_is(200)
	->json_is({success => Mojo::JSON->true, url_title => '__test_wiki__'});
	


done_testing();

1;
