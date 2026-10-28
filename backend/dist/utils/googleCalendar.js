import { google } from "googleapis";
export const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
export const SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
];
export async function createGoogleCalendarEvent({ appointment, refreshToken }) {
    const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    auth.setCredentials({
        refresh_token: refreshToken,
    });
    const calendar = google.calendar({
        version: "v3",
        auth,
    });
    const event = {
        summary: `Appointment - ${appointment.name}`,
        description: `
Customer: ${appointment.name}
Email: ${appointment.email}
Phone: ${appointment.phone}

Message:
${appointment.message || ""}
    `,
        start: {
            dateTime: `${appointment.date}T${appointment.startTime}:00+05:00`,
            timeZone: "Asia/Karachi",
        },
        end: {
            dateTime: `${appointment.date}T${appointment.endTime}:00+05:00`,
            timeZone: "Asia/Karachi",
        },
    };
    //@ts-ignore
    const response = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
    });
    //@ts-ignore
    return response.data;
}
