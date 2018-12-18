<?php
class GValue {
	static $path_evaluations = "evaluations";
	static $path_resultats = "resultats";
	static function traitement() {
		if (isset($_POST["action"])) {
			$action = $_POST["action"];
			if ($action === "saveResultat") {
				self::verifierDonnees($_POST, ['cours', 'annee', 'evaluation', 'matricule', 'json']);
				$path = self::$path_resultats;
				$path = self::creerPath("{$path}/{$_POST['cours']}/{$_POST['annee']}/{$_POST['evaluation']}");
				$path = "{$path}/{$_POST['matricule']}.json";
				if (file_exists($path)) {
					rename($path, substr($path, 0, -5).time().".bak");
				}
				file_put_contents($path, $_POST['json']);
				self::outputJson(["resultat"=>"ok"]);
			}
		} elseif (isset($_GET["action"])) {
			$action = $_GET["action"];
			if ($action === "listeEvaluations") {
				self::outputJson(self::getFolders("evaluations"));
			} elseif ($action === "loadEvaluation") {
				self::verifierDonnees($_GET, ['cours', 'annee', 'evaluation']);
				$path = self::$path_evaluations;
				$path = "{$path}/{$_GET['cours']}/{$_GET['annee']}/{$_GET['evaluation']}.json";
				if (!file_exists($path)) {
					self::outputJson(["erreur" => "Évaluation '{$_GET['evaluation']}' inexistante. [{$path}]"]);
				}
				self::outputJson(file_get_contents($path));
			} elseif ($action === "listeEleves") {
				self::verifierDonnees($_GET, ['cours', 'annee']);
				$path = self::$path_evaluations;
				$path = "{$path}/{$_GET['cours']}/{$_GET['annee']}/eleves.json";
				if (!file_exists($path)) {
					self::outputJson(["erreur" => "Élèves inexistants [{$path}]."]);
				}
				self::outputJson(file_get_contents($path));
			} elseif ($action === "loadResultat") {
				self::verifierDonnees($_GET, ['cours', 'annee', 'evaluation', 'matricule']);
				$path = self::$path_resultats;
				$path = "{$path}/{$_GET['cours']}/{$_GET['annee']}/{$_GET['evaluation']}/{$_GET["matricule"]}.json";
				if (file_exists($path)) {
					self::outputJson(file_get_contents($path));
				} else {
					self::outputJson('{}');
				}
			}
			self::outputJson(['erreur'=>"Action '{$action}' invalide."]);
		}
	}
	static function creerPath($path) {
		if (!file_exists($path)) {
			self::creerPath(dirname($path));
			mkdir($path);
		}
		return $path;
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
