const Chef = require('../models/Chef');
const File = require('../models/File');
const Recipe = require('../models/Recipe');

module.exports = {
    async index(request, response) {
        let results = await Chef.all();
        let chefs = results.rows;

        async function getImage(fileId) {
            let result = await Chef.file(fileId);
            const file = result.rows[0];
            fileURL = `${request.protocol}://${request.headers.host}${file.path.replace('public', '')}`;
            return fileURL;
        }

        const chefsPromise = chefs.map(async chef => {
            chef.img = await getImage(chef.file_id);
            return chef;
        });

        chefs = await Promise.all(chefsPromise);

        return response.render('admins/chefs/index', { chefs });
    },
    create(request, response) {
        response.render('admins/chefs/create');
    },
    async post(request,response) {
        const keys = Object.keys(request.body);

        for (key of keys) {
            if (request.body[key] == '') return response.send('Por favor preencha todos os dados da receita.');
        }

        let result = await File.create(request.file);
        let fileId = result.rows[0].id;

        result = await Chef.create(request.body, fileId);
        let chefId = result.rows[0].id;

        return response.redirect(`/admin/chefs/${chefId}/edit`);
    },
    async show(request, response) {
        const { id } = request.params;

        let result = await Chef.find(id);
        let chef = result.rows[0];

        async function getImage(fileId) {
            let result = await Chef.file(fileId);
            const file = result.rows[0];
            fileURL = `${request.protocol}://${request.headers.host}${file.path.replace('public', '')}`;
            return fileURL;
        }

        chef.img = await getImage(chef.file_id);

        let results = await Chef.showRecipes(id);
        let recipes = results.rows;

        async function getRecipeImage(recipeId) {
            let results = await Recipe.files(recipeId);
            const filesId = results.rows.map(result => result.file_id);
            let filesPromise = filesId.map(id => File.find(id));
            results = await Promise.all(filesPromise);
            let files = results.map(result => result.rows[0]);
            const filesURL = files.map(file => `${request.protocol}://${request.headers.host}${file.path.replace('public', '')}`);

            return filesURL[0];
        }

        const recipesPromise = recipes.map(async recipe => {
            recipe.img = await getRecipeImage(recipe.id);
            return recipe;
        });

        recipes = await Promise.all(recipesPromise);

        return response.render('admins/chefs/show', { chef, recipes });
    },
    async edit(request, response) {
        const { id } = request.params;

        // get chef
        let result = await Chef.find(id);
        const chef = result.rows[0];

        if (!chef) return response.send('Chef not found');

        const fileId = result.rows[0].file_id;

        result = await File.find(fileId);
        file = result.rows[0];

        return response.render('admins/chefs/edit', { chef, file });
    },
    async put(request, response) {
        const keys = Object.keys(request.body);

        for (key of keys) {
            if (request.body[key] == '') return response.send('Por favor preencha todos os dados da receita.');
        }

        let result = await Chef.find(request.body.id);
        fileId = result.rows[0].file_id;

        if (request.file) {
            result = await File.create(request.file);
            newFileId = result.rows[0].id;

            await Chef.update(request.body, newFileId);
            await File.delete(fileId);
        } else {
            await Chef.update(request.body);
        }

        return response.redirect(`/admin/chefs/${request.body.id}/edit`);
    },
    delete(request, response) {
       Chef.delete(request.body.id, function() {
           return response.redirect('/admins/chefs');
       });
    }
}
