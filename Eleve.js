/*jslint esnext:true, browser:true*/
/*exported Eleve*/
/*global GValue*/
class Eleve {
	constructor() {
		this.matricule = "";
		this.nom = "";
		this.prenom = "";
		this.groupe = "";
	}
	html_option() {
		let resultat = document.createElement("option");
		resultat.setAttribute("value", this.matricule);
		resultat.innerHTML = this.nom + ", " + this.prenom + " [" + this.matricule + "]";
		resultat.addEventListener("click", function (e) {
			e.stopPropagation();
//			e.cancelBubble = true;
//			console.log("oui");
//			return false;
		});
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
		GValue.callApi({
			action: "listeEleves",
			path: cours + "/" + annee
		}, function (json) {
			Eleve.eleves = json;
			conteneur.appendChild(Eleve.html_selectEleve());
			if (callback) {
				callback.call(this, json);
			}
		});
		return conteneur;
	}
}
