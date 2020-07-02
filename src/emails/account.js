const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ahmad@cholluyev.com',
        subject: 'Thanks for joining!',
        text: `Welcome to the app, ${name}.`
    })
}

const sendCancellationEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'ahmad@cholluyev.com',
        subject: 'We\'re sorry you\'re leaving us :(',
        text: `Hey,${name}, it sucks that we have to split our paths. Let us know what which feature is missing.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}