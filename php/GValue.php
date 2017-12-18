<?php
class GValue {
	static $path_evaluations = "evaluations";
	static $path_resultats = "resultats";
	static function traitement() {
		if (isset($_GET["action"])) {
			if ($_GET["action"] === "listeEvaluations") {
				header("content-type: application/json");
//				header("content-type: text/plain");
				$resultat = self::getFolders("evaluations");
				exit (json_encode($resultat));
			} elseif ($_GET["action"] === "loadEvaluation") {
				header("content-type: application/json");
//				header("content-type: text/plain");
				$path = self::$path_evaluations;
				$path .= "/" . $_GET['cours'];
				if (!file_exists($path)) {
					exit('{"erreur": "Cours \"'.$_GET['cours'].'\" inexistant"}');
				}
				$path .= "/" . $_GET['annee'];
				if (!file_exists($path)) {
					exit('{"erreur": "Année \"'.$_GET['annee'].'\" inexistante"}');
				}
				$path .= "/" . $_GET['evaluation'];
				if (!file_exists($path)) {
					exit('{"erreur": "Évaluation \"'.$_GET['evaluation'].'\" inexistante"}');
				}
				$resultat = file_get_contents($path."/grille.json");
				exit($resultat);
			}
		}

	}
	static function getFolders($path, $depth=-1) {
		$files = glob($path."/*");
		$len = strlen($path) + 1;
		$result = [];
		foreach($files as $file) {
			if (is_dir($file)) {
				if ($depth === 0) {
					$result[substr($file, $len)] = "dir";
				} else {
					$result[substr($file, $len)] = self::getFolders($file, $depth - 1);
				}
			} else {
				$result[substr($file, $len)] = "file";
			}
		}
		return $result;
	}
}
