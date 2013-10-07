package Wiki::Tasks;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mojo::JSON;
use Mango::BSON::ObjectID;
use DateTime;

use strict;
use warnings;


sub list{
	my $s = shift;
	my $uname = $s->p('exec') || $s->session('exec') || $s->stash('user')->{'username'};
	$s->session(exec => $uname);
	
	my $complete_tasks_arr = $s->mango->db->collection('task')->find({'complete' => '1', 'exec' => $uname})->all;
	$complete_tasks_arr = [ map { $_->{'date_add'} = $s->dmy($_->{'date_add'}); $_; } @$complete_tasks_arr ];
	my $complete_tasks = {};
	for ( @$complete_tasks_arr ) {
		if (defined $complete_tasks->{ $_->{'date_add'} }) {
			$complete_tasks->{ $_->{'date_add'} } = [(@{$complete_tasks->{ $_->{'date_add'} }}, $_)];
		} else {
			$complete_tasks->{ $_->{'date_add'} } = [$_];
		}
	}
	my $tasks = $s->mango->db->collection('task')->find({complete => '0', exec => $uname})->all;
	
	$s->render(template => 'tasks', complete_tasks => $complete_tasks, tasks => $tasks, exec => $uname);
};


sub create {
	my $s = shift;
	my $task = {
		'exec'     => $s->session('exec'),
		'date_add' => time,
		'task'     => $s->p('task'),
		'complete' => '0',
	};
	my $id = $s->mango->db->collection('task')->insert($task);
	$s->render(json => {success => $s->json->true, id => $id});
};


sub remove {
	my $s = shift;
	$s->mango->db->collection('task')->remove({'_id' => Mango::BSON::ObjectID->new($s->p('id'))});
	$s->render(json => {success => $s->json->true});
};


sub update {
	my $s = shift;
	my $task = $s->req->params()->to_hash;
	warn Dumper($task);
	$s->mango->db->collection('task')->update(
		{'_id' => Mango::BSON::ObjectID->new($s->p('id'))},
		{'$set' => $task}
	);
	$s->render(json => {'success' => $s->json->true});
};


1;