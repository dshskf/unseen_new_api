const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const randtoken = require('rand-token');
const agencyModel = require('../Models/agency')
const guidesModel = require('../Models/guides')
const userModel = require('../Models/user')
const smtpTransport = require('../config/oauth')

exports.PostLogin = async (req, res, next) => {
    const err = validationResult(req)
    if (err.errors.length > 0) {
        return res.status(200).json({
            err: err.errors[0].msg
        })
    }
    let user = null


    if (req.body.type === 'users') {
        user = await userModel.findOne({
            where: {
                username: req.body.username
            }
        })
    } else if (req.body.type === 'guides') {
        user = await guidesModel.findOne({
            where: {
                username: req.body.username
            }
        })
    } else if (req.body.type === 'agency') {
        user = await agencyModel.findOne({
            where: {
                username: req.body.username
            }
        })
    }


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
        userId: user.id,
        type: req.body.type,
        typeCode: req.body.type[0].toUpperCase()
    },
        'SUp3rs3Cr3TR0kEn',
        { expiresIn: '7d' })

    return res.status(200).json({
        status: 200,
        token: jwt_token,
        userData: user,
        type: req.body.type,
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

    const user = await userModel.findOne({
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
            return res.status(200).json({
                err: error
            })
        }

        return res.status(200).json({
            status: 200,
            err: null
        })

    });
}

exports.CheckResetEmailLink = async (req, res, next) => {
    const user = await userModel.findOne({
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
            data: user,
            err: null
        })
    }
}

exports.updateUserPassword = async (req, res, next) => {
    const user = await userModel.findOne({
        where: {
            id: req.body.userId
        }
    })

    if (!user) {
        return res.status(200).json({
            err: `Can't find user!`
        })
    }

    user.repass_token = null
    user.password = await bcrypt.hash(req.body.password, 10)
    await user.save()

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

    const user = await req.userModel.findOne({
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