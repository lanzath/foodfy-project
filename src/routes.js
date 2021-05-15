const express = require('express');
const routes = express.Router();
const multer = require('./app/middlewares/multer'); // Using multer for file upload

const users = require('./app/controllers/users');
const recipes = require('./app/controllers/RecipeController');
const chefs = require('./app/controllers/ChefController');
const SessionController = require('./app/controllers/SessionController');
const ProfileController = require('./app/controllers/ProfileController');
const UserController = require('./app/controllers/UserController');

const UserValidator = require('./app/validators/user');
const ProfileValidator = require('./app/validators/profile');
const SessionValidator = require('./app/validators/session');

const { onlyUsers, isAdmin, isLogged, onlyOwnUsers } = require('./app/middlewares/session');

/** GUEST ROUTES */
routes.get('/', users.home);
routes.get('/about', users.about);
routes.get('/search', users.search);
routes.get('/recipes', users.recipes);
routes.get('/recipes/:id', users.show);
routes.get('/chefs', users.chefs);

/** AUTH ROUTES: RECIPES CRUD */
routes.get('/admin/recipes', onlyUsers, recipes.index);
routes.get('/admin/recipes/create', onlyUsers, recipes.create);
routes.post('/admin/recipes', onlyUsers, multer.array('photos', 5), recipes.post); // Max 5 pics upload limit
routes.get('/admin/recipes/:id', onlyUsers, recipes.show);
routes.get('/admin/recipes/:id/edit', onlyOwnUsers, recipes.edit);
routes.put('/admin/recipes', onlyUsers,  multer.array('photos', 5), recipes.put);
routes.delete('/admin/recipes', onlyUsers, recipes.delete);

/** AUTH ROUTES: CHEFS CRUD */
routes.get('/admin/chefs', onlyUsers, chefs.index);
routes.get('/admin/chefs/create', isAdmin, chefs.create);
routes.post('/admin/chefs', isAdmin, multer.single('avatar'), chefs.post);
routes.get('/admin/chefs/:id', onlyUsers, chefs.show);
routes.get('/admin/chefs/:id/edit', isAdmin, chefs.edit);
routes.put('/admin/chefs', isAdmin, multer.single('avatar'), chefs.put);
routes.delete('/admin/chefs', isAdmin, chefs.delete);

/** AUTH */
routes.get('/login', isLogged, SessionController.loginForm);
routes.post('/login',SessionValidator.login, SessionController.login);
routes.post('/logout', SessionController.logout);

/** PASSWORD RECOVERY */
routes.get('/forgot-password', SessionController.forgotForm);
routes.get('/password-reset', SessionController.resetForm);
routes.post('/forgot-password', SessionValidator.forgot, SessionController.forgot);
routes.post('/password-reset', SessionValidator.reset, SessionController.reset);

/** AUTH ROUTES: USERS CRUD */
routes.get('/admin/register', isAdmin, UserController.registerForm);
routes.get('/admin/users', isAdmin, UserController.list);
routes.get('/admin/users/:id', isAdmin, UserController.updateForm);
routes.post('/admin/users', isAdmin, UserValidator.post, UserController.post);
routes.put('/admin/users', isAdmin, UserController.put);
routes.delete('/admin/users', isAdmin, UserValidator.adminCannotDeleteOwnAccount, UserController.delete);

/** AUTH ROUTES: USER PROFILE */
routes.get('/admin/profile', onlyUsers, ProfileValidator.index, ProfileController.index);
routes.put('/admin/profile', onlyUsers, ProfileValidator.update, ProfileController.put);

module.exports = routes;
