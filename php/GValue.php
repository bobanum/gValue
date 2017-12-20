<?php
class GValue {
	static $path_evaluations = "evaluations";
	static $path_resultats = "resultats";
	static function traitement() {
		if (isset($_GET["action"])) {
			if ($_GET["action"] === "listeEvaluations") {
				self::outputJson(self::getFolders("evaluations"));
			} elseif ($_GET["action"] === "loadEvaluation") {
				$path = self::$path_evaluations;
				if (isset($_GET["path"])) {
					$path .= "/" . $_GET['path'];
				} else {
					$path .= "/" . $_GET['cours'];
					if (!file_exists($path)) {
						self::outputJson(["erreur" => "Cours '{$_GET['cours']}' inexistant."]);
					}
					$path .= "/" . $_GET['annee'];
					if (!file_exists($path)) {
						self::outputJson(["erreur" => "Année '{$_GET['annee']}' inexistante."]);
					}
					$path .= "/" . $_GET['evaluation'];
				}
				$path .= ".json";
				if (!file_exists($path)) {
					self::outputJson(["erreur" => "Évaluation '{$_GET['evaluation']}' inexistante."]);
				}
				self::outputJson(file_get_contents($path));
			} elseif ($_GET["action"] === "listeEleves") {
				$path = self::$path_evaluations;
				if (isset($_GET["path"])) {
					$path .= "/" . $_GET['path'];
				} else {
					$path .= "/" . $_GET['cours'];
					if (!file_exists($path)) {
						self::outputJson(["erreur" => "Cours '{$_GET['cours']}' inexistant."]);
					}
					$path .= "/" . $_GET['annee'];
					if (!file_exists($path)) {
						self::outputJson(["erreur" => "Année '{$_GET['annee']}' inexistante."]);
					}
				}
				$path .= "/eleves.json";
				if (!file_exists($path)) {
					var_export($_GET);
					self::outputJson(["erreur" => "Élèves inexistants [{$path}]."]);
				}
				self::outputJson(file_get_contents($path));
			} elseif ($_GET["action"] === "loadResultat") {
				self::verifierDonnees($_GET, ['path', 'matricule']);
				$path = self::$path_resultats . "/" . $_GET["path"] . "/" . $_GET["matricule"] . ".json";
				if (file_exists($path)) {
					self::outputJson(file_get_contents($path));
				} else {
					self::outputJson('{}');
				}
			}
			self::outputJson(['erreur'=>"Action '{$_GET["action"]}' invalide."]);
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
	static function verifierDonnees($source, $donnees, $or = false) {
		if ($or) {
			$erreur = true;
			foreach ($donnees as $champ) {
				if (isset($source[$champ])) {
					$erreur = true;
					break;
				}
			}
			if ($erreur) {
				$champs = implode("', '", $donnees);
				self::outputJson(["erreur" => "Une des données suivantes doit être présente : '{$champs}'"]);
			}
		} else {
			$erreurs = [];
			foreach ($donnees as $champ) {
				if (!isset($source[$champ])) {
					$erreurs[] = $champ;
				}
			}
			if (count($erreurs) > 0) {
				$champs = implode("', '", $donnees);
				self::outputJson(["erreur" => "Les données suivantes doivent être présentes : '{$champs}'"]);
			}
		}
	}
	static function outputJson($json) {
		if (!is_string($json)) {
			$json = json_encode($json);
		}
		header("content-type: application/json");
		exit($json);
	}
}
