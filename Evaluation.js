/*jslint browser:true, esnext:true*/
/*global Critere*/
class Evaluation extends Critere {
	constructor() {
		super();
		this.cours = "";
		this.annee = "";
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
			this._dom.obj = this;
		}
		return this._dom;
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

	static init() {
		this.labels = {
			cours: "Cours",
			annee: "Annee"
		};
	}
}
Evaluation.init();
