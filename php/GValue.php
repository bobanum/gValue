<?php
namespace App;
class GValue {
	static $path_evaluations = "evaluations";
	static $path_resultats = "resultats";
	static function traitement() {
		if (isset($_POST["action"]))
		{
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
		}
		elseif (isset($_GET["action"]))
		{
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
				$path = "{$path}/{$_GET['cours']}/{$_GET['annee']}/_eleves.json";
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
					$resultat = self::creerResultat($_GET['cours'], $_GET['annee'], $_GET['evaluation'], $_GET["matricule"]);
					self::outputJson($resultat);
				}
			}
			self::outputJson(['erreur'=>"Action '{$action}' invalide."]);
		}
		elseif (isset($_GET['evaluation']))
		{
			if (empty($_GET['evaluation'])) {
				self::outputJson(self::listeEvaluations());
			} else {
				self::outputJsonFile(self::pathEvaluations($_GET['evaluation'].".json"));
			}
		} elseif (isset($_GET['eleve'])){
			if (file_exists(self::pathResultats($_GET['eleve'].".json"))) {
				self::outputJsonFile(self::pathResultats($_GET['eleve'].".json"));
			} elseif (file_exists(self::pathEvaluations($_GET['eleve']."/_eleves.json"))) {
				self::outputJsonFile(self::pathEvaluations($_GET['eleve']."/_eleves.json"));
			} elseif (file_exists(self::pathEvaluations($_GET['eleve']."/_eleves.json"))) {
				self::outputJsonFile(self::pathEvaluations($_GET['eleve']."/_eleves.json"));
			} else {
				//Pas utilisé encore
				$resultat = self::creerResultat();
				self::outputJson([]);
			}
		} elseif (isset($_GET['cours'])){
			$cours = $_GET['cours'];
			if (empty($cours)) {
				self::outputJson(self::listeCours());
			} elseif (isset($_GET['session'])){
				$session = $_GET['session'];
				if (empty($session)) {
					self::outputJson(self::listeSessions($cours));
				} else {
	//				self::outputJsonFile(self::pathEvaluations($_GET['evaluation'].".json"));
				}
			} else {
				//retourner la config du cours
				self::outputJson(self::listeSessions($cours));
			}
		}
	}
	static function pathEvaluations($fic = "") {
		$resultat = realpath(__DIR__."/../".self::$path_evaluations);
		if ($fic) {
			$resultat .= "/".$fic;
		}
		return $resultat;
	}
	static function pathResultats($fic = "") {
		$resultat = realpath(__DIR__."/../".self::$path_resultats);
		if ($fic) {
			$resultat .= "/".$fic;
		}
		return $resultat;
	}
	static function creerResultat($evaluation, $matricule) {
		$eleve = self::trouverEleve($evaluation->cours, $evaluation->session, $matricule);
		foreach($eleve as $prop=>$val) {
			$evaluation->$prop = $val;
		}
		return $evaluation;
	}
	static function normaliserResultats(&$vieux, &$nouveau) {
		self::normaliserCriteres($vieux->criteres, $nouveau->criteres);
		if(count($vieux->criteres) === 0) {
			unset($vieux->criteres);
		}
		$props = ['session','session_titre','cours','cours_titre','titre','valeur','matricule','nom','prenom','groupe',];
		foreach($props as $prop) {
			if (isset($vieux->$prop) && isset($nouveau->$prop) && $vieux->$prop === $nouveau->$prop) {
				unset($vieux->$prop);
			}
		}
		if (count((array) $vieux) > 0) {
			$nouveau->residus = $vieux;
		}
	}
	static function normaliserCriteres(&$vieux, &$nouveaux) {
		foreach($nouveaux as $critere) {
			$vs = array_filter($vieux, function($v) use ($critere) {
				if (empty($v->id)) {
					return false;
				}
				return $v->id === $critere->id;
			});
			if (!empty($vs)) {
				foreach($vs as $k=>$v) {
//					unset($v->id);
					if ($v->titre === $critere->titre) {
						unset($v->titre);
					}
					if (isset($v->valeur) && isset($critere->valeur) && ($v->valeur === $critere->valeur)) {
						unset($v->valeur);
					}
					if (isset($v->resultat)) {
						$critere->resultat_valeur = $v->resultat;
						unset($v->resultat);
					}
					if (isset($v->commentaires)) {
						$critere->resultat_commentaires = $v->commentaires;
						unset($v->commentaires);
					}
					if (!empty($v->criteres) && !empty($critere->criteres)) {
						self::normaliserCriteres($v->criteres, $critere->criteres);
						if(count($v->criteres) === 0) {
							unset($v->criteres);
						}
					}
					if(count((array)$v) <= 1) {
						unset($vieux[$k]);
					}
				}
			}
		}
	}
	static function config($cours, $session="") {
		$path = self::pathEvaluations($cours);
		if ($session) {
			$path .= "/$session";
		}
		$path .= "/_config.json";
		if (!file_exists($path)) {
			return new \stdClass;
		}
 		return json_decode(file_get_contents($path));
	}
	static function trouverEleve($cours, $session, $matricule) {
		$config = self::config($cours, $session);
		$eleves = $config->eleves;
		foreach($eleves as $idGroupe=>$groupe) {
			foreach($groupe as $eleve) {
				if ($eleve->matricule === $matricule) {
					$eleve->groupe = $idGroupe;
					return $eleve;
				}
			}
		}
		return [
			'matricule'=>$matricule,
			'nom'=>'',
			'prenom'=>'',
			'groupe'=>'',
		];
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
		header("Access-Control-Allow-Origin: *");
		header("content-type: application/json");
		exit($json);
	}
	static function outputJsonFile($file) {
		header("Access-Control-Allow-Origin: *");
		header("content-type: application/json");
		readfile($file);
	}
	static function listeEleves($cours, $session, $groupe="") {
		$resultat = [];
		$path = self::pathEvaluations("$cours/$session/_config.json");
		$config = json_decode(file_get_contents($path));
		if ($groupe) {
			return $config->eleves->$groupe;
		} else {
			return $config->eleves;
		}
	}
	static function listeCours() {
		$resultat = [];
		$cours = glob(self::pathEvaluations("*"), GLOB_ONLYDIR);
		foreach ($cours as $fic) {
			if (file_exists("$fic/_config.json")) {
				$config = json_decode(file_get_contents("$fic/_config.json"));
				$titre = $config->titre;
			} else {
				$titre = basename($fic);
			}
			$resultat[basename($fic)] = $titre;
		}
		return $resultat;
	}
	static function listeSessions($cours = "*") {
		$resultat = [];
		$sessions = glob(self::pathEvaluations("$cours/*/_config.json"));
		foreach ($sessions as $fic) {
			$config = json_decode(file_get_contents($fic));
			$path = explode("/", $fic);
			$path = array_slice($path, -3, 2);
			$path = implode("/", $path);
			$resultat[$path] = $config->titre;
		}
		return $resultat;
	}
	static function listeEvaluations($cours = "*", $session = "*") {
		$resultat = [];
		$evals = glob(self::pathEvaluations("$cours/$session/*.json"));
		foreach ($evals as $fic) {
			$eval = explode("/", $fic);
			$eval = array_slice($eval, -3);
			if ($eval[2][0] !== "_") {
				$eval[2] = substr($eval[2], 0, -5);
				$eval = array_combine(['cours', 'session', 'json'], $eval);
				$json = json_decode(file_get_contents($fic));
				$eval['titre'] = $json->titre;
				$resultat[] = $eval;
			}
		}
		return $resultat;
	}
	static function evaluation($cours, $session, $evaluation) {
		$path = self::pathEvaluations("$cours/$session/$evaluation.json");
		return json_decode(file_get_contents($path));
	}
	static function resultat($cours, $session, $evaluation, $matricule) {
		$pathResultat = self::pathResultats("{$cours}/{$session}/{$evaluation}/{$matricule}.json");
		$pathEvaluation = self::pathEvaluations("{$cours}/{$session}/{$evaluation}.json");
		$eval = json_decode(file_get_contents($pathEvaluation));
		$resultat = self::creerResultat($eval, $matricule);
		if (!file_exists($pathResultat)) {
			return $resultat;
		}
		$vieux = json_decode(file_get_contents($pathResultat));
		self::normaliserResultats($vieux, $resultat);
		return $resultat;
	}
	static function outputResultat($cours, $session, $evaluation, $matricule) {
		$resultat = self::resultats($cours, $session, $evaluation, $matricule);
		self::outputJson($resultat);
	}
	static public function sauvegarderResultats($cours, $session, $evaluation, $matricule, $resultats) {
		$path = self::pathResultats("{$cours}/{$session}/{$evaluation}/{$matricule}.json");
		file_put_contents($path, $resultats);
		self::outputJson(["sauvegarde"=>"ok"]);
	}
}
