import ejs from 'ejs'

const getOTPHtmlString = async (company_info, OTP_expire_in_minute, OTP_code) => {
    let html_string = await ejs.renderFile(
        './src/templates/otp.ejs',
        {
            company_info,
            OTP_expire_in_minute,
            OTP_code,
        }
    )

    return html_string
}

const getReceiptHtmlString = async ({
    paymentInfo,
    shippingInfo,
    receiverInfo,
    items,
    shippingFee,
    taxFee,
    totalToPay,
    generatedOn,
    paidAt,
    company_info,
}) => {
    let html_string = await ejs.renderFile(
        './src/templates/receipt.ejs',
        {
            paymentInfo,
            shippingInfo,
            receiverInfo,
            items,
            shippingFee,
            taxFee,
            totalToPay,
            generatedOn,
            paidAt,
            company_info,
        }
    )

    return html_string
}

const getOAuthHtmlString = async (status, message, access_token) => {
    let html_string = await ejs.renderFile(
        './src/templates/oauth_response.ejs',
        {
            status,
            message,
            access_token,
        }
    )

    return html_string
}

export {
    getOTPHtmlString, getReceiptHtmlString, getOAuthHtmlString,
}