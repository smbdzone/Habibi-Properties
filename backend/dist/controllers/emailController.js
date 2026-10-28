import Email from '../models/Email.js';
import { createNotification } from './notificationController.js';
import Admin from '../models/Admin.js';
import sendMail from '../utils/sendEmail.js';
import { customerAppointmentEmail, generateAdminAppointmentEmail } from '../utils/emails.js';
export const generateSlots = async (req, res) => {
    try {
        const { date, id } = req.body;
        if (!date) {
            res.status(400).json({
                success: false,
                message: 'Date must required'
            });
            return;
        }
        const dateValue = new Date(date);
        const dayNumber = dateValue.getDay();
        const slots = [];
        const admin = await Admin.findById(id).select('availability').lean();
        const selectedDay = admin?.availability?.weekly.find((a, i) => a.day === dayNumber);
        if (!selectedDay?.isAvailable) {
            res.status(400).send({
                success: false,
                message: 'No slots availiable'
            });
            return;
        }
        const slotDuration = admin?.availability?.slotDuration || 30;
        //@ts-ignore
        const [startHours, startMinutes] = selectedDay?.startTime.split(':').map(Number);
        //@ts-ignore
        const [endHours, endMinutes] = selectedDay?.endTime.split(':').map(Number);
        let current = startHours * 60 + startMinutes;
        let end = endHours * 60 + endMinutes;
        while (current + slotDuration < end) {
            const startHours = Math.floor(current / 60);
            const startMinutes = current % 60;
            const slotEnd = current + slotDuration;
            const endHours = Math.floor(slotEnd / 60);
            const endMinutes = slotEnd % 60;
            slots.push({
                start: `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`,
                end: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
            });
            current += slotDuration;
        }
        if (!slots || slots.length < 0) {
            res.status(400).send({
                success: false,
                message: 'Slots not found or No Availiable slots.'
            });
            return;
        }
        const bookedSlots = await Email.find({ date: date });
        const filteredSlots = slots.filter((slot) => {
            const isBooked = bookedSlots.some((bookedSlot) => {
                return (bookedSlot.startTime === slot.start &&
                    bookedSlot.endTime === slot.end);
            });
            return !isBooked;
        });
        res.status(200).send({
            success: true,
            message: 'Availiable slots',
            data: filteredSlots
        });
    }
    catch (error) {
        console.error('Error generating availiable slots:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
export const createEmail = async (req, res) => {
    try {
        const { name, email, phone, message, propertyId, date, startTime, endTime } = req.body;
        // Validate required fields
        if (!name || !email) {
            res.status(400).json({
                message: 'All fields are required: name, email, phone, message'
            });
            return;
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                message: 'Please provide a valid email address'
            });
            return;
        }
        // Create new email
        const emailRecord = new Email({
            name,
            email,
            phone,
            message,
            propertyId,
            date,
            startTime,
            endTime,
            status: 'pending'
        });
        await emailRecord.save();
        res.status(201).json({
            success: true,
            message: 'Email inquiry submitted successfully',
            email: {
                id: emailRecord._id,
                name: emailRecord.name,
                email: emailRecord.email,
                status: emailRecord.status
            }
        });
        // Create notification
        try {
            await createNotification('contact', `New email inquiry from ${name}${date ? ` on ${date} at ${startTime}` : ''}`, String(emailRecord._id));
        }
        catch (notifError) {
            console.error('Failed to create notification (non-critical):', notifError);
            // Don't fail the request if notification fails
        }
        // try {
        //   const adminToken = await Admin.findOne({}).select('googleAuthToken')
        //   const result = await createGoogleCalendarEvent({ appointment: emailRecord, refreshToken: adminToken?.googleAuthToken ?? '' })
        // } catch (error) {
        //   console.error('Failed to create event in google calender :', error);
        // }
        try {
            // send to customer
            const customerEmailHtml = customerAppointmentEmail({
                customerName: emailRecord.name,
                appointmentDate: emailRecord.date,
                appointmentTime: `${emailRecord.startTime} - ${emailRecord.endTime}`,
            });
            await sendMail({ to: emailRecord.email, html: customerEmailHtml });
            // send to habibi-properties
            const adminEmail = process.env.adminMailEmail;
            const adminEmailHTML = generateAdminAppointmentEmail({
                customerName: emailRecord.name,
                customerEmail: emailRecord.email,
                customerPhone: emailRecord.phone,
                appointmentDate: emailRecord.date,
                appointmentTime: `${emailRecord.startTime} - ${emailRecord.endTime}`,
                appointmentNotes: emailRecord.message
            });
            await sendMail({ to: adminEmail ?? '', html: adminEmailHTML });
        }
        catch (error) {
            console.error('Failed to send emails :', error);
        }
    }
    catch (error) {
        console.error('Error creating email:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
export const getEmails = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        let filter = {};
        if (status) {
            filter = { status };
        }
        const emails = await Email.find(filter)
            .sort({ createdAt: -1 }).populate([{ path: "propertyId", select: 'title slug' }])
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .lean();
        const total = await Email.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: emails,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            },
            message: "Emails retrieved successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
export const getEmailById = async (req, res) => {
    try {
        const { id } = req.params;
        const email = await Email.findById(id).lean();
        if (!email) {
            res.status(404).json({
                success: false,
                message: 'Email not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: email,
            message: "Email retrieved successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
export const updateEmailStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['pending', 'responded', 'closed'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, responded, or closed'
            });
            return;
        }
        const email = await Email.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
        if (!email) {
            res.status(404).json({
                success: false,
                message: 'Email not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Email status updated successfully',
            data: email
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
export const deleteEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const email = await Email.findByIdAndDelete(id);
        if (!email) {
            res.status(404).json({
                success: false,
                message: 'Email not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Email deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
