package Wiki::Plugin::Helpers;
use Mojo::Base 'Mojolicious::Plugin';
use DateTime;
use Mojo::JSON;

#use strict;
use warnings;


sub register {
	my($plugin, $app) = @_;
	
	$app->helper('json' => sub { Mojo::JSON->new });
	$app->helper('p' => sub { my $s = shift; scalar $s->param(@_) });
	
	$app->helper(trim => sub {
		my $s = shift;
		my $str = shift;
		$str =~ s/^\s+//; $str =~ s/\s+$//; $str;
	});
	
	$app->helper('dmy' => sub{
		my $s = shift;
		my $dt = shift;
		DateTime->from_epoch('epoch' => $dt, time_zone => 'Europe/Moscow')->dmy('.');
	});
	
	$app->helper('hm' => sub{
		my $s = shift;
		my $dt = shift;
		DateTime->from_epoch('epoch' => $dt, time_zone => 'Europe/Moscow')->hour.":".DateTime->from_epoch('epoch' => $dt, time_zone => 'Europe/Moscow')->minute;
	});
	
	$app->helper('hms' => sub{
		my $s = shift;
		my $dt = shift;
		DateTime->from_epoch('epoch' => $dt, time_zone => 'Europe/Moscow')->hms(':');
	});
	
	$app->helper('dmyhm' => sub{
		my $s = shift;
		my $dt = shift;
		$s->dmy($dt)." ".$s->hm($dt);
	});
	
	$app->helper('dmyhms' => sub{
		my $s = shift;
		my $dt = shift;
		$s->dmy($dt)." ".$s->hms($dt);
	});
	
	$app->helper('user_list' => sub {
		my $s = shift;
		$s->mango->db->collection('user')->find()->all;
	});
	
	$app->helper('extend' => sub {
		my ($def, $extended_object) = @_;
		my $default_object = {%$def};
		foreach ( keys %{$extended_object} ){
			if (ref $extended_object->{$_} eq 'HASH'){
				extend( $default_object->{$_} ||= {}, $extended_object->{$_} );
			} else {
				$default_object->{$_} = $extended_object->{$_};
			};
		};
		$default_object;
	});
	
	$app->helper(filter => sub {
		my $s   = shift;
		
		my $err;
		my $new = {};
		
		foreach my $k ( keys %{$_[1]} ) {
			my $v = $_[1]->{$k};
			if (my $r = $_[0]->{$k}){
				if ( ref $r eq 'ARRAY' and ref $v eq 'ARRAY') {
					my $u;
					$new->{$k} = [
						grep {
							!$u->{$_}++
						} grep {
							$r->[0]->()
						} map { $_ } @$v
					];
				}elsif(ref $r eq 'CODE'){
					for (map { $_ } $v){
						eval {
							$new->{$k} = $_ if $r->();
						};
						$err->{$k} = ${$@} if $@;
					};
				}elsif(ref $r eq 'HASH' and ref $v eq 'HASH'){
					eval {
						$new->{$k} = $s->_filter($r,$v);
					};
					$err->{$k} = $@ if $@;
				};
			};
		};
		die $err if $err;
		$new;
	});
	
	$app->helper('win2translit' => sub {
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
}

1;
