/*jslint esnext:true, browser:true*/
/*global App */
import GValue from "./GValue.js";
import Resultat from "./Resultat.js";
export default class Eleve {
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
		});
		resultat.obj = this;
		return resultat;
	}
	html_radio() {
		var resultat = document.createElement("li");
		var radio = resultat.appendChild(document.createElement("input"));
		radio.setAttribute("type", "radio");
		radio.setAttribute("name", "eleve");
		radio.setAttribute("id", "eleve_" + this.matricule);
		radio.setAttribute("value", this.matricule);
		radio.obj = this;
		var label = resultat.appendChild(document.createElement("label"));
		label.setAttribute("for", "eleve_" + this.matricule);
		label.innerHTML = '<span className="nom"><span>' + this.nom + '</span>, <span>' + this.prenom + '</span></span> <span class="matricule">' + this.matricule + '</span>';
		radio.addEventListener("click", function (e) {
			e.stopPropagation();
			e.cancelBubble = true;
			return false;
		});
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
	static html_radioGroup(nomGroupe, groupe) {
		var resultat = document.createElement("fieldset");
		var ul = resultat.appendChild(document.createElement("ul"));
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
		eleves.forEach(e => (e.groupe = nomGroupe, ul.appendChild(e.html_radio())));
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
	loadResultat(evaluation) {
		evaluation = evaluation || App.evaluation;
		if (this.resultats[evaluation.id]) {
			return Promise.resolve();
		}
		return Resultat.loadJson(evaluation, this).then(json => {
			this.resultats[evaluation.id] = json;
			return json;
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
	static html_radioEleves(eleves) {
		eleves = eleves || this.eleves || {};
		var resultat = document.createElement("fieldset");
		let ul = resultat.appendChild(document.createElement("ul"));
		for (let nomGroupe in this.eleves) {
			let li = ul.appendChild(document.createElement("li"));
			let h2 = li.appendChild(document.createElement("h2"));
			h2.addEventListener("click", e => e.target.classList.toggle("folded"));
			h2.innerHTML = nomGroupe;
			li.appendChild(this.html_radioGroup(nomGroupe, this.eleves[nomGroupe]));
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
	static loadAll(cours, annee) {
		this.eleves = null;
		var conteneur = document.createElement("form");
		conteneur.classList.add("eleves");
		var titre = conteneur.appendChild(document.createElement("h1"));
		titre.innerHTML = "Les élèves";
		var data = {
			action: "listeEleves",
			cours: cours,
			annee: annee
		};
		GValue.callApi(data).then(json => {
			Eleve.eleves = json;
			conteneur.appendChild(Eleve.html_radioEleves());
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
	static loadJson(matricule) {
		var eleve = this.getEleve(matricule);
		return eleve;
	}
	static init() {
		App.log("init", this.name);
		this.evt = {
			selectEleve: {
				change: function (e) {
					var choix = e.target.obj;
					choix.loadResultat().then(data => {
						GValue.resultat = data;
						data.appliquer();
					});
				}
			}
		};
	}
}
Eleve.init();
