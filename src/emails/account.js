const sgmail = require('@sendgrid/mail')

sgmail.setApiKey(process.env.SENDGRID_API_KEY)

// sgmail.send({
//     to: 'zidrexandag10@gmail.com',
//     from: 'zidrexandag06@gmail.com',
//     subject: 'This is my first creation',
//     text: 'I hope this one gets to you'
// })


const sendWelcomeMsg = (email, name) => {
    sgmail.send({
        to: email,
        from: 'zidrexandag06@gmail.com',
        subject: 'Thanks for joining us!',
        text: `Thanks for joining the task manager app! ${name}`
    })
}

const sendConfirmMsg = (email, name) => {
    sgmail.send({
        to: email,
        from: 'zidrexandag06@gmail.com',
        subject: 'We are sad to see you go',
        text: `We are sad to see you go! ${name}`
    })
}

module.exports = {
    sendWelcomeMsg,
    sendConfirmMsg
}