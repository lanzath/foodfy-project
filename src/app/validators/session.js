const UserModel = require('../models/UserModel');
const { compare } = require('bcryptjs');
const bcrypt = require('bcryptjs');

async function login(request, response, next) {
    const { email, password } = request.body;

    // user verify
    const user = await UserModel.findOne({ where: { email } });

    if (!user) return response.render('admins/session/login', {
        user: request.body,
        Error: 'Usuário não cadastrado.'
    });
    hashPass = await bcrypt.hash(password, 8);

    // password verify
    const passed = await compare(password, user.password);

    if (!passed) return response.render('admins/session/login', {
        user: request.body,
        Error: 'Senha incorreta!'
    });

    request.user = user;

    next();
}

async function forgot(request, response, next) {
    try {
        const { email } = request.body;

        let user = await UserModel.findOne({ where: { email } });

        if (!user) return response.render('admins/session/forgot-password', {
            user: request.body,
            Error: 'Email não cadastrado.'
        });

        request.user = user;

        next();
    }
    catch (err) {
        console.error(err.message);

        return response.render('admins/session/forgot-password', {
            user: request.body,
            Error: 'Erro inesperado! Tente novamente'
        });
    }

}

async function reset(request, response, next) {
    try {
        // find user
        const { email, token, password, passwordRepeat } = request.body;

        const user = await UserModel.findOne({ where: {email} })
        if (!user) response.render('admins/session/password-reset', {
            user: request.body,
            token,
            Error: 'Email não cadastrado!'
        });

        // password check
        if (password != passwordRepeat) response.render('admins/session/password-reset', {
            user: request.body,
            token,
            Error: 'Repetição de senha incorreta!'
        });

        // token verify
        if(token != user.reset_token) response.render('admins/session/password-reset', {
            user: request.body,
            token,
            Error: 'Token Inválido! Solicite outra troca de senha antes de tentar novamente.'
        });

        // verify if token is valid
        let now = new Date();
        now = now.setHours(now.getHours);

        if (now > user.reset_token_expires) response.render('admins/session/password-reset', {
            user: request.body,
            token,
            Error: 'Token Expirado! Solicite outra troca de senha antes de tentar novamente.'
        });

        request.user = user;

        next();
    }
    catch (err) {
        console.error(err.message);
    }
}

module.exports = {
    login,
    forgot,
    reset
}
