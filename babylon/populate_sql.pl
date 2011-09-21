#!/usr/bin/perl

use warnings;
use strict;
use DBI;
use Cwd;
use Encode;
use Data::Dump;

$| = 1;

my $from_lang = shift @ARGV;
my $to_lang = shift @ARGV;

if (!$from_lang || !$to_lang) {
    printf("usage <from> <to>\n");
    exit(-1);
}

my $db = "vocab";
my $host = "127.0.0.1";
my $user = "root";
my $pw = "mrroot";
my $port = 3306;

my $defs = sprintf("defs_%s_%s", $from_lang, $to_lang);
my $alts = sprintf("alts_%s_%s", $from_lang, $to_lang);

my $dbh = DBI->connect( "dbi:mysql:database=$db:$host:port=$port:mysql_enable_utf8", $user, $pw ) || die "Cannot connect: $DBI::errstr";
printf("connected %s\n", $dbh);
 
$dbh->{'mysql_enable_utf8'} = 1;

$dbh->do("SET character_set_results='utf8'");
$dbh->do("SET character_set_connection='utf8'");
$dbh->do("SET character_set_client='utf8'");
$dbh->do("SET NAMES='utf8'");

my %attrs;
$dbh->do("SHOW VARIABLES LIKE 'character_set_%'", \%attrs);

my @cmds = (
    "alter database $db default character set utf8 collate utf8_general_ci;",
    "create table $defs (id int unsigned not null auto_increment unique primary key);",
    "alter  table $defs add column word varchar(128);",
    "alter  table $defs add column def  varchar(1024);",
    "create index word_index on ${defs}(word);",

    "create table $alts (id int unsigned not null auto_increment unique primary key);",
    "alter  table $alts add column rid int after id;",
    "alter  table $alts add column word varchar(128) after id;",
    "create index word_index on ${alts}(word);",
    );

foreach my $cmd (@cmds) {
    printf("doing command %s\n", $cmd);
    $dbh->do($cmd); # || die "can't do command $DBI::errstr\n";
}



$dbh->begin_work()   or die $dbh->errstr;

printf("parsing\n");

my $curword;
my $num = 0;
my $defid;

#use open qw(:std :utf8);
binmode(STDIN, ":utf8:");
binmode(STOUT, ":utf8:");

#open my $fp, "<:utf8", "russian.html";

#open my $fpout, ">:utf8", "russian.sql";

while (my $line = <>) {
    chomp $line;
    $line = decode_utf8($line);
    if (my ($charset) = ($line =~ /TargetCharset: ([a-zA-Z\-0-9]+)/)) {
	printf("charset %s\n", $charset);
	# doing the encode thing causesthe special characters to be wonky.
    }

    if ((my $word) = ($line =~ /^<p>word (.*)/)) {
	$word = $dbh->quote($word);
	$word =~ s/\$[0-9]+\$//g;
	$curword = $word;
	#printf("new word %s\n", $curword);

	next;
    }

    if ((my $def) = ($line =~ /^def (.*)/)) {
	$def = $dbh->quote($def);
	#printf("def fr word %s\n", $def);

	my $cmd =  "INSERT INTO $defs (word, def) VALUES ( $curword, $def);";
	if (!defined($dbh->do($cmd))) {
	    printf("failed insert %s %s\n", $curword||"no word", $def || "no def");
	    printf("error %s\n", $dbh->errstr || "no error");
	    printf("cmd %s\n", $cmd || "no cmd");
	}
	$defid = $dbh->last_insert_id(undef, undef, "$defs", "id");
	#printf("inserted %s\n", $defid);
	if (!$defid) {
	    printf("didn't get insert id %s\n", $curword);
	}
	my $cmd2 = "INSERT INTO $alts (word, rid) VALUES ( $curword, $defid) ";
	if (!defined($dbh->do( $cmd2 ))) {
	    printf("do failed %s\n", $dbh->errstr);
	    printf("bad cmd %s\n", $cmd2);
	    #printf("do cmd %s\n", $
	}
	$num++;
	if ($num%100 == 0) {
	    $dbh->commit();
	    $dbh->begin_work();

	}
	next;
    }

    if ((my $alt) = ($line =~ /^  alt (.*)/)) {
	#printf("alt word %s\n", $alt);
	$alt = $dbh->quote($alt);
	$dbh->do( "INSERT INTO $alts (word, rid) VALUES ( $alt, '$defid') " );
	next;
    }
    
}

$dbh->commit();



# end
