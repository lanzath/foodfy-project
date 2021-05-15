const faker = require('faker');
const { hash } = require('bcryptjs');

const Chef = require('./src/app/models/Chef');
const File = require('./src/app/models/File');
const Recipe = require('./src/app/models/Recipe');
const UserModel = require('./src/app/models/UserModel');
const { random, datatype } = require('faker');
const { file } = require('./src/app/models/Chef');

let usersIds = [];
let totalUsers = 5;
let totalRecipes = 40;
let totalChefs = 3;

async function createUsers() {
    try {
        let users=[];
        const password = await hash('secret', 8);

        while (users.length < totalUsers) {
            users.push({
                name: faker.name.firstName(),
                email: faker.internet.email(),
                seedPassword: password,
                is_admin: datatype.boolean(),
            });
        }

        const usersPromise = users.map(user => UserModel.create(user));
        createdUsers = await Promise.all(usersPromise);
        usersIds = createdUsers.map(user => user.id);
    }
    catch(err) {
        console.error(err.message);
    }
}

async function createChefs() {
    let files = [];
    let chefs = [];

    while (files.length < totalChefs) {
        files.push({
            filename: faker.image.image(),
            path: `public/images/chefPlaceholder.png`,
        });
    }

    filesPromise = files.map(file => File.create(file));
    filesIdsResults = await Promise.all(filesPromise);
    filesIds = filesIdsResults.map(result => result.rows[0].id);

    while (chefs.length < totalChefs) {
        chefs.push({
            name: faker.name.firstName(),
        });
    }

    chefsPromises = chefs.map(chef => {
        let file = filesIds[Math.ceil(Math.random() * filesIds.length - 1)];
        fileIndex = filesIds.indexOf(file);
        Chef.create(chef, file);
        filesIds.splice(fileIndex, 1);
    });

    await Promise.all(chefsPromises);
}

async function createRecipes() {
    let recipes = [];

    while (recipes.length < totalRecipes) {
        recipes.push({
            chef: Math.ceil(Math.random() * totalChefs),
            title: faker.name.title(),
            ingredients: [faker.random.word(), faker.random.word()],
            preparation: [faker.random.words(), faker.random.words()],
            information: faker.lorem.paragraph(Math.ceil(Math.random() * 10)),
            user_id: Math.ceil(Math.random() * totalUsers),
        });
    } // 10 recipes

    const recipesPromises = recipes.map(recipe => Recipe.create(recipe));
    const recipesResults = await Promise.all(recipesPromises);
    const recipesIds = recipesResults.map(result => result.rows[0].id); // 10 recipes id

    return recipesIds;
}

async function createRecipeFiles() {
    let recipesIds = await createRecipes();
    recipesIds = recipesIds.sort((a, b) => a - b);

    let files = [];

    for (recipeId of recipesIds) {
        while (files.length < 3) {
            files.push({
                filename: faker.image.image(),
                path: `/public/images/recipePlaceholder.png`,
            });
        }

        const filesPromises = files.map(file => File.create(file));
        const filesResults = await Promise.all(filesPromises);
        let filesIds = filesResults.map(result => result.rows);


        let ids = [];
        for (id of filesIds) {
            ids.push(id[0].id);
        }
        const recipeFilesPromises = ids.map(id => File.createAtRecipeFiles(id, recipeId));

        await Promise.all(recipeFilesPromises);
    }
}

async function init() {
    await createUsers();
    await createChefs();
    await createRecipeFiles();
}

init();
