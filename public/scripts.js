const currentPage = location.pathname;
const menuItems = document.querySelectorAll('header .header-links a');

for (item of menuItems) {
    if (currentPage.includes(item.getAttribute('href'))) {
        item.classList.add('active');
    }
}

const cards = document.querySelectorAll('.card');
const blocks = document.querySelectorAll('.block');

for (let card of cards) {
    card.addEventListener('click', function() {
        const cardId = card.getAttribute('id');
        window.location.href = `/recipes/${cardId}`;
    });
}

for (let block of blocks) {
    const button = block.querySelector('.hide');
    const text = block.querySelector('.text');

    button.addEventListener('click', function() {
        if (text.style.display == 'none') {
            text.style.display = 'block';
            button.innerText = 'Esconder';
        } else {
            text.style.display = 'none';
            button.innerText = 'Mostrar';
        }
    });
}

function addIngredient() {
    const ingredients = document.querySelector('#ingredients');
    const fieldContainer = document.querySelectorAll('.ingredient');

    // Latest ingredient clone
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true);

    // Don't add a new input if last is empty
    if (newField.children[0].value == '') return false;

    // Resets input value
    newField.children[0].value = '';
    ingredients.appendChild(newField);
}

function addStep() {
    const preparation = document.querySelector('#preparation');
    const fieldContainer = document.querySelectorAll('.preparation');

    // Latest ingredient clone
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true)

    // Don't add a new input if last is empty
    if (newField.children[0].value == '') return false

    // Resets input value
    newField.children[0].value = '';
    preparation.appendChild(newField)
}

const addingredient = document.querySelector('.add-ingredient');
const addstep = document.querySelector('.add-step');

if (addingredient) {
    addingredient.addEventListener('click', addIngredient);
}

if (addstep) {
    addstep.addEventListener('click', addStep);
}

function paginate(selectedPage, totalPages) {

    // pagination
    let pages = [],
        oldPage

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const firstAndLastPages = currentPage == 1 || currentPage == totalPages;
        const pagesAfterSelectedPage = currentPage <= selectedPage + 1;
        const pagesBeforeSelectedPage = currentPage >= selectedPage - 1;

        if (firstAndLastPages || pagesBeforeSelectedPage && pagesAfterSelectedPage) {
            if (oldPage && currentPage - oldPage > 2) {
                pages.push('...');
            }

            if (oldPage && currentPage - oldPage == 2) {
                pages.push(oldPage + 1);
            }

            pages.push(currentPage);

            oldPage = currentPage;
        }
    }

    return pages;
}

const pagination = document.querySelector('.pagination');
const page = +pagination.dataset.page;
const total = +pagination.dataset.total;
const filter = pagination.dataset.filter;

const pages = paginate(page, total);

let elements = '';

for (let page of pages) {
    if (String(page).includes('...')) {
        elements += `<span>${page}</span>`;
    } else {
        elements += `<a href='?filter=${filter}&page=${page}'>${page}</a>`;
    }
}

pagination.innerHTML = elements;

const PhotosUpload = {
    input: '',
    preview: document.querySelector('.photos-preview'),
    uploadLimit: 5,
    files: [],
    handleFileInput(event) {
        const {files: fileList} = event.target;
        PhotosUpload.input = event.target;

        if(PhotosUpload.hasLimit(event)) return;

        // Converts fileList into an array
        Array.from(fileList).forEach(file => {
            PhotosUpload.files.push(file);

            const reader = new FileReader();

            reader.onload = () => {
                const image = new Image() // img tag
                image.src = String(reader.result) // readAsDataURL

                const div = PhotosUpload.getContainer(image);

                PhotosUpload.preview.appendChild(div);
            }

            reader.readAsDataURL(file);
        });

        PhotosUpload.input.files = PhotosUpload.getAllFiles();
    },

    hasLimit(event) {
        const { uploadLimit, input, preview } = PhotosUpload;
        const { files: fileList } = input;

        // on upload
        if (fileList.length > uploadLimit) {
            event.preventDefault();
            alert(`O limite de envios é de ${uploadLimit} fotos`);
            return true;
        }

        const photosDiv = [];
        preview.childNodes.forEach(item => {
            if (item.classList && item.classList.value == 'photo') { // apenas photo
                photosDiv.push(item);
            }
        });

        const totalPhotos = fileList.length + photosDiv.length;
        if (totalPhotos > uploadLimit) {
            alert('Limite de fotos excedido');
            event.preventDefault();
            return true;
        }

        return false;
    },

    getAllFiles() {
        const dataTransfer = new ClipboardEvent('').clipboardData || new DataTransfer();

        PhotosUpload.files.forEach(file => dataTransfer.items.add(file));

        return dataTransfer.files;
    },

    getContainer(image) {
        const div = document.createElement('div');
        div.classList.add('photo');

        div.onclick = PhotosUpload.removePhoto;

        div.appendChild(image);

        div.appendChild(PhotosUpload.getRemoveButton());

        return div;
    },

    getRemoveButton() {
        const button = document.createElement('i');
        button.classList.add('material-icons');
        button.innerHTML = 'close';

        return button;
    },

    // front-end only
    removePhoto(event) {
        const photoDiv = event.target.parentNode;
        const photosArray = Array.from(PhotosUpload.preview.children);
        const index = photosArray.indexOf(photoDiv);

        PhotosUpload.files.splice(index, 1);

        PhotosUpload.input.files = PhotosUpload.getAllFiles();

        photoDiv.remove();
    },

    removeOldPhoto(event) {
        const photoDiv = event.target.parentNode // <div class='photo'></div>

        if (photoDiv.id) {
            const removedFiles = document.querySelector('input[name="removed_files"]');

            if (removedFiles) {
                removedFiles.value += `${photoDiv.id},` // string '1,2,3, ... ,'
            }
        }

        // front-end only
        photoDiv.remove();
    }
}

const chefAvatarUpload = {
    input: '',
    preview: document.querySelector('.avatar-preview'),
    uploadLimit: 1,
    files: [],
    handleFileInput(event) {
        const { files: fileList } = event.target;
        chefAvatarUpload.input = event.target;

        Array.from(fileList).forEach(file => {

            chefAvatarUpload.files.push(file);

            const reader = new FileReader();

            reader.onload = () => {
                const image = new Image();
                image.src = String(reader.result);

                const div = chefAvatarUpload.getContainer(image);

                chefAvatarUpload.preview.appendChild(div);
            }

            reader.readAsDataURL(file);
        });
    },
    getAllFiles() {
        const dataTransfer = new ClipboardEvent('').clipboardData || new DataTransfer();

        chefAvatarUpload.files.forEach(file => dataTransfer.items.add(file));

        return dataTransfer.files;
    },
    getContainer(image) {
        const div = document.createElement('div');
        div.classList.add('avatar');

        div.onclick = chefAvatarUpload.removePhoto;

        div.appendChild(image);

        div.appendChild(chefAvatarUpload.getRemoveButton());

        return div;
    },
    getRemoveButton() {
        const button = document.createElement('i');
        button.classList.add('material-icons');
        button.innerHTML = 'close';

        return button;
    },
    removePhoto(event) {
        const photoDiv = event.target.parentNode;
        const photosArray = Array.from(chefAvatarUpload.preview.children);
        const index = photosArray.indexOf(photoDiv);

        chefAvatarUpload.files.splice(index, 1);
        chefAvatarUpload.input.files = chefAvatarUpload.getAllFiles();

        photoDiv.remove();
    },

}

const ImageGallery = {
    highlight: document.querySelector('.gallery .highlight > img'),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(event) {
        const { target } = event;

        ImageGallery.previews.forEach(preview => preview.classList.remove('active'));

        target.classList.add('active');

        ImageGallery.highlight.src = target.src;
    }
}

const Validate = {
    aplly(input, func) {
        Validate.clearErrors(input);

        let results = Validate[func](input.value);
        input.value = results.value;

        if(results.error) Validate.displayError(input, results.error.message);
    },
    displayError(input, error) {
        const div = document.createElement('div');
        div.classList.add('error');
        div.innerHTML = error;
        input.parentNode.appendChild(div);

        input.focus();
    },
    clearErrors(input) {
        const errorDiv = input.parentNode.querySelector('.error');
        if(errorDiv) errorDiv.remove();
    },
    isEmail(value) {
        let error = null;

        const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (!value.match(mailFormat))
            error = 'Email inválido';

        return {
            error,
            value
        }
    }
}
