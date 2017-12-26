/*jslint esnext:true,browser:true*/
/*global App, Evaluation*/
/*exported GValue*/
class GValue extends App {
	static callApi(data, callback, thisArg) {
		thisArg = thisArg || this;
		var xhr = new XMLHttpRequest();
		xhr.open("get", "api.php" + this.urlEncode(data));
		xhr.responseType = "json";
		xhr.obj = this;
		xhr.addEventListener("load", function () {
			callback.call(thisArg, this.response);
		});
		xhr.send(null);
		return xhr;
	}
	static callApiPost(data, callback, thisArg) {
		thisArg = thisArg || this;
		var xhr = new XMLHttpRequest();
		xhr.open("post", "api.php");
		xhr.responseType = "json";
		xhr.obj = this;
		xhr.addEventListener("load", function () {
			callback.call(thisArg, this.response);
		});
		if (typeof data === "object") {
			data = this.formData(data);
		}
		xhr.send(data);
		return xhr;
	}
	static formData(data) {
		var resultat = new FormData();
		for (let k in data) {
			let d = data[k];
			if (typeof d !== "string") {
				d = JSON.stringify(d);
			}
			resultat.append(k, d);
		}
		return resultat;
	}
	static urlEncode(data) {
		var resultat;
		if (!data) {
			resultat = "";
		} else if (typeof data === "string") {
			if (!data.startsWith("?")) {
				data = "?" + data;
			}
			resultat = data;
		} else if (typeof data === "object") {
			resultat = [];
			for (let k in data) {
				resultat.push(encodeURI(k) + "=" + encodeURI(data[k]));
			}
			if (resultat.length === 0) {
				resultat = "";
			} else {
				resultat = "?" + resultat.join("&");
			}
		}
		return resultat;
	}
	static loadEvaluations(callback) {
		//TODO Utiliser callApi
		var xhr = new XMLHttpRequest();
		xhr.open("get", "api.php?action=listeEvaluations");
		xhr.responseType = "json";
		xhr.obj = this;
		xhr.addEventListener("load", function () {
			callback.call(this.obj, this.response);
		});
		xhr.send(null);
		return xhr;
	}
	static loadEvaluation(cours, annee, evaluation, callback) {
		//TODO Utiliser callApi
		var xhr = new XMLHttpRequest();
		xhr.open("get", "api.php?action=loadEvaluation&cours="+cours+"&annee="+annee+"&evaluation="+evaluation+"");
		xhr.responseType = "json";
		xhr.obj = this;
		xhr.addEventListener("load", function () {
			callback.call(this.obj, this.response);
		});
		xhr.send(null);
		return xhr;
	}
	static listeCours(obj) {
		var resultat = document.createElement("fieldset");
		resultat.classList.add("gestion-cours");
		var legend = resultat.appendChild(document.createElement("legend"));
		legend.innerHTML = "Les cours";
		var ul = resultat.appendChild(document.createElement("ul"));
		for (let k in obj) {
			let li = ul.appendChild(document.createElement("li"));
			li.appendChild(this.labelListe(k));
			li.appendChild(this.listeAnnees(obj[k]));
		}
		let li = ul.appendChild(document.createElement("li"));
		li.appendChild(this.labelListe(""));
		let input = li.querySelector("input");
		input.setAttribute("placeholder", "Nouveau cours");

		return resultat;
	}
	static listeAnnees(obj) {
		var resultat = document.createElement("fieldset");
		resultat.classList.add("gestion-annees");
		var legend = resultat.appendChild(document.createElement("legend"));
		legend.innerHTML = "Les annees";
		var ul = resultat.appendChild(document.createElement("ul"));
		for (let k in obj) {
			let li = ul.appendChild(document.createElement("li"));
			li.appendChild(this.labelListe(k));
			li.appendChild(this.listeEvaluations(obj[k]));
		}
		let li = ul.appendChild(document.createElement("li"));
		li.appendChild(this.labelListeNouveau("Nouvelle année"));

		return resultat;
	}
	static listeEvaluations(obj) {
		var resultat = document.createElement("fieldset");
		resultat.classList.add("gestion-evaluations");
		var legend = resultat.appendChild(document.createElement("legend"));
		legend.innerHTML = "Les évaluations";
		var ul = resultat.appendChild(document.createElement("ul"));
		for (let k in obj) {
			let li = ul.appendChild(document.createElement("li"));
			li.appendChild(this.labelListe(k));
		}
		let li = ul.appendChild(document.createElement("li"));
		li.appendChild(this.labelListe(""));
		let input = li.querySelector("input");
		input.setAttribute("placeholder", "Nouvelle évaluation");

		return resultat;
	}
	static labelListe(label) {
		var resultat = document.createElement("div");
		resultat.classList.add("label");
		var input = resultat.appendChild(document.createElement("input"));
		input.setAttribute("type", "text");
		input.setAttribute("value", label);
		input.setAttribute("readonly", "readonly");
		var options = resultat.appendChild(document.createElement("span"));
		options.classList.add("options");
		options.appendChild(this.bouton("modifier", "Modifier", null));
		options.appendChild(this.bouton("supprimer", "Supprimer", null));
		options.appendChild(document.createElement("span"));
		return resultat;
	}
	static labelListeNouveau(label) {
		var resultat = document.createElement("div");
		resultat.classList.add("label");
		var input = resultat.appendChild(document.createElement("input"));
		input.setAttribute("type", "text");
		input.setAttribute("placeholder", label);
		var options = resultat.appendChild(document.createElement("span"));
		options.classList.add("options");
		options.appendChild(this.bouton("accepter", "Accepter", null));
		options.appendChild(this.bouton("annuler", "Annuler", null));
		options.appendChild(document.createElement("span"));
		return resultat;
	}
	static bouton(icone, title, evt) {
		var resultat =document.createElement("span");
		resultat.classList.add("bouton");
		resultat.classList.add("icone");
		resultat.classList.add("icone-"+icone);
		resultat.setAttribute("title", title);
		resultat.innerHTML = title;
		resultat.addEventListener("click", evt);
		return resultat;
	}
	static gestionEvaluations() {
		var html = document.createElement("div");
		html.setAttribute("id", "gestionEvaluations");
		this.callApi({action:"listeEvaluations"}, function (json) {
			html.appendChild(this.listeCours(json));
		});
		return html;
	}
	static editionEvaluation(cours, annee, evaluation) {
		var html = document.createElement("div");
		html.setAttribute("id", "editionEvaluation");
		this.callApi({action:"loadEvaluation", cours:cours, annee:annee, evaluation:evaluation}, function (json) {
			GValue.evaluation = Evaluation.fromObject(json);
			html.appendChild(GValue.evaluation.dom);
		});
		return html;
	}
	static init() {
		this.MODE_EVALUATION = 0;
		this.MODE_EDITION = 1;
	}
}
GValue.init();
