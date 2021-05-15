const UserModel = require('../models/UserModel');
const { compare } = require('bcryptjs');


async function index(request, response, next) {
    const { userId: id } = request.session;

    const user = await UserModel.findOne({ where: { id } });

    if(!user) return response.render('admins/register', {
        createError: 'Usuário não encontrado'
    });

    request.user = user;

    next();
}

async function update(request, response, next) {
    // check inputs
    const keys = Object.keys(request.body);

    for (key of keys) {
        if (request.body[key] == '') {
            return response.render('admins/user/profile', {
                user: request.body,
                createError: 'Preencha todos os campos'
            });
        }
    }

    const { id, password } = request.body;
    if (!password) return response.render('admins/user/profile', {
        user: request.body,
        createError: 'Preencha todos os campos'
    });

    const user = await UserModel.findOne({ where: { id } });

    const passed = await compare(password, user.password);

    if (!passed) return response.render('admins/user/profile', {
        user: request.body,
        createError: 'Use a senha que usou para se cadastrar'
    });

    request.user = user;

    next();
}

module.exports = {
    index,
    update
}
