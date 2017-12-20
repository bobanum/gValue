/*jslint esnext:true, browser:true*/
/*exported Resultat*/
/*global Evaluation, GValue, Eleve*/
class Resultat {
	constructor(evaluation, eleve) {
		this.evaluation = evaluation;
		this.eleve = eleve;
	}
	get evaluation() {
		return this._evaluation;
	}
	set evaluation(val) {
		if (val instanceof Evaluation) {
			this._evaluation = val;
		} else {
			Evaluation.load(val, function (json) {
				debugger; //Vérifier la valeur de this
				this.evaluation = new Evaluation();
				this.evaluation.fill(json);
			});
		}
	}
	get eleve() {
		return this._eleve;
	}
	set eleve(val) {
		this._eleve = val;

//		if (val instanceof Eleve) {
//			this._eleve = val;
//		} else {
//			GValue.callApi({action:"loadEleve", evaluation:"web1/A2017", eleve: val}, function () {
//			});
//		}
	}
	load(callback) {
		GValue.callApi({action: "loadResultat", path: this.evaluation.path, eleve: this.eleve.matricule}, callback);
	}
}
