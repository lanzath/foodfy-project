const UserModel = require('../models/UserModel');
const mailer = require('../../lib/mailer');

module.exports = {
    async list(request, response) {
        const users = await UserModel.all();

        return response.render('admins/user/index', { users });
    },
    registerForm(request,response) {
        return response.render('admins/user/register');
    },
    async post(request, response) {
        const { id, email, password } = await UserModel.create(request.body);

        const user = await UserModel.findOne({ where: { id } });

        await mailer.sendMail({
            to:email,
            from: 'no-reply@foodfy.com.br',
            subject: 'Dados de acesso ao Foodfy',
            html: `<h2>Seja bem vindo ao Foodfy, ${user.name}</h2>
            <p>Agora com sua conta criada, você é oficialmente um membro da nossa comunidade!<p>
            <br>
            <p>Aqui estão seus dados de acesso à plataforma:<p>
            <p>Usuário: ${email}
            <p>Senha: ${password}<p>
            <br>
            <p> Lembre-se de que pode alterar sua senha a qualquer momento dentro da plataforma.<p>
            `
        });

        let users = await UserModel.all();

        return response.render('admins/user/index', {
            users,
            createSuccess:'Email enviado ao usuário!',
        });
    },
    async updateForm(request, response) {
        const id = request.params.id;

        const user = await UserModel.findOne({ where: { id } });

        return response.render('admins/user/edit', { user });
    },
    async put(request, response) {
        let { name, email, is_admin, id } = request.body;
        await UserModel.update(id, {
            name,
            email,
            is_admin,
        });

        return response.render('admins/user/edit', {
            user: request.body,
            createSuccess: 'Usuário atualizado com sucesso',
        });
    },
    async delete(request, response) {
        try{
            await UserModel.delete(request.body.id);
            let users = await UserModel.all();

            return response.render ('admins/user/index', {
                users,
                createSuccess: 'Usuário deletado com sucesso',
            });
        } catch(err) {
            console.error(err.message);

            return response.render('admins/user/index', {
                user: request.body,
                createError: 'Erro ao tentar atualizar o usuário. Tente novamente!',
            });
        }
    }
}
