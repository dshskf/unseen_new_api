const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const randtoken = require('rand-token');
const user_model = require('../Models/user')

/* -------------------------------------------------------------------------- */
/*                        Oauth2.0 Email Initialization                       */
/* -------------------------------------------------------------------------- */

const clientId = "345438441281-j94hb2djdmf5dpc576f6es9lcd7p38pr.apps.googleusercontent.com"
const clientSecret = "Fgld1E9FZKdXPqG1yx9ZzFVB"
const refreshToken = "1//04xUD8SITN41JCgYIARAAGAQSNwF-L9Irz4YtAtaHXFrjOk5PtCWFX8sOl64w5GyloGtjox5cbbOFS8XjmDirLPB8Whpw9gFyyu4"

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: refreshToken
});

const accessToken = oauth2Client.getAccessToken()

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: "alexkeman9@gmail.com",
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken
    }
});


/* -------------------------------------------------------------------------- */
/*                                 Controller                                 */
/* -------------------------------------------------------------------------- */

exports.PostRegister = async (req, res, next) => {
    const err = validationResult(req)
    if (err.errors.length > 0) {
        return res.status(200).json({
            err: err.errors[0].msg
        })
    }

    const user = await user_model.findOne({
        where: {
            email: req.body.email
        }
    })

    if (user) {
        return res.status(200).json({
            err: "Email has been registered!"
        })
    }

    req.body.password = await bcrypt.hash(req.body.password, 10)
    req.body.account_types = 'user'
    const insertModel = await user_model.create(req.body)

    return res.status(200).json({
        status: 200,
        err: null
    })
}

exports.PostLogin = async (req, res, next) => {
    const err = validationResult(req)
    if (err.errors.length > 0) {
        return res.status(200).json({
            err: err.errors[0].msg
        })
    }

    const user = await user_model.findOne({
        where: {
            username: req.body.username
        }
    })

    if (!user) {
        return res.status(200).json({
            err: "Can't find user!"
        })
    }

    const checkPassword = await bcrypt.compare(req.body.password, user.password);

    if (!checkPassword) {
        return res.status(200).json({
            err: "Password not match!"
        })
    }

    const jwt_token = jwt.sign({
        username: user.username,
        userId: user.id
    },
        'SUp3rs3Cr3TR0kEn',
        { expiresIn: '1d' })


    return res.status(200).json({
        status: 200,
        token: jwt_token,
        userData: user,
        err: null
    })
}


exports.SendEmailReset = async (req, res, next) => {
    const err = validationResult(req)
    if (err.errors.length > 0) {
        return res.status(200).json({
            err: err.errors[0].msg
        })
    }

    const user = await user_model.findOne({
        where: {
            email: req.body.email
        }
    })

    if (!user) {
        return res.status(200).json({
            err: "Email not found!"
        })
    }

    const link_token = randtoken.generate(16)
    // const token_expired_date = new Date(Date.now() + (1000 * 60 * 60 * 24))//Second - Minute - Hour - Day
    const token_expired_date = new Date(Date.now() + (1000 * 60 * 60))

    user.repass_token = link_token
    user.repass_token_expired = token_expired_date
    const updateUser = await user.save()

    if (!updateUser) {
        return res.status(200).json({
            err: "Error on set token"
        })
    }

    const mailOptions = {
        from: "Unseen alexkeman9@gmail.com",
        to: req.body.email,
        subject: "Reset password",
        generateTextFromHTML: true,
        html: `<p>Click <a href="http://localhost:3000/reset/${link_token}">here</a> to reset your account!</p>`
    };
    smtpTransport.sendMail(mailOptions, (error, response) => {
        smtpTransport.close();

        if (error) {
            console.log(error)
            return res.status(200).json({
                err: error
            })
        }

        console.log("Email has been sent...");

        return res.status(200).json({
            status: 200,
            err: null
        })

    });
}

exports.CheckResetEmailLink = async (req, res, next) => {
    const user = await user_model.findOne({
        where: {
            repass_token: req.body.token
        }
    })

    if (!user) {
        return res.status(200).json({
            err: 'Link not found!'
        })
    }

    const user_date = new Date(user.repass_token_expired)
    const now = new Date(Date.now())

    if (user_date < now) {
        return res.status(200).json({
            err: 'Link has expired!'
        })
    } else {
        return res.status(200).json({
            status: 200,
            err: null
        })
    }
}

exports.get_edit = async (req, res, next) => {
    const userId = req.userId

    const user = await user_model.findOne({
        where: {
            id: userId
        }
    })

    if (!user) {
        return res.status(200).json({
            err: "You are not authorized to this action!"
        })
    }

    return res.status(200).json({
        status: 200,
        data: user,
        err: null
    })
}

exports.post_edit = async (req, res, next) => {
    const userId = req.userId
    console.log(req.body)
    const user = await user_model.findOne({
        where: {
            id: userId
        }
    })

    if (!user) {
        return res.status(200).json({
            err: "You are not authorized to this action!"
        })
    }

    user.username = req.body.username
    user.email = req.body.email
    user.phone = req.body.phone

    const update_user = user.save()

    if (!update_user) {
        return res.status(200).json({
            err: "Update Failed!"
        })
    }

    return res.status(200).json({
        status: 200,
        err: null
    })
}


exports.check_token = async (req, res, next) => {
    if (!req.userId) {
        return res.status(200).json({
            err: "Not authenticated!"
        })
    }

    const user = await user_model.findOne({
        where: {
            id: req.userId
        }
    })

    if (!user) {
        return res.status(200).json({
            err: "User not found!"
        })
    }

    return res.status(200).json({
        status: 200,
        user: user,
        err: null
    })
}