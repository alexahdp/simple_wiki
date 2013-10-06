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
	
	my $complete_tasks_arr = $s->mango->db->collection('task')->find({'complete' => '1'})->all;
	$complete_tasks_arr = [ map { $_->{'date_add'} = $s->dmy($_->{'date_add'}); $_; } @$complete_tasks_arr ];
	my $complete_tasks = {};
	for ( @$complete_tasks_arr ) {
		if (defined $complete_tasks->{ $_->{'date_add'} }) {
			$complete_tasks->{ $_->{'date_add'} } = [(@{$complete_tasks->{ $_->{'date_add'} }}, $_)];
		} else {
			$complete_tasks->{ $_->{'date_add'} } = [$_];
		}
	}
	my $tasks = $s->mango->db->collection('task')->find({complete => '0'})->all;
	
	$s->render(template => 'tasks', complete_tasks => $complete_tasks, tasks => $tasks);
};


sub create {
	my $s = shift;
	my $task = {
		'date_add' => time,
		'task'     => $s->p('task'),
		'complete' => '0',
	};
	$s->mango->db->collection('task')->insert($task);
	$s->render(json => {success => $s->json->true});
};


sub remove {
	my $s = shift;
	$s->mango->db->collection('task')->remove({'_id' => Mango::BSON::ObjectID->new($s->p('id'))});
	$s->render(json => {success => $s->json->true});
};


sub update {
	my $s = shift;
	my $task = $s->req->params()->to_hash;
	$s->mango->db->collection('task')->update(
		{'_id' => Mango::BSON::ObjectID->new($s->p('id'))},
		{'$set' => $task}
	);
	$s->render(json => {'success' => $s->json->true});
};


1;
