// Globals
let photoCheckImg = false;
let photoCheckTit = false;
let photoCheckCat = false;
let file = null;

/**
 * Afficher les filtres et appliquer les styles aux boutons sélectionnés
 * @param {*} boutons 
 * @param {*} travaux 
 */
function affichageFiltrees(boutons, travaux) {
    for (let i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener("click", function (event) {
            for (let i = 0; i < boutons.length; i++) {
                boutons[i].style.backgroundColor = "rgba(0, 0, 0, 0)";
                boutons[i].style.color = "#1D6154";
            };
            event.target.style.backgroundColor = "#1D6154";
            event.target.style.color = "white";

            if (event.target.id === "0") {
                affichageGallery(travaux);
            } else {
                const travauxFiltrees = travaux.filter(function (work) {
                    return work.categoryId == boutons[i].id;
                });
                affichageGallery(travauxFiltrees);
            };
        });
    };
};

/**
 * Afficher la galerie avec les works
 * @param {*} table 
 */
function affichageGallery(table) {
    const galleryDiv = document.querySelector(".gallery");
    galleryDiv.innerHTML = "";

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
    };
};

/**
 * Afficher les boutons de catégorie
 * @param {*} categories 
 * @param {*} buttonList 
 * @returns buttonList
 */
function affichageBoutons(categories, buttonList) {
    const categoriesDiv = document.querySelector(".categories");
    const h3 = document.createElement("h3");

    let buttonTous = document.createElement("button");
    buttonTous.style.backgroundColor = "#1D6154";
    buttonTous.style.color = "white";
    buttonTous.innerHTML = "Tous";
    buttonTous.classList.add("btn-0");
    buttonTous.id = 0;
    h3.appendChild(buttonTous);
    categoriesDiv.appendChild(h3);
    buttonList.push(buttonTous);

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

/**
 * Afficher la galerie
 * @param {*} table 
 */
function editionGallery(table) {
    const galleryDiv = document.querySelector(".tousTravaux");
    galleryDiv.innerHTML = "";
    
    for (let i = 0 ; i < table.length ; i++) {
        let figureElement = document.createElement("figure");
        let imgElement = document.createElement("img");
        imgElement.src = table[i].imageUrl;
        imgElement.alt = table[i].title;
        
        let divIcone = document.createElement("button");
        let corbeilleIcone = document.createElement("i");
        corbeilleIcone.classList.add("fa-solid", "fa-trash-can");
        
        divIcone.appendChild(corbeilleIcone);
        divIcone.dataset.id = table[i].id;
        
        divIcone.addEventListener("click", async function () {
            await supprimerImage(table[i].id);
            editionGallery(table);
        });

        figureElement.appendChild(imgElement);
        figureElement.appendChild(divIcone);
        galleryDiv.appendChild(figureElement);
    };
};

/**
 * Supprimer un works
 * @param {*} imageId 
 */
async function supprimerImage(imageId) {
    const token = sessionStorage.getItem("token");
    
    try {
        const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const works = await (await fetch("http://localhost:5678/api/works")).json();
            affichageDynamique(true);
        } else {
            console.error('Erreur lors de la suppression de l\'image');
        };
    } catch (error) {
        console.error('Erreur:', error);
    };
};

/**
 * Afficher tous les travaux sur la page
 * @param {*} edition vaut true si c'est pour afficher la gallery dans la modal
 */
async function affichageDynamique(edition) {

    const reponseWorks = await fetch("http://localhost:5678/api/works");
    const reponseCategories = await fetch("http://localhost:5678/api/categories");
    const works = await reponseWorks.json();
    const categories = await reponseCategories.json();
    
    let buttonList = [];
    buttonList = affichageBoutons(categories, buttonList);
    
    affichageGallery(works);

    affichageFiltrees(buttonList, works);

    if (edition) {
        editionGallery(works);
    };

};

/**
 * Création dynamique de la modal
 * @param {*} type = gallery || ajout
 */
async function remplissageModal(type) {
    try {
        const reponseCategories = await fetch("http://localhost:5678/api/categories");
        const categories = await reponseCategories.json();

        const divModal = document.querySelector(".contenuDynamique");
        divModal.innerHTML = "";

        const { divButtons, buttonRetour, buttonFermeture } = initButtons();

        let titleModalText = "";
        let divContenuModal = document.createElement("div");
        let buttonBottomModal = document.createElement("button");

        switch (type) {
            case "gallery":
                buttonRetour.style.display = "none";
                divButtons.style.justifyContent = "right";
                titleModalText = "Galerie Photo";
                divContenuModal.classList.add("tousTravaux");
                affichageDynamique(true);
                buttonBottomModal.textContent = "Ajouter une photo";
                buttonBottomModal.classList.add("btn-ajoutPhoto");
                buttonBottomModal.addEventListener("click", () => remplissageModal("ajout"));
                break;
            case "ajout":
                photoCheckImg = false;
                photoCheckTit = false;
                photoCheckCat = false;
                buttonRetour.style.display = "inline";
                divButtons.style.justifyContent = "space-between";
                titleModalText = "Ajout Photo";
                divContenuModal.classList.add("ajoutTravaux");
                buttonBottomModal.textContent = "Valider";
                buttonBottomModal.classList.add("btn-validerPhoto");
                buttonBottomModal.disabled = true;
                buttonBottomModal.style.backgroundColor = "rgba(167, 167, 167, 1)";
                const formAjout = document.createElement("form");
                divContenuModal.appendChild(formAjout);
                formAjout.appendChild(createPhotoImg());
                formAjout.appendChild(createPhotoTit());
                formAjout.appendChild(createPhotoCat(categories));
                buttonRetour.addEventListener("click", () => remplissageModal("gallery"));
                break;
            default:
                break;
        };

        const titleModal = document.createElement("h1");
        titleModal.id = "titleModal";
        titleModal.textContent = titleModalText;
        divModal.appendChild(titleModal);
        divModal.appendChild(divContenuModal);
        divModal.appendChild(buttonBottomModal);
    } catch (error) {
        console.error("Une erreur s'est produite :", error);
    };
};

/**
 * Initialise les boutons de la modal
 * @returns divButtons, buttonRetour, buttonFermeture
 */
function initButtons() {
    const divButtons = document.querySelector(".divButtons");
    const buttonRetour = document.querySelector(".btn-retourModal");
    const buttonFermeture = document.querySelector(".js-modal-close");
    
    buttonRetour.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
    buttonFermeture.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    
    return { divButtons, buttonRetour, buttonFermeture };
};

/**
 * Affichage du formulaire de la modal, partie Image
 * @returns divImage type élément html DOM
 */
function createPhotoImg() {
    const divImage = document.createElement("div");
    divImage.classList.add("divImageModal");
    
    const iconeImage = document.createElement("i");
    iconeImage.classList.add("fa-regular", "fa-image");
    divImage.appendChild(iconeImage);
    
    const inputImage = document.createElement("input");
    inputImage.type = "file";
    inputImage.id = "inputNewImage";
    inputImage.name = "inputNewImage";
    inputImage.accept = "image/png, image/jpeg";
    divImage.appendChild(inputImage);
    
    const labelImage = document.createElement("label");
    labelImage.setAttribute("for", "inputNewImage");
    labelImage.innerHTML = `<i class="fa-solid fa-plus"></i> Ajouter photo`;
    divImage.appendChild(labelImage);
    
    divImage.innerHTML += `<p>jpg, png : 4mo max</p>`;
    
    divImage.addEventListener("change", previewImageUpload);
    
    return divImage;
};

/**
 * Affichage du formulaire de la modal, partie Titre
 * @returns divTitle type élément html DOM
 */
function createPhotoTit() {
    const divTitle = document.createElement("div");
    divTitle.classList.add("divForm");

    const labelTitle = document.createElement("label");
    labelTitle.innerHTML = "Titre";
    labelTitle.setAttribute("for", "inputTitle");

    const inputTitle = document.createElement("input");
    inputTitle.type = "text";
    inputTitle.id = "inputTitle";
    inputTitle.name = "inputTitle";

    divTitle.appendChild(labelTitle);
    divTitle.appendChild(inputTitle);

    inputTitle.addEventListener("input", modifyTit);

    return divTitle;
};

/**
 * Affichage du formulaire de la modal, partie Catégories
 * @param {*} categories 
 * @returns divCategorie type élément html DOM
 */
function createPhotoCat(categories) {
    const divCategorie = document.createElement("div");
    divCategorie.classList.add("divForm");
    
    const labelCategorie = document.createElement("label");
    labelCategorie.innerHTML = "Catégorie";
    labelCategorie.setAttribute("for", "selectCategorie");
    
    const selectCategorie = document.createElement("select");
    selectCategorie.id = "selectCategorie";
    selectCategorie.name = "selectCategorie";
    
    const optionCat0 = document.createElement("option");
    optionCat0.value = "";
    optionCat0.text = "";
    selectCategorie.add(optionCat0);
    
    for (let i = 0; i < categories.length; i++) {
        const optionCat = document.createElement("option");
        optionCat.value = categories[i].id;
        optionCat.text = categories[i].name;
        selectCategorie.add(optionCat);
    };
    
    divCategorie.appendChild(labelCategorie);
    divCategorie.appendChild(selectCategorie);
    
    selectCategorie.addEventListener("input", modifyCat);
    
    return divCategorie;
};

/**
 * Affiche la preview de l'image avant de l'envoyer
 * @param {*} event 
 */
function previewImageUpload(event) {
    file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const divImage = document.querySelector(".divImageModal");
            divImage.innerHTML = "";

            const imgElement = document.createElement("img");
            imgElement.src = e.target.result;
            imgElement.alt = "Image téléchargée";
            imgElement.id = "uploadedImage";
            imgElement.classList.add("uploadedImage");

            divImage.appendChild(imgElement);

            photoCheckImg = true;
            checkValidationDisabled();
        };
        reader.readAsDataURL(file);
    };
};

/**
 * Fonction appelée lorsqu'il y a une entrée dans le champ du titre
 * @param {*} event 
 */
function modifyTit(event) {
    if (event.target.value.trim() !== "") {
        photoCheckTit = true;
        checkValidationDisabled();
    }else {
        photoCheckTit = false;
        checkValidationDisabled();
    };
};

/**
 * Fonction appelée lorsqu'il y a une entrée dans le champ de sélection de catégorie
 * @param {*} event 
 */
function modifyCat(event) {
    if (event.target.value.trim() !== "") {
        photoCheckCat = true;
        checkValidationDisabled();
    }else {
        photoCheckCat = false;
        checkValidationDisabled();
    };
};

/**
 * Vérifie si les conditions de validation sont remplies pour activer ou désactiver le bouton de validation
 */
function checkValidationDisabled() {
    const buttonBottomModal = document.querySelector(".btn-validerPhoto");
    if (photoCheckImg === true && photoCheckTit === true && photoCheckCat === true) {
        buttonBottomModal.disabled = false;
        buttonBottomModal.style.backgroundColor = "rgba(29, 97, 84, 1)";
        buttonBottomModal.addEventListener("click", () => validerPhoto());
    }else {
        buttonBottomModal.disabled = true;
        buttonBottomModal.style.backgroundColor = "rgba(167, 167, 167, 1)";
        buttonBottomModal.removeEventListener("click", () => validerPhoto());
    };
};

/**
 * Fonction pour valider et envoyer les données du formulaire pour ajouter la photo
 */
function validerPhoto() {
    const titrePhoto = document.getElementById("inputTitle").value;
    const categoriePhoto = document.getElementById("selectCategorie").value;

    const formData = new FormData();

    formData.append("title", titrePhoto);
    formData.append("image", file);
    formData.append("category", categoriePhoto);

    fetch("http://localhost:5678/api/works/", {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("token")}`
        },
        body: formData
    })
    .then(response => {
        remplissageModal("gallery");
        affichageDynamique();
    })
    .catch(error => {
        console.error("Une erreur s'est produite lors de l'envoi des données :", error);
    });
};
      
/**
 * Fonction pour vérifier l'état de connexion de l'utilisateur
 */
function verifConnect() { 
    let tokenStorage = sessionStorage.getItem("token");

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
        
        divEditionMode.appendChild(spanEditionMode);

        h2Portfolio.innerHTML += '<a href="#modal" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> modifier</a>';

        lienConnect.innerHTML = "logout";

        divFiltres.style.display = "none";

        lienConnect.addEventListener("click", deconnect); 
    } else {
        divEditionMode.style.display = "none";
        h2Portfolio.innerHTML = "Mes Projets";
        lienConnect.innerHTML = '<a href="login.html">login</a>';
    };
};

/**
 * Gére la création d'une modal
 */
function modal() {
    let modal = null;
    const focusableSelector = "button, a, input, textarea";
    let focusList = [];
    let previouslyFocusElement = null;

    const openModal = function (e) {
        e.preventDefault();
        modal = document.querySelector(e.target.getAttribute("href"));
        focusList = Array.from(modal.querySelectorAll(focusableSelector));
        previouslyFocusElement = document.querySelector(":focus");
        modal.style.display = "flex";
        focusList[0].focus();
        modal.removeAttribute("aria-hidden");
        modal.setAttribute("aria-modal", "true");
        modal.addEventListener("click", closeModal);
        modal.querySelector('.js-modal-close').addEventListener("click", closeModal);
        modal.querySelector('.js-modal-stop').addEventListener("click", stopPropagation);

        remplissageModal("gallery");     
    };

    const closeModal = function (e) {
        if (modal === null) return;
        if (previouslyFocusElement !== null) previouslyFocusElement.focus();
        e.preventDefault();
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        modal.removeAttribute("aria-modal");
        modal.removeEventListener("click", closeModal);
        modal.querySelector('.js-modal-close').removeEventListener("click", closeModal);
        modal.querySelector('.js-modal-stop').removeEventListener("click", stopPropagation);
        modal = null;
    };

    const stopPropagation = function (e) {
        e.stopPropagation();
    };

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
    };

    document.querySelectorAll('.js-modal').forEach(a => {
        a.addEventListener("click", openModal);
    });

    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Esc") {
            closeModal(e);
        };
        if (e.key === "Tab" && modal !== null) {
            focusInModal(e);
        };
    });
};


affichageDynamique();

verifConnect();

modal();