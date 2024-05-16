function affichageFiltrees(boutons, travaux){
    for (let i = 0 ; i < boutons.length ; i++) {
        boutons[i].addEventListener("click", function (event) {
            for (let i = 0 ; i < boutons.length ; i++) {
                boutons[i].style.backgroundColor = "rgba(0, 0, 0, 0)";
                boutons[i].style.color = "#1D6154";
            }
            event.target.style.backgroundColor = "#1D6154";
            event.target.style.color = "white";
            if ( event.target.id === "0" ) {
                affichageGallery(travaux);
            }else{
                const travauxFiltrees = travaux.filter(function (work) {
                    return work.categoryId == boutons[i].id;
                });
                affichageGallery(travauxFiltrees);
            };
        });
    };
};

function affichageGallery(table) {
    const galleryDiv = document.querySelector(".gallery");
    galleryDiv.innerHTML = "";
    
    for (let i = 0 ; i < table.length ; i++) {
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

    for (let i = 0 ; i < categories.length ; i++) {
        const h3 = document.createElement("h3");
        let buttonElement = document.createElement("button");
        buttonElement.innerHTML = categories[i].name;
        buttonElement.classList.add("btn-" + categories[i].id);
        buttonElement.id = categories[i].id;
        h3.appendChild(buttonElement);
        categoriesDiv.appendChild(h3);
        buttonList.push(buttonElement);
    };

    return buttonList;

}

function editionGallery(table) {
    const galleryDiv = document.querySelector(".tousTravaux");
    galleryDiv.innerHTML = "";
    
    for (let i = 0 ; i < table.length ; i++) {
        let figureElement = document.createElement("figure");
        let imgElement = document.createElement("img");
        let divIcone = document.createElement("button");
        let corbeilleIcone = document.createElement("i")

        imgElement.src = table[i].imageUrl;
        imgElement.alt = table[i].title;
        corbeilleIcone.classList.add("fa-solid", "fa-trash-can");

        divIcone.appendChild(corbeilleIcone);
        divIcone.dataset.id = table[i].id;

        divIcone.addEventListener("click", async function () {
            await supprimerImage(table[i].id);
            editionGallery(table);
        })

        figureElement.appendChild(imgElement);
        figureElement.appendChild(divIcone);
        galleryDiv.appendChild(figureElement);
    };

};

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
            // Optionnel: Réafficher la galerie après suppression
            const works = await (await fetch("http://localhost:5678/api/works")).json();
            affichageDynamique(true);
        } else {
            console.error('Erreur lors de la suppression de l\'image');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

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

let photoCheckImg = false;
let photoCheckTit = false;
let photoCheckCat = false;
let file = null;

/**
 * création dynamique de la modal
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
                // Configuration pour la galerie
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
                // Configuration pour l'ajout de photo
                buttonRetour.style.display = "inline";
                divButtons.style.justifyContent = "space-between";
                titleModalText = "Ajout Photo";
                divContenuModal.classList.add("ajoutTravaux");
                buttonBottomModal.textContent = "Valider";
                buttonBottomModal.classList.add("btn-validerPhoto");
                buttonBottomModal.disabled = true;
                buttonBottomModal.style.backgroundColor = "rgba(167, 167, 167, 1)";
                //buttonBottomModal.addEventListener("click", () => validerPhoto());
                const formAjout = document.createElement("form");
                divContenuModal.appendChild(formAjout);
                formAjout.appendChild(createPhotoImg());
                formAjout.appendChild(createPhotoTit());
                formAjout.appendChild(createPhotoCat(categories));
                buttonRetour.addEventListener("click", () => remplissageModal("gallery"));
                break;
            default:
                buttonRetour.style.display = "inline";
                divButtons.style.justifyContent = "space-between";
                titleModalText = "Ajout Photo";
                
                // Gestion d'autres cas si nécessaire
                break;
        }

        const titleModal = document.createElement("h1");
        titleModal.id = "titleModal";
        titleModal.textContent = titleModalText;
        divModal.appendChild(titleModal);
        divModal.appendChild(divContenuModal);
        divModal.appendChild(buttonBottomModal);
    } catch (error) {
        console.error("Une erreur s'est produite :", error);
    }
}

function initButtons() {
    const divButtons = document.querySelector(".divButtons");
    const buttonRetour = document.querySelector(".btn-retourModal");
    const buttonFermeture = document.querySelector(".js-modal-close");
    buttonRetour.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
    buttonFermeture.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    return { divButtons, buttonRetour, buttonFermeture };
}

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
    }
    divCategorie.appendChild(labelCategorie);
    divCategorie.appendChild(selectCategorie);

    selectCategorie.addEventListener("input", modifyCat);

    return divCategorie;
};

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

function modifyTit(event) {
    if (event.target.value.trim() !== "") {
        photoCheckTit = true;
        checkValidationDisabled();
    };
};

function modifyCat(event) {
    if (event.target.value.trim() !== "") {
        photoCheckCat = true;
        checkValidationDisabled();
    };
};

function checkValidationDisabled() {

    if(photoCheckImg === true && photoCheckTit === true && photoCheckCat === true) {
        const buttonBottomModal = document.querySelector(".btn-validerPhoto");
        buttonBottomModal.disabled = false;
        buttonBottomModal.style.backgroundColor = "rgba(29, 97, 84, 1)";
        buttonBottomModal.addEventListener("click", () => validerPhoto());
    };
};

function validerPhoto() {
    // Récupérer les valeurs des champs du formulaire
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
        // Réponse du serveur
        const divModal = document.querySelector(".contenuDynamique");
        divModal.innerHTML = "";
        const titleModal = document.createElement("h1");
        titleModal.id = "titleModal";
        titleModal.innerHTML = "Ajout Photo";
        divModal.appendChild(titleModal);
        divModal.innerHTML += `<p class="ajoutReussi">Ajout de la photo ${titrePhoto} réussi !</p>`
        affichageDynamique();
    })
    .catch(error => {
        console.error("Une erreur s'est produite lors de l'envoi des données :", error);
    });
}



      
function verifConnect() { 
    let tokenStorage = sessionStorage.getItem("token");
    let divEditionMode = document.querySelector(".editionMode");
    let h2Portfolio = document.querySelector("#portfolio h2");
    let lienConnect = document.querySelector(".lienLog");
    let divFiltres = document.querySelector(".categories");

    const deconnect = function () {
        sessionStorage.clear();
        window.location="index.html";
    }

    if(tokenStorage !== null) {
        let spanEditionMode = document.createElement("span");

        spanEditionMode.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
        divEditionMode.appendChild(spanEditionMode);

        h2Portfolio.innerHTML += '<a href="#modal" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> modifier</a>';
        lienConnect.innerHTML = "logout";
        
        divFiltres.style.display = "none";

        lienConnect.addEventListener("click", deconnect); 

    }else{
        divEditionMode.style.display = "none";
        h2Portfolio.innerHTML = "Mes Projets";
        lienConnect.innerHTML = '<a href="login.html">login</a>';
    }

};

function modal() {
    let modal = null;
    const focusableSelector = "button, a, input, textarea";
    let focusList = [];
    let previouslyFocusElement = null;

    const oppenModal = function (e) {
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
    }

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
    }

    const stopPropagation = function (e) {
        e.stopPropagation();
    }

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

    document.querySelectorAll('.js-modal').forEach(a => {
        a.addEventListener("click", oppenModal);
    });

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