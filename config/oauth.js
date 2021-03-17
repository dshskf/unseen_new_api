const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");

/* -------------------------------------------------------------------------- */
/*                        Oauth2.0 Email Initialization                       */
/* -------------------------------------------------------------------------- */

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const refreshToken = process.env.REFRESH_TOKEN

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
        user: process.env.EMAIL,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken
    }
});

module.exports = smtpTransport