const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '1135cf4808f8c5',
        pass: '158a47ecd506cf',
    }
});
