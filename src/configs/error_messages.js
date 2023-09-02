const errorMessage = {
    // input
    INVALID_INPUT: 'Invalid input',

    // file
    FILE_NOT_FOUND: "There's no files in the request",

    // auth
    EMAIL_REGISTERED: 'Email has been registered',
    VERIFY_OTP_TIMES_UP: 'Time for verify OTP is over!',
    INCORRECT_OTP: 'OTP is incorrect',
    REGISTER_TIMES_UP: 'Time for register is over!',
    INCORRECT_EMAIL_PASSWORD: 'Incorrect email or password, please try again!',
    EMAIL_NOT_REGISTERED: 'User with the email is not registered, please register to continue!',
    USER_NOT_ACTIVE: 'User with the email is not active, please activate user by complete the register!',
    RESET_PASSWORD_TIMES_UP: 'Time for reset password is over!',
    TOKEN_NOT_FOUND: 'Token not found',
    CANNOT_VERFIFY_EMAIL: "Can't not verify email",
    TOKEN_NOT_SECURE: 'Token is not secure',

    // order
    ORDER_NOT_FOUND: 'Order not found',

    // product
    PRODUCT_NOT_FOUND: 'Product not found',
    PRODUCTS_NOT_FOUND: 'Products not found',

    // shop
    SHOP_NOT_FOUND: 'Shop not found',

    // user
    USER_NOT_FOUND: 'User not found',
    INVALID_USER_ROLE: 'You don\'t have permission to access this resource',
    INCORRECT_OLD_PASSWORD: 'The old password is not correct!',

    // system
    NETWORK_ERR: 'NetWork error',
    INTERNAL_SERVER_ERR: 'Internal Server Error',

    // IP2
    UNSUABLE_SERVICE: 'Location service is not usable now',
}

export default errorMessage