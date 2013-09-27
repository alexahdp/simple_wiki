package Wiki::User;
use Mojo::Base 'Mojolicious::Controller';
use Encode 'encode';
use Digest::MD5 'md5_hex';

use strict;
use warnings;


sub salt { 'J3oF4hHG_df26d7F4jhgsD' };


sub _rules {
	my $s = shift;
	+{
		username => sub {
			length() > 3 && length() < 25 || die \"Username must be more 3 and less 25 symbols";
			m/^[A-z0-9_]+$/ || die \"Username contains forbidden symbols";
			$s->mango->db->collection('user')->find_one({username => $_}) and die \"Этот username занят";
			1;
		},
		email => sub {
			m{^[-a-z0-9!#$%&'*+/=?^_`{|}~]+(?:[-a-z0-9!#$%&'*+/=?^_`{|}~\.]+)*@(?:[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*(?:aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$} || die \"Некорректный Email";
			$s->mango->db->collection('user')->find_one({'email' => $_}) and die \"Этот email уже используется";
			1;
		},
		password => sub {
			length() >= 4 || die \"Слишком короткий пароль";
			1;
		},
		first_name => sub {
			length() >= 2 || die \"Слишком короткое имя"; length() <= 40 || die \"Слишком длинное имя";
			1;
		},
		last_name => sub {
			length() >= 2 || die \"Слишком короткое имя"; length() <= 40 || die \"Слишком длинная фамилия";
			1;
		}
	}
};


sub auth_bridge {
	my $s = shift;
	if ($s->session('user_id')) {
		my $user = $s->mango->db->collection('user')->find_one({'_id' => $s->session('user_id')});
		
		$s->stash(user => $user);
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
	my $user = $s->mango->db->collection('user')->find_one({'email' => $s->p('email')});
	
	if ( $s->get_passw($s->p('password')) eq $user->{'password'} ) {
		if ($user->{'active'} == 0) {
			return $s->render('wait_active');
		}
		$s->session(user_id => $user->{_id});
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
		username   => $s->p('username'),
	};
	
	eval {
		die {confirm_password => "Ошибка при повторном вводе пароля"} if $s->p('confirm_password') ne $s->p('password');
		$s->filter($s->_rules, $user);
		
		$user->{'active'} = 0;
		$user->{'_id'} = $s->mango->db->collection('user')->insert($user);
		$s->session(id => $user->{'_id'});
		$s->redirect_to('/wall');
	};
	
	$s->render(template => 'registration', 'warnings' => $@, 'values' => $user);
};

1;
