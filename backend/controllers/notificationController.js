import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

// Helper to create notification for a specific user
export const createNotification = async (userId, senderId, type, title, message, link = '') => {
    try {
        // Prevent users from notifying themselves
        if (userId.toString() === senderId?.toString()) {
            return null;
        }

        const notification = new Notification({
            userId,
            senderId,
            type,
            title,
            message,
            link
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error.message);
        return null;
    }
};

// Helper to notify all users except the sender
export const notifyAllUsers = async (senderId, type, title, message, link = '') => {
    try {
        const users = await User.find({ _id: { $ne: senderId } }).select("_id");
        const notifications = users.map(u => ({
            userId: u._id,
            senderId,
            type,
            title,
            message,
            link
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    } catch (error) {
        console.error("Failed to notify all users:", error.message);
    }
};

// Endpoint: GET /user/notifications
export const getUserNotifications = async (req, res) => {
    const token = req.query.token || req.body.token || req.headers['x-auth-token'];
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const notifications = await Notification.find({ userId: user._id })
            .populate('senderId', 'name username profilePicture')
            .sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

        return res.json({ notifications, unreadCount });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Endpoint: POST /user/notifications/read
export const markNotificationsAsRead = async (req, res) => {
    const token = req.body.token || req.headers['x-auth-token'];
    const { notificationId } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (notificationId) {
            await Notification.updateOne({ _id: notificationId, userId: user._id }, { isRead: true });
        } else {
            await Notification.updateMany({ userId: user._id, isRead: false }, { isRead: true });
        }

        return res.json({ message: "Notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
