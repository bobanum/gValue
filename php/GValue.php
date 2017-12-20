<?php
class GValue {
	static $path_evaluations = "evaluations";
	static $path_resultats = "resultats";
	static function traitement() {
		if (isset($_GET["action"])) {
			$resultat = '{erreur:"Action '.$_GET["action"].' invalide"}';
			if ($_GET["action"] === "listeEvaluations") {
				$resultat = self::getFolders("evaluations");
				$resultat = json_encode($resultat);
			} elseif ($_GET["action"] === "loadEvaluation") {
				$path = self::$path_evaluations;
				if (isset($_GET["path"])) {
					$path .= "/" . $_GET['path'];
				} else {
					$path .= "/" . $_GET['cours'];
					if (!file_exists($path)) {
						exit('{"erreur": "Cours \"'.$_GET['cours'].'\" inexistant"}');
					}
					$path .= "/" . $_GET['annee'];
					if (!file_exists($path)) {
						exit('{"erreur": "Année \"'.$_GET['annee'].'\" inexistante"}');
					}
					$path .= "/" . $_GET['evaluation'];
				}
				$path .= ".json";
				if (!file_exists($path)) {
					exit('{"erreur": "Évaluation \"'.$_GET['evaluation'].'\" inexistante"}');
				}
				$resultat = file_get_contents($path);
			} elseif ($_GET["action"] === "listeEleves") {
				$path = self::$path_evaluations;
				if (isset($_GET["path"])) {
					$path .= "/" . $_GET['path'];
				} else {
					$path .= "/" . $_GET['cours'];
					if (!file_exists($path)) {
						exit('{"erreur": "Cours \"'.$_GET['cours'].'\" inexistant"}');
					}
					$path .= "/" . $_GET['annee'];
					if (!file_exists($path)) {
						exit('{"erreur": "Année \"'.$_GET['annee'].'\" inexistante"}');
					}
				}
				$path .= "/eleves.json";
				if (!file_exists($path)) {
					var_export($_GET);
					exit('{"erreur": "Élèves inexistants ['.$path.']"}');
				}
				$resultat = file_get_contents($path);
			}
			header("content-type: application/json");
			exit($resultat);
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
