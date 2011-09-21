<?php
  date_default_timezone_set('America/Los_Angeles');
  header('Content-Type: text/html; charset=utf-8');
  error_reporting(E_ALL|E_STRICT);

//$link = mysql_connect('localhost:3306', 'root', 'mrroot');
$link = mysql_connect('db381862885.db.1and1.com:3306', 'dbo381862885', 'mrroot1');
if (!$link) {
  die('Could not connect: ' . mysql_error());
}

@mysql_set_charset("utf8");
@mysql_select_db("db381862885") or die( "Unable to select database");
//@mysql_select_db("vocab") or die( "Unable to select database");

$altname = "none";
if ((strcmp($_GET["src"], "de")==0) &&
    (strcmp($_GET["tgt"], "en")==0)) {
  $altname = "chem_";
}

//echo("<p> looking for word " . $_GET["word"]);

$arr = array();
foreach (array("", $altname) as $prename) {
  if ($arr && (count($arr) != 0)) { break; }
  //echo("<p>using " . $prename);

  $query=sprintf("SELECT * FROM %salts_%s_%s      WHERE word = '%s';", $prename, $_GET["src"], $_GET["tgt"], $_GET["word"]);

  $result=mysql_query($query) or die ("unable to select" . $query);

  $num=mysql_numrows($result);
  if (!$num) {
    continue;
  }

  $rids = array();

  $i=0;
  for($i=0;$i < $num;$i++) {
    $rid = mysql_result($result,$i,"rid");
    $word= mysql_result($result,$i,"word");
    // This part is neccessary becuase u and u-umlaut is considered the same in the utf8 collations.
    // I'm not using bin because I want case-insensitive lookup.
    if (strcmp(strtolower($word), strtolower($_GET["word"])) != 0) {
      continue;
    }
    array_push($rids, $rid);
    if (!isset($wordid)) {
      $wordid = $rid;
    }      
  }

  foreach ($rids as &$rid) {
    $query=sprintf("SELECT * FROM %sdefs_%s_%s WHERE id = '%d';", $prename, $_GET["src"], $_GET["tgt"], $rid);
    $result=mysql_query($query) or die ("unable to select2" . $query);

    $num=mysql_numrows($result) or die ("unable to numrows");
    for($i=0;$i < $num; $i++) {
      $word=mysql_result($result,$i,"word");
      $def=mysql_result($result,$i,"def");
      //echo("<p>" . $def);
      array_push($arr, $def);
    }
  }
}

echo $_GET['callback'] . '(';
echo json_encode(array("def" => $arr, "id"=> $wordid));
echo ");";

mysql_close($link);

?>