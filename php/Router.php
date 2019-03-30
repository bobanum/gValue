<?php
namespace App;
class Router {
	static function outputJson($json) {
		if (!is_string($json)) {
			$json = json_encode($json);
		}
		header("Access-Control-Allow-Origin: *");
		header("content-type: application/json");
		echo $json;
	}
	static function outputJsonFile($file) {
		header("Access-Control-Allow-Origin: *");
		header("content-type: application/json");
		readfile($file);
	}
	static function traiter($routes) {
		$pathinfo = $_SERVER['PATH_INFO'];
		foreach($routes as $route=>$action) {
			if ($route[0] !== "/") {
				$route = "/$route";
			}
			preg_match_all('#:([a-zA-Z][a-zA-Z0-9-_]*)#', $route, $vars);
			$patt = str_replace($vars[0], "([^/]*)", $route);
			$fit = preg_match_all("#^$patt$#", $pathinfo, $vals, PREG_SET_ORDER);
			if ($fit) {
				$vars = array_merge(array_combine($vars[1], array_slice($vals[0], 1)), $_GET);
				call_user_func_array($action, $vars);
				return;
			}
		}
		self::outputJson(["erreur"=>"Route '$pathinfo' non trouvée"]);
	}
}
