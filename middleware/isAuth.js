const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authData = req.get('Authorization')

    if (!authData) {
        return res.status(200).json({
            err: 'Not validated!'
        })
    }


    const token = authData.split(" ")[1]
    let decodedToken
    try {
        decodedToken = jwt.verify(token, 'SUp3rs3Cr3TR0kEn')
    } catch (err) {
        return res.status(200).json({
            err: 'Login session has expired!'
        })
    }

    if (!decodedToken) {
        return res.status(200).json({
            err: 'Login session has expired!'
        })
    }        
    req.userId = decodedToken.userId
    req.type = decodedToken.type
    req.typeCode = decodedToken.typeCode
    
    next()
}