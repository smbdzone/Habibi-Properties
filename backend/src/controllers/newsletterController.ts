import { Request, Response } from 'express';
import Newsletter from '../models/newsletterModel.js';
import { createNotification } from './notificationController.js';

interface SubscribeData {
    email: string;
    source?: string;
}

export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📥 Received newsletter subscription request:', req.body);
        
        const { email, source = 'website' }: SubscribeData = req.body;

        // Validate required fields
        if (!email) {
            console.error('❌ Validation failed: Email is required');
            res.status(400).json({
                success: false,
                message: "Email is required"
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('❌ Validation failed: Invalid email format');
            res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
            return;
        }

        console.log('✅ Validation passed, checking existing subscription...');

        // Check if email already exists
        const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });

        if (existingSubscriber) {
            if (existingSubscriber.status === 'subscribed') {
                console.log('⚠️ Email already subscribed:', email);
                res.status(409).json({
                    success: false,
                    message: "Email is already subscribed to our newsletter"
                });
                return;
            } else {
                // Resubscribe if previously unsubscribed
                console.log('🔄 Resubscribing user:', email);
                existingSubscriber.status = 'subscribed';
                existingSubscriber.unsubscribedAt = undefined;
                existingSubscriber.source = source;
                await existingSubscriber.save();

                console.log('✅ User resubscribed successfully');
                res.status(200).json({
                    success: true,
                    message: "Successfully resubscribed to our newsletter!",
                    data: existingSubscriber
                });
                return;
            }
        }

        // Create new subscription
        console.log('💾 Creating new subscription...');
        const newSubscription = new Newsletter({
            email: email.toLowerCase(),
            source,
            status: 'subscribed'
        });

        await newSubscription.save();
        console.log('✅ Subscription saved successfully with ID:', newSubscription._id);

        // Create notification
        try {
            await createNotification(
              'newsletter',
              `New newsletter subscription: ${email}`,
              String(newSubscription._id)
            );
            console.log('✅ Notification created');
        } catch (notifError) {
            console.error('⚠️ Failed to create notification (non-critical):', notifError);
            // Don't fail the request if notification fails
        }

        res.status(201).json({
            success: true,
            message: "Successfully subscribed to our newsletter!",
            data: newSubscription
        });
        console.log('✅ Response sent successfully');

    } catch (error: any) {
        console.error("❌ Error subscribing to newsletter:", error);
        console.error("Error details:", {
            name: error?.name,
            message: error?.message,
            code: error?.code,
            stack: error?.stack
        });
        
        // Handle duplicate key error (MongoDB unique constraint)
        if (error.code === 11000) {
            res.status(409).json({
                success: false,
                message: "Email is already subscribed to our newsletter"
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to save subscription'
        });
    }
};

export const unsubscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                message: "Email is required"
            });
            return;
        }

        const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

        if (!subscriber) {
            res.status(404).json({
                success: false,
                message: "Email not found in our newsletter list"
            });
            return;
        }

        if (subscriber.status === 'unsubscribed') {
            res.status(200).json({
                success: true,
                message: "Email is already unsubscribed"
            });
            return;
        }

        subscriber.status = 'unsubscribed';
        subscriber.unsubscribedAt = new Date();
        await subscriber.save();

        res.status(200).json({
            success: true,
            message: "Successfully unsubscribed from our newsletter"
        });

    } catch (error: any) {
        console.error("Error unsubscribing from newsletter:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getSubscribers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            status = 'subscribed',
            page = 1, 
            limit = 10 
        } = req.query;

        const subscribers = await Newsletter.find({ status })
            .sort({ subscribedAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        
        const total = await Newsletter.countDocuments({ status });

        res.status(200).json({
            success: true,
            data: subscribers,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalSubscribers: total
            },
            message: "Subscribers retrieved successfully"
        });
    } catch (error: any) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getSubscriberCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalSubscribers = await Newsletter.countDocuments({ status: 'subscribed' });
        
        res.status(200).json({
            success: true,
            data: {
                totalSubscribers
            },
            message: "Subscriber count retrieved successfully"
        });
    } catch (error: any) {
        console.error("Error fetching subscriber count:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getSubscriberById = async (req: Request, res: Response): Promise<void> => {
    try {
        const subscriber = await Newsletter.findById(req.params.id);
        
        if (!subscriber) {
            res.status(404).json({
                success: false,
                message: "Subscriber not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: subscriber,
            message: "Subscriber retrieved successfully"
        });
    } catch (error: any) {
        console.error("Error fetching subscriber:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const deleteSubscriber = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const subscriber = await Newsletter.findByIdAndDelete(id);

        if (!subscriber) {
            res.status(404).json({
                success: false,
                message: "Subscriber not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Subscriber deleted successfully"
        });
    } catch (error: any) {
        console.error("Error deleting subscriber:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};