export const customerAppointmentEmail = ({
    customerName = "Valued Client",
    appointmentDate = "Monday, September 28, 2026",
    appointmentTime = "10:00 AM – 11:00 AM",
    year = new Date().getFullYear(),
} = {}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Request Received</title>
</head>

<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; color:#333; background:#ffffff;">

    <div style="max-width:600px; margin:0 auto; padding:30px 20px;">

        <p style="margin:0 0 25px; font-size:22px; font-weight:bold;">
            Habibi Property
        </p>

        <p>Hello ${customerName},</p>

        <p>
            Thank you for booking an appointment with Habibi Property.
            We have received your request and Ahmed or our team will contact
            you shortly to confirm the appointment.
        </p>

        <p style="margin-top:25px; font-weight:bold;">
            Appointment Details
        </p>

        <p style="margin:8px 0;">
            <strong>Date:</strong> ${appointmentDate}
        </p>

        <p style="margin:8px 0;">
            <strong>Time:</strong> ${appointmentTime}
        </p>

        <p style="margin-top:25px;">
            Your appointment is currently pending confirmation. We will contact
            you if any changes are required.
        </p>

        <p style="margin-top:30px;">
            Regards,<br>
            <strong>Ahmed</strong><br>
            Habibi Property
        </p>

        <p style="margin-top:30px; font-size:12px; color:#777;">
            © ${year} Habibi Property. All rights reserved.
        </p>

    </div>

</body>
</html>
`;
};

export const generateAdminAppointmentEmail = ({
    customerName = "N/A",
    customerEmail = "N/A",
    customerPhone = "N/A",
    appointmentDate = "N/A",
    appointmentTime = "N/A",
    appointmentNotes = "None provided",
    adminUrl = "https://dashboard.habibiproperty.com",
    year = new Date().getFullYear(),
} = {}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Appointment Request</title>
</head>

<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; color:#333; background:#ffffff;">

    <div style="max-width:600px; margin:0 auto; padding:30px 20px;">

        <p style="margin:0 0 25px; font-size:22px; font-weight:bold;">
            Habibi Property
        </p>

        <p>Hi Ahmed,</p>

        <p>
            A new appointment request has been submitted through the Habibi Property website.
        </p>

        <p style="margin-top:25px; font-weight:bold;">
            Customer Details
        </p>

        <p style="margin:8px 0;">
            <strong>Name:</strong> ${customerName}
        </p>

        <p style="margin:8px 0;">
            <strong>Email:</strong> ${customerEmail}
        </p>

        <p style="margin:8px 0;">
            <strong>Phone:</strong> ${customerPhone}
        </p>

        <p style="margin-top:25px; font-weight:bold;">
            Appointment Details
        </p>

        <p style="margin:8px 0;">
            <strong>Date:</strong> ${appointmentDate}
        </p>

        <p style="margin:8px 0;">
            <strong>Time:</strong> ${appointmentTime}
        </p>

        <p style="margin:8px 0;">
            <strong>Notes:</strong> ${appointmentNotes}
        </p>

        <p style="margin-top:25px;">
            Please review the appointment and contact the customer to confirm
            or reschedule it.
        </p>

        <p style="margin-top:25px;">
            <a href="${adminUrl}" style="color:#333;">
                View Appointment
            </a>
        </p>

        <p style="margin-top:30px;">
            Regards,<br>
            Habibi Property Website
        </p>

        <p style="margin-top:30px; font-size:12px; color:#777;">
            © ${year} Habibi Property. This is an automated notification.
        </p>

    </div>

</body>
</html>
`;
};
