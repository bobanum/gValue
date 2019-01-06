/*jslint esnext:true, browser:true*/
/*global App */
import {GValue} from "./GValue.js";
import {Resultat} from "./Resultat.js";
import {Groupe} from "./Groupe.js";

/**
 * Représente un élève
 * @todo Évaluer la pertinance de gréer un objet Groupe
 */
export class Eleve {
	/**
	 * Constructeur
	 */
	constructor() {
		this.matricule = "";
		this.nom = "";
		this.prenom = "";
		this.groupe = "";
		this.resultats = {};
	}
	/**
	 * Retourne la balise option représentant un élève
	 * @returns {HTMLElement} L'élément option créé
	 */
	html_option() {
		var resultat = document.createElement("option");
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
	/**
	 * Retourne un élément contenant un radio suivi d'un label.
	 * @param   {string|HTMLElement|false} conteneur Le nom de l'élément devant contenir la paire. Si on donne false, le radio se trouvera dans le label. defaut:"span"
	 * @returns {HTMLElement}              L'élément HTML demandé
	 */
	html_radio(conteneur = "span") {
		var radio = document.createElement("input");
		radio.setAttribute("type", "radio");
		radio.setAttribute("name", "eleve");
		radio.setAttribute("id", "eleve_" + this.matricule);
		radio.setAttribute("value", this.matricule);
		radio.obj = this;
		radio.addEventListener("click", function (e) {
			e.stopPropagation();
			e.cancelBubble = true;
			return false;
		});
		var label = this.html_identification("label");
		label.setAttribute("for", "eleve_" + this.matricule);
		if (!conteneur) {
			label.insertBefore(radio, label.firstChild);
			label.obj = this;
			return label;
		}
		if (typeof conteneur === "string") {
			conteneur = document.createElement(conteneur);
		}
		conteneur.obj = this;
		conteneur.appendChild(radio);
		conteneur.appendChild(label);
		return conteneur;
	}
	/**
	 * Retourne un élément contenant les nom, prénom et matricule de l'élève
	 * @param   {string|HTMLElement} conteneur L'élément dans lequel accumuler les infos
	 * @returns {HTMLElement}        L'élément identifiant
	 */
	html_identification(conteneur = "span") {
		var nom, span, matricule;
		if (typeof conteneur === "string") {
			conteneur = document.createElement(conteneur);
		}
		nom = conteneur.appendChild(document.createElement("span"));
		nom.classList.add("nomAdmin");
		span = nom.appendChild(document.createElement("span"));
		span.innerHTML = this.nom;
		span = nom.appendChild(document.createElement("span"));
		span.innerHTML = this.prenom;
		matricule = conteneur.appendChild(document.createElement("span"));
		matricule.classList.add("matricule");
		matricule.innerHTML = this.matricule;
		return conteneur;
	}
	/**
	 * Retourne un promesse résolue lorsque le résultat d'une certaine évaluation pour l'élève a été chargée.
	 * @param   {Evaluation} evaluation L'objet Evaluation
	 * @returns {Promise}    La promesse avec le résultat correspondant
	 */
	loadResultat(evaluation) {
		if (this.resultats[evaluation.id]) {
			return Promise.resolve(this.resultats[evaluation.id]);
		}
		return Resultat.loadJson(evaluation, this);
	}
	/**
	 * Retourne un objet générique avec les informations pertinentes à l'élève uniquement
	 * @returns {object} Un objet générique
	 */
	toJson() {
		var resultat = {};
		this.champsArray.forEach(k => {
			resultat[k] = this[k];
		});
		resultat.groupe = this.groupe; //TODO Voir l'utilité d'ajouter le groupe
		return resultat;
	}
	/**
	 * Retourne un objet select représentant les groupes donnés
	 * @deprecated On utilise les radio à la place
	 * @param   {object}      groupes Les groupes {nomGroupe: {matricule: jsonEleve}}
	 * @returns {HTMLElement} Un élément select
	 */
	static html_selectGroupesEleves(groupes = {}) {
		var resultat = document.createElement("select");
		resultat.setAttribute("id", "eleves");
		resultat.setAttribute("name", "eleves");
		resultat.setAttribute("size", "10");
		for (let nomGroupe in groupes) {
			let groupe = groupes[nomGroupe];
			resultat.appendChild(this.html_optgroup(nomGroupe, groupe));
		}
		resultat.addEventListener("change", this.evt.selectEleve.change);
		return resultat;
	}
	/**
	 * Retourne un fieldset contenant les listes de groupes
	 * @param   {object}      groupes Les groupes a representer
	 * @returns {HTMLElement} Un fieldset avec des groupes
	 */
	static html_radioEleves(groupes = {}) {
		var resultat = document.createElement("fieldset");
		let ul = resultat.appendChild(document.createElement("ul"));
		for (let nomGroupe in groupes) {
			let groupe = groupes[nomGroupe];
			let li = ul.appendChild(document.createElement("li"));
			li.appendChild(groupe.html_radiofieldset());
		}
		resultat.addEventListener("change", this.evt.selectEleve.change);
		return resultat;
	}
	/**
	 * Retourne un objet Eleve à partir d'un array ou d'on objet
	 * @param   {Array|object} val    Le array à traiter. Format: voir this.champsArray.
	 * @param   {boolean}      forcer Si l'objet est déjà un Eleve, doit-on en créer un nouveau? défaut: false
	 * @returns {Eleve}        Un objet Eleve
	 */
	static from(val, forcer = false) {
		if (val instanceof this && !forcer) {
			return val;
		}
		var resultat = new this();
		if (val instanceof Array) {
			resultat.champsArray.forEach((k, i) => {
				resultat[k] = val[i];
			});
		} else if (typeof val === "object") {
			resultat.champsArray.forEach(k => {
				resultat[k] = val[k];
			});
		} else {
			throw "Mauvaises données pour un Eleve";
		}
		return resultat;
	}
	/**
	 * Retourne un élément form sans les élèves
	 */
	static html_form() {
		var resultat = document.createElement("form");
		resultat.classList.add("eleves");
		var trigger = resultat.appendChild(document.createElement("div"));
		trigger.classList.add("trigger");
		trigger.innerHTML = "<span>&#x1f881;&nbsp;Élèves&nbsp;&#x1f881;</span>";
		var header = resultat.appendChild(document.createElement("header"));
		var titre = header.appendChild(document.createElement("h1"));
		titre.innerHTML = "Les élèves";
		var recherche = header.appendChild(document.createElement("input"));
		recherche.setAttribute("name", "recherche");
		recherche.addEventListener("input", e => {
			this.filtrer(e.target.value);
		});
		return resultat;
	}
	/**
	 * Retourne une promesse résolue après l'ajout du formulaire avec les élèves
	 * @param   {string}  cours Le id du cours
	 * @param   {string}  annee L'année de l'évaluation
	 * @returns {Promise} Une promesse avec les élèves/groupes
	 * @todo Séparer le html du json après avoir créé un objet Groupe
	 */
	static loadAll(cours, annee) {
		this.groupes = null; //TODO Vérifier l'utiliter de vider les élèves ici
		this.eleves = null; //TODO Vérifier l'utiliter de vider les élèves ici
		var data = {
			action: "listeEleves",
			cours: cours,
			annee: annee
		};
		return GValue.callApi(data).then(json => {
			var colonne = document.querySelector("div.interface>div.body>div.colonne");
			var form = colonne.appendChild(this.html_form());
			this.groupes = {}; //TODO Voir l'utilité de cette propriété ou voir s'il serait mieux de les transformer tout de suite en Eleve
			for (let k in json) {
				this.groupes[k] = Groupe.fromJson(k, json[k]);
			}
			this.eleves = Groupe.flatten(this.groupes);
			form.appendChild(Eleve.html_radioEleves(this.groupes));
			return this.eleves;
		});
	}
	/**
	 * Retourne une version sans accents d'une chaine de caractères
	 * @param   {string} texte Une chaine avec accents
	 * @returns {string} Une chaine sans accents
	 */
	static supprimerAccents(texte) {
		return texte
			.replace(/[áàâä]/g, 'a')
			.replace(/[éèêë]/g, 'e')
			.replace(/[íìîï]/g, 'i')
			.replace(/[óòôö]/g, 'o')
			.replace(/[úùûü]/g, 'u')
			.replace(/ÿ/g, 'y')
			.replace(/ç/g, 'c')
			.replace(/ñ/g, 'n')
			.replace(/œ/g, 'oe')
			.replace(/æ/g, 'ae')
			.replace(/[ÁÀÂÄ]/g, 'A')
			.replace(/[ÉÈÊË]/g, 'E')
			.replace(/[ÍÌÎÏ]/g, 'I')
			.replace(/[ÓÒÔÖ]/g, 'O')
			.replace(/[ÚÙÛÜ]/g, 'U')
			.replace(/Ÿ/g, 'Y')
			.replace(/Ç/g, 'C')
			.replace(/Ñ/g, 'N')
			.replace(/Œ/g, 'OE')
			.replace(/Æ/g, 'AE');
	}
	/**
	 * Masque les élèves ne correspondant pas à une certaine recherche
	 * @param {string} recherche La chaine de recherche. Si la chaine est composée de chiffres, on fait une recherche intégrale.
	 */
	static filtrer(recherche) {
		var eleves = Array.from(document.querySelectorAll("form.eleves input[type=radio]"));
		if (/^[0-9]+$/.test(recherche)) {
			recherche = new RegExp(recherche, "i");
		} else {
			recherche = this.supprimerAccents(recherche);
			recherche = recherche.split("").join(".*");
			recherche = new RegExp(recherche, "i");
		}
		eleves.forEach(input => {
			var texte = this.supprimerAccents(input.parentNode.textContent);
			input.parentNode.classList.toggle("cache", !recherche.test(texte));
		});
	}
	/**
	 * Détermine les propriétés statiques
	 */
	static init() {
		this.prototype.champsArray = ["matricule", "nom", "prenom", ];
		App.log("init", this.name);
		this.evt = {
			selectEleve: {
				change: function (e) {
					var choix = e.target.obj;
					choix.loadResultat(App.evaluation).then(data => {
						GValue.resultat = data;
						data.appliquer();
					});
				}
			}
		};
	}
}
Eleve.init();
