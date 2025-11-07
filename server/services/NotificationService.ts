import { getDb } from "../db";
import { properties, notificationPreferences, notificationHistory } from "../../drizzle/schema";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export class NotificationService {
  /**
   * Check for new properties and send notifications to users with matching preferences
   * @param newPropertyIds Array of property IDs that were just added
   */
  static async notifyNewProperties(newPropertyIds: number[]) {
    if (newPropertyIds.length === 0) return;

    const db = await getDb();
    if (!db) return;

    try {
      // Get all users with notification preferences
      const prefs = await db.select().from(notificationPreferences);

      for (const pref of prefs) {
        // Get new properties that match this user's preferences
        const matchingProperties = await this.getMatchingProperties(newPropertyIds, pref);

        if (matchingProperties.length > 0) {
          // Send notifications based on user preferences
          if (pref.emailEnabled) {
            await this.sendEmailNotification(pref.userId, matchingProperties);
          }

          if (pref.inAppEnabled) {
            await this.sendInAppNotification(pref.userId, matchingProperties);
          }
        }
      }
    } catch (error) {
      console.error("[NotificationService] Error sending notifications:", error);
    }
  }

  /**
   * Get properties that match user's notification preferences
   */
  private static async getMatchingProperties(propertyIds: number[], pref: any) {
    const db = await getDb();
    if (!db) return [];

    try {
      let query = db
        .select()
        .from(properties)
        .where(inArray(properties.id, propertyIds));

      // Filter by counties if specified
      if (pref.counties) {
        const counties = JSON.parse(pref.counties);
        if (counties.length > 0) {
          query = query.where(inArray(properties.county, counties)) as any;
        }
      }

      // Filter by bid range if specified
      const results = await query;
      return results.filter((prop) => {
        if (pref.minBid && prop.openingBid && prop.openingBid < pref.minBid) {
          return false;
        }
        if (pref.maxBid && prop.openingBid && prop.openingBid > pref.maxBid) {
          return false;
        }
        return true;
      });
    } catch (error) {
      console.error("[NotificationService] Error getting matching properties:", error);
      return [];
    }
  }

  /**
   * Send email notification to user
   */
  private static async sendEmailNotification(userId: number, properties: any[]) {
    const db = await getDb();
    if (!db) return;

    try {
      // Format property list for email
      const propertyList = properties
        .map(
          (p) =>
            `- ${p.address || "Address not available"} (${p.county}) - $${p.openingBid?.toLocaleString() || "N/A"}`
        )
        .join("\n");

      const message = `New tax deed properties matching your preferences:\n\n${propertyList}\n\nLog in to view full details.`;

      // Send notification to owner (you can extend this to send to individual users)
      await notifyOwner({
        title: `${properties.length} New Properties Available`,
        content: message,
      });

      // Record notification history
      for (const prop of properties) {
        await db.insert(notificationHistory).values({
          userId,
          propertyId: prop.id,
          type: "email",
          status: "sent",
        });
      }
    } catch (error) {
      console.error("[NotificationService] Error sending email:", error);
    }
  }

  /**
   * Send in-app notification (stored in history for display)
   */
  private static async sendInAppNotification(userId: number, properties: any[]) {
    const db = await getDb();
    if (!db) return;

    try {
      // Record in-app notifications in history
      for (const prop of properties) {
        await db.insert(notificationHistory).values({
          userId,
          propertyId: prop.id,
          type: "in_app",
          status: "sent",
        });
      }
    } catch (error) {
      console.error("[NotificationService] Error sending in-app notification:", error);
    }
  }

  /**
   * Get unread in-app notifications for a user
   */
  static async getUnreadNotifications(userId: number) {
    const db = await getDb();
    if (!db) return [];

    try {
      const notifications = await db
        .select({
          id: notificationHistory.id,
          propertyId: notificationHistory.propertyId,
          sentAt: notificationHistory.sentAt,
          address: properties.address,
          county: properties.county,
          openingBid: properties.openingBid,
        })
        .from(notificationHistory)
        .leftJoin(properties, eq(notificationHistory.propertyId, properties.id))
        .where(
          and(
            eq(notificationHistory.userId, userId),
            eq(notificationHistory.type, "in_app"),
            eq(notificationHistory.status, "sent")
          )
        )
        .orderBy(sql`${notificationHistory.sentAt} DESC`)
        .limit(50);

      return notifications;
    } catch (error) {
      console.error("[NotificationService] Error getting unread notifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number) {
    const db = await getDb();
    if (!db) return;

    try {
      await db
        .update(notificationHistory)
        .set({ status: "read", readAt: new Date() })
        .where(eq(notificationHistory.id, notificationId));
    } catch (error) {
      console.error("[NotificationService] Error marking notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number) {
    const db = await getDb();
    if (!db) return;

    try {
      await db
        .update(notificationHistory)
        .set({ status: "read", readAt: new Date() })
        .where(and(eq(notificationHistory.userId, userId), eq(notificationHistory.status, "sent")));
    } catch (error) {
      console.error("[NotificationService] Error marking all as read:", error);
    }
  }
}
