package Wiki;
use Mojo::Base 'Mojolicious';
use Mango;

use DateTime;

use  strict;
use warnings;

#has db => sub { Mango->new('mongodb://localhost:27017')->db('wiki'); };

# This method will run once at server start
sub startup {
	my $self = shift;
	
	# Documentation browser under "/perldoc"
	#$self->plugin('PODRenderer');
	
	$self->plugin('DefaultHelpers');
	
	$self->helper(mango => sub { state $mango = Mango->new('mongodb://localhost:27017/wiki') });
	#$self->helper(db => sub { my $s = shift; $s->app->db;});
	#$self->helper(db => sub { $self->db });
	
	$self->helper('p' => sub { my $s = shift; scalar $s->param(@_) });
	
	$self->helper('win2translit' => sub {
		my $s = shift;
		for (my $str = shift) {
			s/Сх/Sсh/; s/сх/sсh/; s/СХ/SСH/;
			s/Ш/Sh/g; s/ш/sh/g;
			
			s/Сцх/Sch/; s/сцх/sch/; s/СЦХ/SCH/;
			s/Щ/Sch/g; s/щ/sch/g;
			
			s/Цх/Ch/; s/цх/ch/; s/ЦХ/CH/;
			s/Ч/Ch/g; s/ч/ch/g;
			
			s/Йа/Ya/; s/йа/Ya/; s/ЙА/YA/;
			s/Я/Ya/g; s/я/ya/g;
			
			s/Йо/Yo/; s/йо/yo/; s/ЙО/YO/;
			s/Ё/Yo/g; s/ё/jo/g;
			
			s/Йу/Yu/; s/йу/yu/; s/ЙУ/YU/;
			s/Ю/U/g; s/ю/u/g;
			
			s/Э/E/g; s/э/e/g;
			s/Е/E/g; s/е/e/g;
			
			s/Зх/Zh/g; s/зх/zh/g; s/ЗХ/ZH/g;
			s/Ж/Zh/g; s/ж/zh/g;
			
			s/ъ//g; s/Ъ//s; s/ь//g; s/Ь//g;
			
			s/\s/_/;
			
			tr/
			абвгдзийклмнопрстуфхцыАБВГДЗИЙКЛМНОПРСТУФХЦЫ/
			abvgdziyklmnoprstufhcyABVGDZIYKLMNOPRSTUFHCY/;
			
			s/a[^a-z0-9\-_']/_/ig;
			return $_;
		};
	});
	
	$self->helper('get_dt' => sub{
		my $s = shift;
		my $dt = shift;
		my $d = DateTime->from_epoch(epoch => $dt, time_zone => 'Europe/Moscow');
		$d->hms.' '.$d->ymd('.');
	});
	
	# Router
	my $r = $self->routes;
	
	$r->get('/login')->to('user#login_form');
	$r->post('/login')->to('user#login');
	$r->get('/logout')->to('user#logout');
	
	$r->get('/registration')->to('user#registration_form');
	$r->post('/registration')->to('user#registration');
	
	# Authentication bridge
	my $aub = $r->bridge->to('user#auth_bridge');
	
	$aub->get('/wiki/:url_title')->to('articles#list')->name('wiki');
	$aub->get('/wiki')->to('articles#list');
	$aub->post('/wiki')->to('articles#add');
	$aub->put('/wiki/:url_title')->to('articles#update');
	$aub->delete('/wiki/:url_title')->to('articles#remove');
	
	$aub->get('/wall')->to('wall#list')->name('wall');
	$aub->post('/wall')->to('wall#add');
	#$r->get('/:any') => sub{shift->redirect_to('wall#list')};

	$r->get('/' => sub {shift->redirect_to('/login')});
#	$r->get('/(*any)') => sub { shift->redirect_to('/login');  };

}

1;
