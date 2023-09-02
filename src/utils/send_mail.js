import nodemailer from 'nodemailer'
import moment from 'moment'
import { getOTPHtmlString, getReceiptHtmlString } from './html_string_handlers.js'
import ProjectInfo from '../configs/project_info.js'

const { GMAIL_USERNAME, GMAIL_PASSWORD } = process.env

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
        user: GMAIL_USERNAME,
        pass: GMAIL_PASSWORD,
    },
})

const sendOTPViaEmail = async (OTP_code, OTP_expire_in_minute, receiver, subject) => {
    let html_to_send = await getOTPHtmlString(ProjectInfo, OTP_expire_in_minute, OTP_code)

    await transporter.sendMail({
        from: `"VCN Shop" <${GMAIL_USERNAME}>`,
        to: receiver,
        subject: subject,
        text: 'This is your OTP code: ' + OTP_code + '. If you have not requested this email then, please ignore it.',
        html: html_to_send,
    })
}

const sendReceiptViaEmail = async (
    receiver,
    subject,
    {
        paymentInfo,
        shippingInfo,
        receiverInfo,
        items,
        shippingFee,
        taxFee,
        totalToPay,
        createdAt,
    }
) => {
    let generatedOn = moment().format("MMMM Do YYYY")
    let paidAt = moment(createdAt).format('MMMM Do YYYY, h:mm a')

    let html_to_send = await getReceiptHtmlString({
        paymentInfo,
        shippingInfo,
        receiverInfo,
        items,
        shippingFee,
        taxFee,
        totalToPay,
        generatedOn,
        paidAt,
        company_info: ProjectInfo,
    })

    await transporter.sendMail({
        from: `"VCN Shop" <${GMAIL_USERNAME}>`,
        to: receiver,
        subject: subject,
        text:
            `
                Payment Receipt:\n
                \nID: ${paymentInfo.id}
                \nAddress: ${shippingInfo.address}
                \nShipping Method: ${shippingInfo.method}
                \nEmail: ${receiverInfo.email}
                \nPhone: ${receiverInfo.phone}
                \nPaid On: ${paymentInfo.method}
                \nSum: ${items.length > 1 ? items.length + ' items' : items.length + ' item'}
                \nTax Fee: ${taxFee}
                \nShipping Fee: ${shippingFee}
                \nTotal To Pay: ${totalToPay}
                \nGenerated On: ${generatedOn}
            `,
        html: html_to_send,
    })
}

export {
    sendOTPViaEmail, sendReceiptViaEmail,
}