/*jslint browser:true, esnext:true*/
/*global GValue, Critere*/
class Evaluation extends Critere {
	constructor() {
		super();
		this.cours = "";
		this.annee = "";
		this.id = "";
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
			this._dom.obj = this;
		}
		return this._dom;
	}
	get path() {
		return this.cours + "/" + this.annee + "/" + this.id;
	}
//	dom_creer() {
//		var resultat = document.createElement("div");
//		resultat.classList.add("evaluation");
//		resultat.appendChild(this.html_criteres());
//		resultat.appendChild(this.html_criteres());
//		return resultat;
//	}
	html_details() {
		var resultat = document.createElement("div");
		resultat.classList.add("details");
		resultat.appendChild(this.html_ligneDonnees("cours"));
		resultat.appendChild(this.html_ligneDonnees("annee"));
		resultat.appendChild(this.html_ligneDonnees("titre"));
		return resultat;
	}
	load(callback) {
		GValue.callApi({action:"loadEvaluation", path: this.path}, function (json) {
			this.fill(json);
			if (callback) {
				callback.call(this, json);
			}
		}, this);
		return this;
	}
	static load(path, callback) {
		var resultat = new Evaluation();
		GValue.callApi({action:"loadEvaluation", path: path}, function (json) {
			this.fill(json);
			if (callback) {
				callback.call(this, json);
			}
		}, resultat);
		return resultat;
	}
	static init() {
		this.labels = {
			cours: "Cours",
			annee: "Annee"
		};
	}
}
Evaluation.init();
