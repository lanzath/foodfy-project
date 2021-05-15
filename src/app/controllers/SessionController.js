const crypto = require('crypto'); // recovery token lib
const UserModel = require('../models/UserModel');
const mailer = require('../../lib/mailer');
const { hash } = require('bcryptjs');

module.exports = {
    loginForm(request, response) {
        return response.render('admins/session/login');
    },
    login(request, response) {
        request.session.userId = request.user.id;

        return response.redirect('/admin/recipes');
    },
    logout(request, response) {
        request.session.destroy();

        return response.redirect('/login');
    },
    forgotForm(request, response) {
        return response.render('admins/session/forgot-password');
    },
    async forgot(request, response) {
        try {
            const { user } = request;

            // token para o usuário
            const token = crypto.randomBytes(20).toString('hex');

            // criar uma expiração do token
            let now = new Date();
            now = now.setHours(now.getHours() + 1);

            await UserModel.update(user.id, {
                reset_token: token,
                reset_token_expires: now,
            });

            // enviar um email com um link de recuperação
            await mailer.sendMail({
                to:user.email,
                from: 'no-reply@foodfy.com.br',
                subject: 'Recuperação de senha',
                html: `<h2>Esqueceu sua senha?</h2>
                <p>Não se preocupe, clique no link abaixo para redefinir sua senha!<p>
                <p>
                    <a href='http://localhost:3000/password-reset?token=${token}' target='_blank'>
                        clique aqui
                    </a>
                <p>
                `
            });

            return response.render('admins/session/forgot-password', {
                success:'Verifique seu email!'
            });

        } catch(err) {
            console.error(err.message);
            return response.render('admins/session/forgot-password', {
                error:'Erro inesperado! Tente novamente.'
            });
        }
    },
    resetForm(request, response) {
        const token = request.query.token;
        return response.render('admins/session/password-reset', { token });
    },
    async reset(request, response) {
        try {
            const { user } = request;
            const { password } = request.body;

            const newPassword = await hash(password, 8);

            await UserModel.update(user.id, {
                password: newPassword,
                reset_token: '',
                reset_token_expires: '',
            });

            return response.render('admins/session/login', {
                user:request.body,
                success: 'Senha atualizada! Faça seu login.',
            });

        } catch(err) {
            console.error(err.message);
            return response.render('admins/session/password-reset', {
                error:'Erro inesperado! Tente novamente.'
            });
        }
    }
}
