/*jslint esnext:true, browser:true*/
/*exported Eleve*/
/*global GValue, Resultat*/
class Eleve {
	constructor() {
		this.matricule = "";
		this.nom = "";
		this.prenom = "";
		this.groupe = "";
		this.resultats = {};
	}
	html_option() {
		let resultat = document.createElement("option");
		resultat.setAttribute("value", this.matricule);
		resultat.innerHTML = this.nom + ", " + this.prenom + " [" + this.matricule + "]";
		resultat.addEventListener("click", function (e) {
			e.stopPropagation();
			e.cancelBubble = true;
			return false;
		}, true);
		resultat.obj = this;
		return resultat;
	}
	static html_optgroup(nomGroupe, groupe) {
		let resultat = document.createElement("optgroup");
		resultat.setAttribute("label", nomGroupe);
		var eleves = Object.values(groupe);
		eleves = eleves.map((e)=>Eleve.fromArray(e));
		eleves.sort(function (eleve1, eleve2) {
			if (eleve1.nom < eleve2.nom) {
				return -1;
			} else if (eleve1.nom > eleve2.nom) {
				return 1;
			} else if (eleve1.prenom < eleve2.prenom) {
				return -1;
			} else if (eleve1.prenom > eleve2.prenom) {
				return 1;
			} else {
				return 0;
			}
		});
		eleves.forEach(e => (e.groupe = nomGroupe, resultat.appendChild(e.html_option())));
//		for (let matricule in groupe) {
//			let eleve = Eleve.fromArray(groupe[matricule]);
//			eleve.groupe = nomGroupe;
//			resultat.appendChild(eleve.html_option());
//		}
		resultat.addEventListener("click", function () {
			var disabled = this.parentNode.querySelectorAll("optgroup[disabled]");
			if (disabled.length > 0) {
				disabled.forEach((d)=>d.removeAttribute("disabled"));
			} else {
				this.parentNode.querySelectorAll("optgroup").forEach((ch)=>ch.setAttribute("disabled", "disabled"));
				this.removeAttribute("disabled");
			}
		});
		return resultat;
	}
	loadResultat(evaluation, callback) {
		evaluation = evaluation || GValue.evaluation;
		return Resultat.load(evaluation, this, function (json) {
			Resultat.dom_identification.nom.innerHTML = this.eleve.nom;
			Resultat.dom_identification.prenom.innerHTML = this.eleve.prenom;
			Resultat.dom_identification.matricule.innerHTML = this.eleve.matricule;
			if (callback) {
				callback.call(this, json);
			}
		});
	}
	toJson() {
		var resultat = {};
		resultat.matricule = this.matricule;
		resultat.nom = this.nom;
		resultat.prenom = this.prenom;
		resultat.groupe = this.groupe;
		return resultat;
	}
	static html_selectEleve(eleves) {
		eleves = eleves || this.eleves || {};
		var resultat = document.createElement("select");
		resultat.setAttribute("id", "eleves");
		resultat.setAttribute("name", "eleves");
		resultat.setAttribute("size", "10");
		for (let nomGroupe in this.eleves) {
			let groupe = this.eleves[nomGroupe];
			resultat.appendChild(this.html_optgroup(nomGroupe, groupe));
		}
		resultat.addEventListener("change", this.evt.selectEleve.change);
		return resultat;
	}
	static fromArray(a) {
		var resultat = new Eleve();
		resultat.matricule = a[0];
		resultat.nom = a[1];
		resultat.prenom = a[2];
		return resultat;
	}
	static loadAll(cours, annee, callback) {
		this.eleves = null;
		var conteneur = document.createElement("section");
		conteneur.classList.add("eleves");
		var titre = conteneur.appendChild(document.createElement("h1"));
		titre.innerHTML = "Les élèves";
		var data = {
			action: "listeEleves",
			cours: cours,
			annee: annee
		};
		GValue.callApi(data, function (json) {
			Eleve.eleves = json;
			conteneur.appendChild(Eleve.html_selectEleve());
			if (callback) {
				callback.call(this, json);
			}
		});
		return conteneur;
	}
	static getEleve(matricule, groupe) {
		groupe = groupe || this.eleves;
		if (groupe[matricule]) {
			return groupe[matricule];
		}
		for (let k in groupe) {
			if (typeof groupe[k] === "object") {
				return this.getEleve(matricule, groupe[k]);
			}
		}
		return null;
	}
	static load(matricule, callback) {
		var eleve = this.getEleve(matricule);
		return eleve;
	}
	static init() {
		this.evt = {
			selectEleve: {
				change: function () {
					this.selectedOptions[0].obj.loadResultat(GValue.evaluation, function () {
						GValue.resultat = this;
						this.appliquer();
					});
				}
			}
		};
	}
}
Eleve.init();
