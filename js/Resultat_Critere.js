/*jslint esnext:true, browser:true*/
/*global App */

/**
 * Représente le résultat d'un élève à une critere
 * @todo Vérifier si in devrait faire un lien vers Eleve/Resultat
 */
export class Resultat_Critere {
	constructor(critere, obj = {}) {
		this._critere = critere;
		this._valeur = "";
		this._commentaires = {};
		this.fill(obj);
	}
	fill(obj) {
		for (let k in obj) {
			this[k] = obj[k];
		}
	}
	get id() {
		return this._critere.id;
	}
	set id(val) {
		if (this._critere) {
			return this;
		}
		this._critere = this._evaluation._criteres_all[val];
		return this;
	}
	get valeur() {
		return this._valeur;
	}
	set valeur(val) {
		if (this._valeur === val) {
			return this;
		}
		this._valeur = val;
		this.maj();
	}
	get commentaires() {
		return this._commentaires;
	}
	set commentaires(val) {
		for (let k in val) {
			this._commentaires[k] = val[k];
		}
	}
	maj() {
//		debugger;
	}
	toJson() {
		var resultat = {};
		resultat.id = this.id;
		resultat.valeur = this.valeur;
		resultat.commentaires = {};
		for (let k in this.commentaires) {
			resultat.commentaires[k] = this.commentaires[k];
		}
		return resultat;
	}
	static init() {
		App.log("init", this.name);
	}
}
Resultat_Critere.init();
