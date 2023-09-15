import jwt from 'jsonwebtoken'

const {
    JWT_TOKEN_MAX_AGE_IN_HOUR,
    JWT_SECRET_KEY,
} = process.env

class JWTToken {
    cookie_options = {
        maxAge: JWT_TOKEN_MAX_AGE_IN_HOUR * 3600000,
        domain: 'vcn-testing.onrender.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    };

    getToken(userId) {
        let payload = { userId }
        let token = jwt.sign(payload, JWT_SECRET_KEY, { 'expiresIn': JWT_TOKEN_MAX_AGE_IN_HOUR + 'h' })
        return token
    }

    sendToken(res, userId) {
        let JWT_token = this.getToken(userId)

        res.cookie('JWT_token', JWT_token, this.cookie_options)
    }

    removeToken(res) {
        res.clearCookie(
            'JWT_token',
            this.cookie_options
        )
    }
}

const jwtToken = new JWTToken()

export default jwtToken