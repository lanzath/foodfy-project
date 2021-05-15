const multer = require('multer');


// storage config
const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, './public/images') // where to store (dir)
    },

    filename: (request, file, callback) => {
        // file unique name generate
        callback(null, `${Date.now().toString()}-${file.originalname}`);
    }
});


// extension verify
const fileFilter = (request, file, callback) => {
    const isAccepted = ['image/png', 'image/jpg', 'image/jpeg']
        .find(acceptedFormat => acceptedFormat == file.mimetype);

    if (isAccepted) {
        return callback(null, true);
    }

    return callback(null, false);
};

module.exports = multer({
    storage,
    fileFilter,
});
