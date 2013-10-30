package Wiki::Tasks;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mojo::JSON;
use Mango::BSON::ObjectID;
use DateTime;
use POSIX qw(ceil);
use strict;
use warnings;


sub list {
	my $s = shift;
	my $page = $s->p('page') || 0;
	my $items_on_page = 10;
	
	my $uname = $s->p('exec') || $s->session('exec') || $s->stash('user')->{'username'};
	$s->session(exec => $uname);
	
	my $total = $s->mango->db->collection('task')
		->find({ complete => '1', exec => $uname })
		->count;
	
	$s->render(
		template => 'tasks',
		total => ceil($total / $items_on_page),
		exec => $uname
	);
};

sub tasks {
	my $s = shift;
	
	my $uname = $s->stash('exec') || $s->session('exec') || $s->stash('user')->{'username'};
	
	# Задачи на выполнение
	my $tasks = $s->mango->db->collection('task')
		->find({complete => '0', exec => $uname})
		->all;
	
	$s->render(json => {success => $s->json->true, items => [sort {$a->{'index'} <=> $b->{'index'}} @$tasks ]});
};

sub complete_tasks {
	my $s = shift;
	my $page = $s->stash('page') - 1|| 0;
	my $items_on_page = 10;
	
	my $uname = $s->stash('exec') || $s->session('exec') || $s->stash('user')->{'username'};
	$s->session(exec => $uname);
	
	my $complete_tasks_arr = [
		map {
			$_->{'date_complete_dmy'} = $s->dmy($_->{'date_complete'});
			$_;
		} @{ $s->mango->db->collection('task')
			->find({'complete' => '1', 'exec' => $uname})
			->skip($page * $items_on_page)
			->limit($items_on_page)
			->all
		}
	];
	
	my $complete_tasks = {};
	for ( @$complete_tasks_arr ) {
		if (defined $complete_tasks->{ $_->{'date_complete_dmy'} }) {
			$complete_tasks->{ $_->{'date_complete_dmy'} } = [
				@{$complete_tasks->{ $_->{'date_complete_dmy'} }}, $_
			];
		} else {
			$complete_tasks->{ $_->{'date_complete_dmy'} } = [$_];
		}
	};
	
	$s->render(json => {success => $s->json->true, items => $complete_tasks});
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
	
	$s->mango->db->collection('task')->update(
		{'_id' => Mango::BSON::ObjectID->new($s->p('id'))},
		{'$set' => $task}
	);
	$s->render(json => {'success' => $s->json->true});
};

# 
sub sort {
	my $s = shift;
	
	my $task_indexes = Mojo::JSON->decode($s->p('task_order'));
	for (@$task_indexes) {
		$s->mango->db->collection('task')->update(
			{ _id => Mango::BSON::ObjectID->new($_->{'id'}) },
			{ '$set' => {index => $_->{'index'}} }
		);
	}
	$s->render(json => {success => $s->json->true});
};

1;
