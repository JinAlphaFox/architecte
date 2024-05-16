// Globals
let photoCheckImg = false;
let photoCheckTit = false;
let photoCheckCat = false;
let file = null;

// Fonction pour afficher les filtres et appliquer les styles aux boutons sélectionnés
function affichageFiltrees(boutons, travaux) {
    for (let i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener("click", function (event) {
            // Réinitialiser les styles de tous les boutons
            for (let i = 0; i < boutons.length; i++) {
                boutons[i].style.backgroundColor = "rgba(0, 0, 0, 0)";
                boutons[i].style.color = "#1D6154";
            }
            // Appliquer les styles au bouton sélectionné
            event.target.style.backgroundColor = "#1D6154";
            event.target.style.color = "white";

            // Afficher tous les travaux si le bouton "Tous" est sélectionné
            if (event.target.id === "0") {
                affichageGallery(travaux);
            } else {
                // Filtrer les travaux par catégorie
                const travauxFiltrees = travaux.filter(function (work) {
                    return work.categoryId == boutons[i].id;
                });
                affichageGallery(travauxFiltrees);
            }
        });
    }
}

// Fonction pour afficher la galerie de travaux
function affichageGallery(table) {
    const galleryDiv = document.querySelector(".gallery");
    galleryDiv.innerHTML = "";

    // Créer et ajouter les éléments de la galerie
    for (let i = 0; i < table.length; i++) {
        let figureElement = document.createElement("figure");
        let imgElement = document.createElement("img");
        imgElement.src = table[i].imageUrl;
        imgElement.alt = table[i].title;
        let nameElement = document.createElement("figcaption");
        nameElement.innerHTML = table[i].title;
        figureElement.appendChild(imgElement);
        figureElement.appendChild(nameElement);
        galleryDiv.appendChild(figureElement);
    }
}

// Fonction pour afficher les boutons de catégorie
function affichageBoutons(categories, buttonList) {
    const categoriesDiv = document.querySelector(".categories");
    const h3 = document.createElement("h3");

    // Créer le bouton "Tous" et l'ajouter à la liste de boutons
    let buttonTous = document.createElement("button");
    buttonTous.style.backgroundColor = "#1D6154";
    buttonTous.style.color = "white";
    buttonTous.innerHTML = "Tous";
    buttonTous.classList.add("btn-0");
    buttonTous.id = 0;
    h3.appendChild(buttonTous);
    categoriesDiv.appendChild(h3);
    buttonList.push(buttonTous);

    // Créer des boutons pour chaque catégorie et les ajouter à la liste de boutons
    for (let i = 0; i < categories.length; i++) {
        const h3 = document.createElement("h3");
        let buttonElement = document.createElement("button");
        buttonElement.innerHTML = categories[i].name;
        buttonElement.classList.add("btn-" + categories[i].id);
        buttonElement.id = categories[i].id;
        h3.appendChild(buttonElement);
        categoriesDiv.appendChild(h3);
        buttonList.push(buttonElement);
    }

    return buttonList;
}
// Fonction pour afficher la galerie
function editionGallery(table) {
    // Sélectionne l'élément de la galerie dans le DOM et vide son contenu actuel
    const galleryDiv = document.querySelector(".tousTravaux");
    galleryDiv.innerHTML = "";
    
    // Boucle à travers chaque élément du tableau 'table' qui contient les données des travaux
    for (let i = 0 ; i < table.length ; i++) {
        let figureElement = document.createElement("figure");
        let imgElement = document.createElement("img");
        imgElement.src = table[i].imageUrl;
        imgElement.alt = table[i].title;
        
        // Crée un bouton pour l'icône de corbeille
        let divIcone = document.createElement("button");
        let corbeilleIcone = document.createElement("i");
        corbeilleIcone.classList.add("fa-solid", "fa-trash-can");
        
        // Ajoute l'icône de corbeille au bouton
        divIcone.appendChild(corbeilleIcone);
        // Stocke l'ID du travail dans un attribut de données du bouton
        divIcone.dataset.id = table[i].id;
        
        // Ajoute un événement de clic au bouton pour supprimer l'image correspondante
        divIcone.addEventListener("click", async function () {
            await supprimerImage(table[i].id); // Appelle la fonction pour supprimer l'image
            editionGallery(table); // Recharge la galerie après la suppression
        })

        // Ajoute l'image et le bouton de suppression à l'élément 'figure'
        figureElement.appendChild(imgElement);
        figureElement.appendChild(divIcone);
        // Ajoute l'élément 'figure' à la galerie
        galleryDiv.appendChild(figureElement);
    }
};

// Fonction pour supprimer un travail
async function supprimerImage(imageId) {
    // Récupère le token d'authentification stocké dans la session
    const token = sessionStorage.getItem("token");
    
    try {
        // Envoie une requête DELETE à l'API pour supprimer l'image avec l'ID spécifié
        const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
            method: 'DELETE',
            headers: {
                // Inclut le token d'authentification dans les en-têtes de la requête
                'Authorization': `Bearer ${token}`
            }
        });

        // Vérifie si la réponse est réussie (code HTTP 200-299)
        if (response.ok) {
            // Si la suppression est réussie, récupère la liste mise à jour des travaux
            const works = await (await fetch("http://localhost:5678/api/works")).json();
            // Réaffiche dynamiquement la galerie avec les données mises à jour
            affichageDynamique(true);
        } else {
            // Affiche un message d'erreur dans la console si la suppression échoue
            console.error('Erreur lors de la suppression de l\'image');
        }
    } catch (error) {
        // Gère les erreurs éventuelles lors de la requête
        console.error('Erreur:', error);
    }
}

// Fonction pour afficher tous les travaux à la page. Edition vaut true si c'est pour afficher la gallery dans la modal
async function affichageDynamique(edition) {

    // récupération de la bdd
    const reponseWorks = await fetch("http://localhost:5678/api/works");
    const reponseCategories = await fetch("http://localhost:5678/api/categories");
    const works = await reponseWorks.json();
    const categories = await reponseCategories.json();
    
    // création dynamique des boutons
    let buttonList = [];
    buttonList = affichageBoutons(categories, buttonList);
    
    // création dynamique de la gallery
    affichageGallery(works);

    // création dynamique des filtres
    affichageFiltrees(buttonList, works);

    // création gallery pour mode edition
    if (edition) {
        editionGallery(works);
    }

};

/**
 * Création dynamique de la modal
 * @param {*} type = gallery || ajout
 */
async function remplissageModal(type) {
    try {
        // Récupère les catégories depuis l'API
        const reponseCategories = await fetch("http://localhost:5678/api/categories");
        const categories = await reponseCategories.json();

        // Sélectionne la div où le contenu dynamique sera inséré
        const divModal = document.querySelector(".contenuDynamique");
        divModal.innerHTML = "";

        // Initialise les boutons de la modal (retour et fermeture)
        const { divButtons, buttonRetour, buttonFermeture } = initButtons();

        // Variables pour le texte du titre de la modal et son contenu
        let titleModalText = "";
        let divContenuModal = document.createElement("div");
        let buttonBottomModal = document.createElement("button");

        // Configure le contenu de la modal en fonction du type (gallery ou ajout)
        switch (type) {
            case "gallery":
                // Configuration pour la galerie
                buttonRetour.style.display = "none"; // Cache le bouton retour
                divButtons.style.justifyContent = "right"; // Aligne les boutons à droite
                titleModalText = "Galerie Photo"; // Définit le titre de la modal
                divContenuModal.classList.add("tousTravaux"); // Ajoute une classe CSS pour la galerie
                affichageDynamique(true); // Affiche dynamiquement la galerie
                buttonBottomModal.textContent = "Ajouter une photo"; // Texte du bouton en bas de la modal
                buttonBottomModal.classList.add("btn-ajoutPhoto"); // Ajoute une classe CSS au bouton
                buttonBottomModal.addEventListener("click", () => remplissageModal("ajout")); // Ajoute un événement pour passer à la modal d'ajout
                break;
            case "ajout":
                // Réinitialise les variables de vérification pour l'ajout de photo
                photoCheckImg = false;
                photoCheckTit = false;
                photoCheckCat = false;
                // Configuration pour l'ajout de photo
                buttonRetour.style.display = "inline"; // Affiche le bouton retour
                divButtons.style.justifyContent = "space-between"; // Justifie le contenu entre les boutons
                titleModalText = "Ajout Photo"; // Définit le titre de la modal
                divContenuModal.classList.add("ajoutTravaux"); // Ajoute une classe CSS pour l'ajout de travaux
                buttonBottomModal.textContent = "Valider"; // Texte du bouton en bas de la modal
                buttonBottomModal.classList.add("btn-validerPhoto"); // Ajoute une classe CSS au bouton
                buttonBottomModal.disabled = true; // Désactive le bouton
                buttonBottomModal.style.backgroundColor = "rgba(167, 167, 167, 1)"; // Change la couleur du bouton
                //buttonBottomModal.addEventListener("click", () => validerPhoto()); // Ajoute un événement pour valider la photo (commenté ici)
                const formAjout = document.createElement("form"); // Crée un formulaire pour l'ajout de photo
                divContenuModal.appendChild(formAjout); // Ajoute le formulaire à la modal
                formAjout.appendChild(createPhotoImg()); // Ajoute le champ de téléchargement d'image
                formAjout.appendChild(createPhotoTit()); // Ajoute le champ de titre
                formAjout.appendChild(createPhotoCat(categories)); // Ajoute le champ de catégorie
                buttonRetour.addEventListener("click", () => remplissageModal("gallery")); // Ajoute un événement pour retourner à la galerie
                break;
            default:
                // Cas par défaut pour d'autres types potentiels
                // Gestion d'autres cas si nécessaire
                break;
        }

        // Crée et configure le titre de la modal
        const titleModal = document.createElement("h1");
        titleModal.id = "titleModal";
        titleModal.textContent = titleModalText;
        divModal.appendChild(titleModal);
        // Ajoute le contenu dynamique à la modal
        divModal.appendChild(divContenuModal);
        // Ajoute le bouton en bas de la modal
        divModal.appendChild(buttonBottomModal);
    } catch (error) {
        // Gère les erreurs éventuelles
        console.error("Une erreur s'est produite :", error);
    }
}

// Fonction d'initialisation des boutons de la modal
function initButtons() {
    // Sélectionne la div contenant les boutons de la modal
    const divButtons = document.querySelector(".divButtons");
    // Sélectionne le bouton de retour
    const buttonRetour = document.querySelector(".btn-retourModal");
    // Sélectionne le bouton de fermeture de la modal
    const buttonFermeture = document.querySelector(".js-modal-close");
    
    // Définit le contenu HTML du bouton retour avec une icône de flèche gauche
    buttonRetour.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
    // Définit le contenu HTML du bouton de fermeture avec une icône de croix
    buttonFermeture.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    
    // Retourne un objet contenant les références aux éléments de bouton et de div
    return { divButtons, buttonRetour, buttonFermeture };
}

// Fonction pour l'affichage du formulaire de la modal, partie Image
function createPhotoImg() {
    // Crée une div pour contenir les éléments de l'image et lui ajoute une classe pour le style
    const divImage = document.createElement("div");
    divImage.classList.add("divImageModal");
    
    // Crée une icône pour représenter l'image et lui ajoute une classe pour le style
    const iconeImage = document.createElement("i");
    iconeImage.classList.add("fa-regular", "fa-image");
    // Ajoute l'icône à la div
    divImage.appendChild(iconeImage);
    
    // Crée un élément input pour permettre le téléchargement de fichiers
    const inputImage = document.createElement("input");
    inputImage.type = "file";
    inputImage.id = "inputNewImage";
    inputImage.name = "inputNewImage";
    inputImage.accept = "image/png, image/jpeg"; // Accepte uniquement les fichiers PNG et JPEG
    // Ajoute l'input à la div
    divImage.appendChild(inputImage);
    
    // Crée un label pour l'input de fichier et lui attribue un contenu HTML
    const labelImage = document.createElement("label");
    labelImage.setAttribute("for", "inputNewImage");
    labelImage.innerHTML = `<i class="fa-solid fa-plus"></i> Ajouter photo`;
    // Ajoute le label à la div
    divImage.appendChild(labelImage);
    
    // Ajoute une description sous l'input pour informer sur les formats et la taille maximale des fichiers
    divImage.innerHTML += `<p>jpg, png : 4mo max</p>`;
    
    // Ajoute un écouteur d'événement pour gérer le téléchargement et l'affichage de l'image prévisualisée
    divImage.addEventListener("change", previewImageUpload);
    
    // Retourne la div complète contenant tous les éléments liés à l'ajout de l'image
    return divImage;
};

// Fonction pour l'affichage du formulaire de la modal, partie Titre
function createPhotoTit() {
    // Crée une div pour contenir les éléments liés au titre et lui ajoute une classe pour le style
    const divTitle = document.createElement("div");
    divTitle.classList.add("divForm");

    // Crée un label pour le champ de texte du titre et définit son texte et son attribut "for"
    const labelTitle = document.createElement("label");
    labelTitle.innerHTML = "Titre";
    labelTitle.setAttribute("for", "inputTitle");

    // Crée un champ de texte pour le titre avec un identifiant et un nom
    const inputTitle = document.createElement("input");
    inputTitle.type = "text";
    inputTitle.id = "inputTitle";
    inputTitle.name = "inputTitle";

    // Ajoute le label et le champ de texte à la div
    divTitle.appendChild(labelTitle);
    divTitle.appendChild(inputTitle);

    // Ajoute un écouteur d'événement pour gérer les modifications du titre
    inputTitle.addEventListener("input", modifyTit);

    // Retourne la div complète contenant le label et le champ de texte
    return divTitle;
};


// Fonction pour l'affichage du formulaire de la modal, partie Catégorie
function createPhotoCat(categories) {
    // Crée une div pour contenir les éléments liés à la catégorie et lui ajoute une classe pour le style
    const divCategorie = document.createElement("div");
    divCategorie.classList.add("divForm");
    
    // Crée un label pour le sélecteur de catégories et définit son texte et son attribut "for"
    const labelCategorie = document.createElement("label");
    labelCategorie.innerHTML = "Catégorie";
    labelCategorie.setAttribute("for", "selectCategorie");
    
    // Crée un sélecteur de catégories avec un identifiant et un nom
    const selectCategorie = document.createElement("select");
    selectCategorie.id = "selectCategorie";
    selectCategorie.name = "selectCategorie";
    
    // Crée une option vide par défaut et l'ajoute au sélecteur
    const optionCat0 = document.createElement("option");
    optionCat0.value = "";
    optionCat0.text = "";
    selectCategorie.add(optionCat0);
    
    // Boucle à travers les catégories fournies et crée une option pour chacune
    for (let i = 0; i < categories.length; i++) {
        const optionCat = document.createElement("option");
        optionCat.value = categories[i].id;
        optionCat.text = categories[i].name;
        selectCategorie.add(optionCat);
    }
    
    // Ajoute le label et le sélecteur de catégories à la div
    divCategorie.appendChild(labelCategorie);
    divCategorie.appendChild(selectCategorie);
    
    // Ajoute un écouteur d'événement pour gérer les modifications de la catégorie sélectionnée
    selectCategorie.addEventListener("input", modifyCat);
    
    // Retourne la div complète contenant le label et le sélecteur de catégories
    return divCategorie;
};

// Fonction pour voir l'image avant de l'envoyer
function previewImageUpload(event) {
    // Récupère le fichier téléchargé à partir de l'événement de changement d'input
    file = event.target.files[0];
    if (file) {
        // Crée une instance de FileReader pour lire le contenu du fichier
        const reader = new FileReader();
        // Définir une fonction à exécuter lorsque le fichier a été lu
        reader.onload = function(e) {
            // Sélectionne la div qui contient l'image dans la modal
            const divImage = document.querySelector(".divImageModal");
            // Efface le contenu actuel de la div
            divImage.innerHTML = "";

            // Crée un élément img pour afficher l'image téléchargée
            const imgElement = document.createElement("img");
            // Définit la source de l'image comme le résultat de la lecture du fichier
            imgElement.src = e.target.result;
            imgElement.alt = "Image téléchargée";
            imgElement.id = "uploadedImage";
            imgElement.classList.add("uploadedImage");

            // Ajoute l'élément img à la div
            divImage.appendChild(imgElement);

            // Met à jour le drapeau photoCheckImg pour indiquer qu'une image a été téléchargée
            photoCheckImg = true;
            // Vérifie si toutes les conditions de validation sont remplies
            checkValidationDisabled();
        };
        // Lit le fichier en tant qu'URL de données (base64)
        reader.readAsDataURL(file);
    }
};


// Fonction appelée lorsqu'il y a une entrée dans le champ du titre
function modifyTit(event) {
    // Vérifie si la valeur du champ n'est pas vide après avoir supprimé les espaces
    if (event.target.value.trim() !== "") {
        // Met à jour le drapeau photoCheckTit pour indiquer qu'un titre a été entré
        photoCheckTit = true;
        // Vérifie si toutes les conditions de validation sont remplies
        checkValidationDisabled();
    }
};

// Fonction appelée lorsqu'il y a une entrée dans le champ de sélection de catégorie
function modifyCat(event) {
    // Vérifie si la valeur du champ de sélection n'est pas vide après avoir supprimé les espaces
    if (event.target.value.trim() !== "") {
        // Met à jour le drapeau photoCheckCat pour indiquer qu'une catégorie a été sélectionnée
        photoCheckCat = true;
        // Vérifie si toutes les conditions de validation sont remplies
        checkValidationDisabled();
    }
};

// Fonction pour vérifier si les conditions de validation sont remplies pour activer le bouton de validation
function checkValidationDisabled() {
    // Vérifie si les drapeaux indiquant que l'image, le titre et la catégorie sont valides sont tous vrais
    if (photoCheckImg === true && photoCheckTit === true && photoCheckCat === true) {
        // Récupère le bouton de validation
        const buttonBottomModal = document.querySelector(".btn-validerPhoto");
        // Active le bouton de validation en le rendant cliquable
        buttonBottomModal.disabled = false;
        // Change la couleur de fond du bouton pour indiquer qu'il est activé
        buttonBottomModal.style.backgroundColor = "rgba(29, 97, 84, 1)";
        // Ajoute un écouteur d'événements pour déclencher la fonction de validation lorsque le bouton est cliqué
        buttonBottomModal.addEventListener("click", () => validerPhoto());
    }
};

// Fonction pour valider et envoyer les données du formulaire pour ajouter une photo
function validerPhoto() {
    // Récupérer les valeurs des champs du formulaire
    const titrePhoto = document.getElementById("inputTitle").value;
    const categoriePhoto = document.getElementById("selectCategorie").value;

    // Création d'un objet FormData pour stocker les données du formulaire
    const formData = new FormData();

    // Ajout des valeurs du titre, de l'image et de la catégorie à l'objet FormData
    formData.append("title", titrePhoto);
    formData.append("image", file);
    formData.append("category", categoriePhoto);

    // Envoi des données du formulaire via une requête POST à l'API
    fetch("http://localhost:5678/api/works/", {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("token")}`
        },
        body: formData
    })
    .then(response => {
        // Gestion de la réponse du serveur
        const divModal = document.querySelector(".contenuDynamique");
        divModal.innerHTML = "";
        const titleModal = document.createElement("h1");
        titleModal.id = "titleModal";
        titleModal.innerHTML = "Ajout Photo";
        divModal.appendChild(titleModal);
        divModal.innerHTML += `<p class="ajoutReussi">Ajout de la photo ${titrePhoto} réussi !</p>`;
        // Rafraîchissement de l'affichage dynamique pour mettre à jour la galerie
        affichageDynamique();
    })
    .catch(error => {
        // Gestion des erreurs survenues lors de l'envoi des données
        console.error("Une erreur s'est produite lors de l'envoi des données :", error);
    });
}
      
// Fonction pour vérifier l'état de connexion de l'utilisateur
function verifConnect() { 
    // Récupération du token stocké dans sessionStorage
    let tokenStorage = sessionStorage.getItem("token");

    // Sélection des éléments HTML à modifier en fonction de l'état de connexion
    let divEditionMode = document.querySelector(".editionMode");
    let h2Portfolio = document.querySelector("#portfolio h2");
    let lienConnect = document.querySelector(".lienLog");
    let divFiltres = document.querySelector(".categories");

    // Fonction de déconnexion
    const deconnect = function () {
        // Suppression du token de sessionStorage et redirection vers la page d'accueil
        sessionStorage.clear();
        window.location = "index.html";
    }

    // Vérification si un token est présent dans le sessionStorage
    if(tokenStorage !== null) {
        // Création d'un élément span pour afficher "Mode édition"
        let spanEditionMode = document.createElement("span");
        spanEditionMode.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
        
        // Ajout de l'élément span à divEditionMode
        divEditionMode.appendChild(spanEditionMode);

        // Ajout d'un lien pour modifier les projets à h2Portfolio
        h2Portfolio.innerHTML += '<a href="#modal" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> modifier</a>';

        // Changement du texte du lien de connexion en "logout"
        lienConnect.innerHTML = "logout";

        // Masquage des filtres
        divFiltres.style.display = "none";

        // Ajout d'un événement de clic au lien de déconnexion
        lienConnect.addEventListener("click", deconnect); 
    } else {
        // Si aucun token n'est présent dans le sessionStorage, masquer le mode édition et les liens de modification, et afficher le texte "Mes Projets" dans le h2Portfolio
        divEditionMode.style.display = "none";
        h2Portfolio.innerHTML = "Mes Projets";
        // Affichage d'un lien de connexion
        lienConnect.innerHTML = '<a href="login.html">login</a>';
    }
}

// Fonction pour gérer la création d'une modal
function modal() {
    // Déclaration des variables
    let modal = null;
    const focusableSelector = "button, a, input, textarea";
    let focusList = [];
    let previouslyFocusElement = null;

    // Fonction pour ouvrir le modal
    const openModal = function (e) {
        e.preventDefault();
        // Sélection du modal en fonction de l'attribut href de l'élément cliqué
        modal = document.querySelector(e.target.getAttribute("href"));
        // Sélection de tous les éléments focusables à l'intérieur du modal
        focusList = Array.from(modal.querySelectorAll(focusableSelector));
        // Stockage de l'élément actuellement focusé avant l'ouverture du modal
        previouslyFocusElement = document.querySelector(":focus");
        // Affichage du modal
        modal.style.display = "flex";
        // Focus sur le premier élément focusable à l'intérieur du modal
        focusList[0].focus();
        // Modification des attributs aria pour l'accessibilité
        modal.removeAttribute("aria-hidden");
        modal.setAttribute("aria-modal", "true");
        // Ajout d'écouteurs d'événements pour la fermeture du modal
        modal.addEventListener("click", closeModal);
        modal.querySelector('.js-modal-close').addEventListener("click", closeModal);
        modal.querySelector('.js-modal-stop').addEventListener("click", stopPropagation);

        // Remplissage du modal avec le contenu de la galerie
        remplissageModal("gallery");     
    }

    // Fonction pour fermer le modal
    const closeModal = function (e) {
        if (modal === null) return;
        // Focus sur l'élément précédemment focusé avant l'ouverture du modal
        if (previouslyFocusElement !== null) previouslyFocusElement.focus();
        e.preventDefault();
        // Masquage du modal
        modal.style.display = "none";
        // Modification des attributs aria pour l'accessibilité
        modal.setAttribute("aria-hidden", "true");
        modal.removeAttribute("aria-modal");
        // Suppression des écouteurs d'événements pour la fermeture du modal
        modal.removeEventListener("click", closeModal);
        modal.querySelector('.js-modal-close').removeEventListener("click", closeModal);
        modal.querySelector('.js-modal-stop').removeEventListener("click", stopPropagation);
        modal = null;
    }

    // Fonction pour empêcher la propagation des événements
    const stopPropagation = function (e) {
        e.stopPropagation();
    }

    // Fonction pour gérer le focus à l'intérieur du modal
    const focusInModal = function (e)  {
        e.preventDefault();
        let index = focusList.findIndex(f => f === modal.querySelector(":focus"));
        if (e.shiftKey === true) {
            index--;   
        } else  {
            index++;
        }
        if (index >= focusList.length) {
            index = 0;
        }
        if (index < 0) {
            index = focusList.length - 1;
        }
        focusList[index].focus();
    }

    // Ajout d'écouteurs d'événements pour l'ouverture du modal
    document.querySelectorAll('.js-modal').forEach(a => {
        a.addEventListener("click", openModal);
    });

    // Ajout d'un écouteur d'événement pour la fermeture du modal avec la touche "Escape" ou la navigation au clavier
    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Esc") {
            closeModal(e);
        }
        if (e.key === "Tab" && modal !== null) {
            focusInModal(e);
        }
    })
}


affichageDynamique();

verifConnect();

modal();