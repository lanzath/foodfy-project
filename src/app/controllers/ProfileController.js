const UserModel = require('../models/UserModel');

module.exports = {
    async index(request, response) {
        // auth user data
        const { user } = request;

        return response.render('admins/user/profile', { user });
    },
    async put(request, response) {
        try {
            let user = request.user;
            let { name, email } = request.body;

            await UserModel.update(user.id, {
                name,
                email,
            });

            return response.render('admins/user/profile', {
                user: request.body,
                createSuccess: 'Dados atualizados com sucesso!',
            });
        }
        catch (err) {
            console.error(err.message);
            return response.render('admins/user/profile', {
                user: request.body,
                createError: 'Erro inesperado! Tente novamente',
            });
        }
    }
}
