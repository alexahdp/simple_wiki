package Wiki::User;
use Mojo::Base 'Mojolicious::Controller';
use Encode 'encode';
use Digest::MD5 'md5_hex';

use strict;
use warnings;

sub salt {
	'J3oF4hHG_df26d7F4jhgsD';
};

sub auth_bridge {
	my $s = shift;
	if ($s->session('user_id')) {
		$s->stash(user => { _id => 'dfdfs34f3f', email => 'alexahdp@rambler.ru', password => '123' });
		return 1;
	}
	$s->redirect_to('/login');
	return 0;
};

sub login_form {
	my $s = shift;
	$s->render('login');
};

sub login {
	my $s = shift;
	
	my $passw = '123';
	if ($s->p('password') eq '123') {
		$s->session(user_id => 'ad32fds2rf3rf');
		$s->redirect_to('/wiki');
	} else {
		$s->render(template => 'login', email => $s->p('email'), warnings => 'Неверный email или пароль');
	}
};

sub logout {
	my $s = shift;
	$s->session(expires => 1);
	$s->redirect_to('/login');
};

sub registration_form {
	my $s = shift;
	$s->render('registration');
};

sub get_passw {
	my $s = shift;
	my $raw_passw = shift;
	md5_hex(encode('utf8', $raw_passw.$s->salt));
}

sub registration {
	my $s = shift;
	
	
	
	my $user = {
		first_name => $s->p('first_name'),
		last_name  => $s->p('last_name'),
		email      => $s->p('email'),
		password   => $s->get_passw($s->p('password')),
		active     => 0,
	};
	
	if (1) {
		$s->session(id => 'dsd');
		$s->redirect_to('/');
	} else {
		$s->render(template => 'registration', 'errors' => $@, 'values' => $user);
	}
};

1;
