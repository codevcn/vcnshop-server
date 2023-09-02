import jwt from 'jsonwebtoken'

const {
    JWT_TOKEN_MAX_AGE_IN_HOUR,
    JWT_SECRET_KEY,
} = process.env

const cookie_options = {
    maxAge: JWT_TOKEN_MAX_AGE_IN_HOUR * 3600000,
    path: '/',
    httpOnly: true,
    //>>> fix this: change domain
    domain: 'localhost',
}

const getJWTToken = (userId) => {
    let payload = { userId }
    let token = jwt.sign(payload, JWT_SECRET_KEY, { 'expiresIn': JWT_TOKEN_MAX_AGE_IN_HOUR + 'h' })
    return token
}

const sendJWTToken = (res, user_id) => {
    let JWT_token = getJWTToken(user_id)

    res.cookie('JWT_token', JWT_token, cookie_options)
}

const removeJWTToken = (res) => {
    res.clearCookie('JWT_token', { domain: cookie_options.domain, path: cookie_options.path })
}

export {
    sendJWTToken, removeJWTToken, getJWTToken,
}