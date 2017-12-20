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
			GValue.callApi({action:"loadEvaluation", path:"web1/A2017/projetsynthese"}, function () {
				debugger;
			});
		}
	}
	get eleve() {
		return this._eleve;
	}
	set eleve(val) {
		if (val instanceof Eleve) {
			this._eleve = val;
		} else {
			GValue.callApi({action:"loadEleve", evaluation:"web1/A2017/projetsynthese", eleve:"0012345"}, function () {
				debugger;
			});
		}
	}
}
