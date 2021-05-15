const UserModel = require('../models/UserModel');
const User = require('../models/User');

async function post(request, response, next) {
    // check all inputs
    const keys = Object.keys(request.body);

    for (key of keys) {
        if (request.body[key] == '') {
            return response.send('Os campos são todos obrigatórios.');
        }
    }

    // check for existing user (email)
    const { email } = request.body;
    const user = await UserModel.findOne({
        where: { email }
    });

    if (user) return response.render('admins/user/register', {
        user: request.body,
        createError:'Usuário já cadastrado',
    });

    next();
}

async function adminCannotDeleteOwnAccount(request, response, next) {
    const users = await UserModel.all();

    if (request.session.userId == request.body.id) {
        return response.render('admins/user/index', {
            users,
            createError:'Um administrador não pode deletar a própria conta.'
        });
    }

    next();
}


module.exports = {
    post,
    adminCannotDeleteOwnAccount
}
