const nodemailer = require("nodemailer");
const { google } = require("googleapis");


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

module.exports = smtpTransport