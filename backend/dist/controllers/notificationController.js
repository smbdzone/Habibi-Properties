import Notification from '../models/Notification.js';
// Helper function to create notifications (used by other controllers)
export const createNotification = async (type, message, relatedId) => {
    try {
        const notification = new Notification({
            type,
            message,
            relatedId,
            read: false
        });
        await notification.save();
    }
    catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw - notifications shouldn't break main functionality
    }
};
// Get all notifications
export const getNotifications = async (req, res) => {
    try {
        const { limit = 20, unreadOnly = false } = req.query;
        const query = {};
        if (unreadOnly === 'true') {
            query.read = false;
        }
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean();
        const unreadCount = await Notification.countDocuments({ read: false });
        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount,
            message: "Notifications retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        if (!notification) {
            res.status(404).json({
                success: false,
                message: "Notification not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: notification,
            message: "Notification marked as read"
        });
    }
    catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ read: false }, { read: true });
        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    }
    catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) {
            res.status(404).json({
                success: false,
                message: "Notification not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// Clear all notifications
export const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});
        res.status(200).json({
            success: true,
            message: "All notifications cleared successfully"
        });
    }
    catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
