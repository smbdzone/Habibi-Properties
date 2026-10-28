import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
const stripHtml = (htmlString) => {
    return htmlString
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};
const sendMail = async ({ to, subject = 'Appointment Received', html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"James" <${process.env.EMAIL}>`,
            to: to,
            subject: subject,
            html: html,
            text: stripHtml(html),
        });
        console.log('Email sent successfully: ' + info.messageId);
    }
    catch (error) {
        console.error(`Error in sending emails:`, error);
        throw error;
    }
};
export default sendMail;
