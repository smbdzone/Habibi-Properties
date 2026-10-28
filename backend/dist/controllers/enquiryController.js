import Enquiry from '../models/enquiryModel.js';
import { createNotification } from './notificationController.js';
export const createEnquiry = async (req, res) => {
    try {
        console.log('📥 Received enquiry request:', req.body);
        const { fullName, lastName, email, phoneNumber, country, countryCode, budget, propertyType } = req.body;
        // Validate required fields
        if (!fullName || !email || !phoneNumber) {
            console.error('❌ Validation failed: Missing required fields');
            res.status(400).json({
                success: false,
                message: "First name, email, and phone number are required"
            });
            return;
        }
        // Validate model-required fields
        if (!country || !countryCode || !budget) {
            console.error('❌ Validation failed: Missing model-required fields');
            res.status(400).json({
                success: false,
                message: "Country, country code, budget, and property type are required"
            });
            return;
        }
        console.log('✅ Validation passed, creating enquiry...');
        // Create new enquiry
        const newEnquiry = new Enquiry({
            firstName: fullName,
            lastName,
            email,
            phoneNumber,
            country,
            countryCode,
            budget,
            propertyType
        });
        console.log('💾 Saving enquiry to database...');
        await newEnquiry.save();
        console.log('✅ Enquiry saved successfully with ID:', newEnquiry._id);
        // Create notification
        try {
            await createNotification('enquiry', `New enquiry from ${fullName}${lastName ? ' ' + lastName : ''} for ${propertyType} (Budget: ${budget})`, String(newEnquiry._id));
            console.log('✅ Notification created');
        }
        catch (notifError) {
            console.error('⚠️ Failed to create notification (non-critical):', notifError);
            // Don't fail the request if notification fails
        }
        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully",
            data: newEnquiry
        });
        console.log('✅ Response sent successfully');
    }
    catch (error) {
        console.error("❌ Error creating enquiry:", error);
        console.error("Error details:", {
            name: error?.name,
            message: error?.message,
            code: error?.code,
            stack: error?.stack
        });
        // Check if it's a validation error
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to save enquiry'
        });
    }
};
export const getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: enquiries,
            message: "Enquiries retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching enquiries:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const getEnquiryById = async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) {
            res.status(404).json({
                success: false,
                message: "Enquiry not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: enquiry,
            message: "Enquiry retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching enquiry:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const enquiry = await Enquiry.findByIdAndDelete(id);
        if (!enquiry) {
            res.status(404).json({
                success: false,
                message: "Enquiry not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Enquiry deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting enquiry:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
