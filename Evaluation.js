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
	dom_creer() {
		var resultat = document.createElement("div");
		resultat.classList.add("evaluation");
		resultat.appendChild(this.html_ligneDonnees("cours"));
		resultat.appendChild(this.html_ligneDonnees("annee"));
		return resultat;
	}
	html_ligneDonnees(champ, contenu) {
		var resultat = document.createElement("div");
		var label = resultat.appendChild(document.createElement("span"));
		label.classList.add("label");
		label.innerHTML = Evaluation.label(champ);
		if (contenu === undefined) {
			contenu = this[champ];
		}
		if (contenu instanceof HTMLElement) {
			resultat.appendChild(contenu);
			return resultat;
		}
		var span = resultat.appendChild(document.createElement("span"));
		span.innerHTML = contenu;
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
