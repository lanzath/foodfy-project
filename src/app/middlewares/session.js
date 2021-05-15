const UserModel = require('../models/UserModel')
const Recipe = require('../models/Recipe')
const File = require('../models/File')

function onlyUsers(request, response, next) {
    if (!request.session.userId) return response.redirect('/login');

    next();
}

function isLogged(request, response, next) {
    if (request.session.userId) return response.redirect('/admin/profile');

    next();
}

async function isAdmin(request, response, next) {
    const { userId: id } = request.session;

    if (!id) {
        return response.redirect('/');
    }
    const user = await UserModel.findOne({ where: { id } });

    if (!user.is_admin) {
        return response.redirect('/');
    }

    next();
}

async function onlyOwnUsers(request, response, next) {
    if (!request.session.userId) return response.redirect('/login');

    const user = await UserModel.findOne(request.session.userId);

    const recipeResult = await Recipe.find(request.params.id);
    const recipe = recipeResult.rows[0];

    let results = await Recipe.files(recipe.id);
    let recipe_files = results.rows;
    let filesId = recipe_files.map(row => row.file_id);

    let filesPromise = filesId.map(id => File.find(id));
    results = await Promise.all(filesPromise)

    const files = results.map(result => ({
        ...result.rows[0],
        src: `${request.protocol}://${request.headers.host}${result.rows[0].path.replace('public','')}`
    }));

    if (!user.is_admin) {
        if (recipe.user_id != request.session.userId) {
            return response.render('admins/recipes/show', {
                recipe,
                files,
                createError:'Você não tem permissão para alterar esta receita!'
            });
        }
    }

    next();
}

module.exports = {
    onlyUsers,
    isLogged,
    onlyOwnUsers,
    isAdmin
}
