<?php
namespace App;
include_once("../php/Router.php");
include_once("../php/GValue.php");
$routes = [
	"cours" => function () {
		Router::outputJson(GValue::listeCours());
	},
	"session" => function () {
		Router::outputJson(GValue::listeSessions());
	},
	"evaluation" => function () {
		Router::outputJson(GValue::listeEvaluations());
	},
	":cours/session" => function ($cours) {
		Router::outputJson(GValue::listeSessions($cours));
	},
	":cours/evaluation" => function ($cours) {
		Router::outputJson(GValue::listeEvaluations($cours));
	},
	":cours/:session/evaluation" => function ($cours, $session) {
		Router::outputJson(GValue::listeEvaluations($cours, $session));
	},
	":cours/:session/eleves" => function ($cours, $session) {
		Router::outputJson(GValue::listeEleves($cours, $session));
	},
	":cours/:session/:groupe/eleves" => function ($cours, $session, $groupe) {
		Router::outputJson(GValue::listeEleves($cours, $session, $groupe));
	},
	":cours/:session/:evaluation" => function ($cours, $session, $evaluation) {
		Router::outputJson(GValue::evaluation($cours, $session, $evaluation));
	},
	":cours/:session/:evaluation/:matricule" => function ($cours, $session, $evaluation, $matricule) {
		Router::outputJson(GValue::resultat($cours, $session, $evaluation, $matricule));
	},
];

Router::traiter($routes);
