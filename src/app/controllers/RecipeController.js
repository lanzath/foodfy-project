const Recipe = require('../models/Recipe');
const File = require('../models/File');
const UserModel = require('../models/UserModel');

module.exports = {
    async index(request,response) {
        let results = await Recipe.all();

        const recipes = results.rows;
        const recipesId = recipes.map(recipe => recipe.id);
        const recipeFilesRowsPromise = recipesId.map(id => File.findForIndex(id));

        results = await Promise.all(recipeFilesRowsPromise);
        recipeFilesRows = results.map(result => result.rows[0]);
        filesPromise = recipeFilesRows.map(row => File.find(row.file_id));

        results = await Promise.all(filesPromise);

        files = results.map(result => result.rows[0]);
        files = files.map(file => ({
            ...file,
            src: `${request.protocol}://${request.headers.host}${file.path.replace('public','')}`
        }));

        return response.render('admins/recipes/index', {recipes, files});
    },
    async create(request,response) {
        let results = await Recipe.chefsSelectOptions();
        const options = results.rows;

        return response.render('admins/recipes/create', { chefOptions: options });

    },
    async post(request, response) {
        const keys = Object.keys(request.body);

        for (key of keys) {
            if (request.body[key] == '') return response.send('Por favor preencha todos os dados da receita.');
        }

        if (request.files.length == 0) {
            return response.send('Envie ao menos uma imagem!');
        }

        request.body.user_id = request.session.userId;
        let results = await Recipe.create(request.body);
        const recipeId = results.rows[0].id;

        const filesPromise = request.files.map(file =>File.create(file)); // pending promises array
        const filesResults = await Promise.all(filesPromise);

        const recipeFilesPromises = filesResults.map(file => {
            const fileId = file.rows[0].id;

            File.createAtRecipeFiles(fileId, recipeId); // Create by relationship
        });

        await Promise.all(recipeFilesPromises);

        return response.redirect(`/admin/recipes/${recipeId}`);
    },
    async show(request, response) {
        let result = await Recipe.find(request.params.id);
        recipe = result.rows[0];

        if (!recipe) return response.send('recipe not found');

        // get images
        let results = await Recipe.files(recipe.id);
        let recipe_files = results.rows;
        let filesId = recipe_files.map(row => row.file_id);

        let filesPromise = filesId.map(id => File.find(id));
        results = await Promise.all(filesPromise);

        const files = results.map(result => ({
            ...result.rows[0],
            src: `${request.protocol}://${request.headers.host}${result.rows[0].path.replace('public','')}`
        }));

        return response.render('admins/recipes/show', { recipe, files });
    },
    async edit(request,response) {
        try {
            let results = await Recipe.find(request.params.id);
            const recipe = results.rows[0];

            if (!recipe) return response.send('Receita não encontrada');

            //get chefOptions
            results = await Recipe.chefsSelectOptions();
            options = results.rows;

            //get images
            results = await Recipe.files(recipe.id);
            let filesId = results.rows;
            filesId = filesId.map(file => file.file_id);

            let filesPromise = filesId.map(id => File.find(id));
            results = await Promise.all(filesPromise);

            let files = results.map(result => ({
                ...result.rows[0],
                // image uri
                src: `${request.protocol}://${request.headers.host}${result.rows[0].path.replace('public','')}`
            }));

            return response.render('admins/recipes/edit', {recipe, chefOptions:options, files});
        }
        catch (err) {
            console.error(err.message);
        }
    },
    async put(request,response) {
        const keys = Object.keys(request.body);

        for (key of keys) {
            if (request.body[key] == '' && key != 'removed_files') return response.send('Por favor preencha todos os dados da receita.');
        }

        // create sent images
        if (request.files.length != 0) {
            const newFilesPromise = request.files.map(file => File.create(file));
            let results = await Promise.all(newFilesPromise);

            const recipeFilesPromises = results.map(file => {
                const fileId = file.rows[0].id;
                File.createAtRecipeFiles(fileId, request.body.id);
            });

            await Promise.all(recipeFilesPromises);
        }

        // remove pics from db
        if (request.body.removed_files) {
            const removedFiles = request.body.removed_files.split(',');

            // remove last empty index
            const lastIndex = removedFiles.length - 1;
            removedFiles.splice(lastIndex, 1); // [1,2,3]

            // delete file from db
            const removedFilesPromise = removedFiles.map(id => {
                File.deleteAtRecipeFiles(id);
                File.delete(id);
            });

            await Promise.all(removedFilesPromise);
        }

        await Recipe.update(request.body);

        return response.redirect(`/admin/recipes/${request.body.id}`);
    },
    delete(request,response) {
        Recipe.delete(request.body.id,function() {
            return response.redirect('/admin/recipes');
        });
    }
}
