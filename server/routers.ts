import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  stats: router({
    overview: publicProcedure.query(async () => {
      const { getDb } = await import('./db');
      const { properties } = await import('../drizzle/schema');
      const { sql } = await import('drizzle-orm');
      
      const db = await getDb();
      if (!db) {
        return {
          totalProperties: 0,
          countiesWithData: 0,
          countiesCovered: 82,
          totalCounties: 100,
        };
      }
      
      const result = await db
        .select({
          totalProperties: sql<number>`COUNT(*)`,
          countiesWithData: sql<number>`COUNT(DISTINCT county)`,
        })
        .from(properties)
        .where(sql`isActive = 1`);
      
      return {
        totalProperties: result[0]?.totalProperties || 0,
        countiesWithData: result[0]?.countiesWithData || 0,
        countiesCovered: 82,
        totalCounties: 100,
      };
    }),
    
    countyBreakdown: publicProcedure.query(async () => {
      const { getDb } = await import('./db');
      const { properties } = await import('../drizzle/schema');
      const { sql } = await import('drizzle-orm');
      
      const db = await getDb();
      if (!db) return [];
      
      const result = await db
        .select({
          county: properties.county,
          count: sql<number>`COUNT(*)`,
          totalBidAmount: sql<number>`SUM(COALESCE(openingBid, 0)) / 100`,
        })
        .from(properties)
        .where(sql`isActive = 1`)
        .groupBy(properties.county)
        .orderBy(sql`COUNT(*) DESC`);
      
      return result;
    }),
    
    statusDistribution: publicProcedure.query(async () => {
      const { getDb } = await import('./db');
      const { properties } = await import('../drizzle/schema');
      const { sql } = await import('drizzle-orm');
      
      const db = await getDb();
      if (!db) return [];
      
      const result = await db
        .select({
          status: properties.saleStatus,
          count: sql<number>`COUNT(*)`,
        })
        .from(properties)
        .where(sql`isActive = 1`)
        .groupBy(properties.saleStatus);
      
      return result;
    }),
    
    upcomingSales: publicProcedure
      .input(z.object({
        days: z.number().optional().default(30),
      }).optional())
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { properties } = await import('../drizzle/schema');
        const { sql, and, gte, lte } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) return [];
        
        const days = input?.days || 30;
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        const result = await db
          .select()
          .from(properties)
          .where(
            and(
              sql`isActive = 1`,
              gte(properties.saleDate, today),
              lte(properties.saleDate, futureDate)
            )
          )
          .orderBy(properties.saleDate);
        
        return result;
      }),
  }),

  properties: router({
    list: publicProcedure
      .input(z.object({
        county: z.string().optional(),
        saleStatus: z.enum(["scheduled", "in_upset_period", "sold", "cancelled"]).optional(),
        propertyType: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getProperties } = await import('./db');
        return await getProperties(input);
      }),
    
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { getPropertyById } = await import('./db');
        return await getPropertyById(input);
      }),
    
    fetchNotice: publicProcedure
      .input(z.object({
        propertyId: z.number(),
        parcelId: z.string(),
        county: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { fetchZLSNotice } = await import('../scrapers/zls_notice_fetcher');
        const { updatePropertyNotice } = await import('./db');
        
        // Fetch notice from ZLS website
        const result = await fetchZLSNotice(input.parcelId, input.county);
        
        if (result.success && result.details) {
          // Save notice details to database
          await updatePropertyNotice(input.propertyId, result.details);
          
          return {
            success: true,
            details: result.details,
          };
        } else {
          return {
            success: false,
            error: result.error || 'Failed to fetch notice',
          };
        }
      }),
    
    setRating: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
        rating: z.enum(["good", "bad", "watching"]).nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import('./db');
        const { properties } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }
        
        await db
          .update(properties)
          .set({
            teamRating: input.rating,
            ratedBy: input.rating ? ctx.user.id : null,
            ratedAt: input.rating ? new Date() : null,
          })
          .where(eq(properties.id, input.propertyId));
        
        return { success: true };
      }),
  }),

  counties: router({
    list: publicProcedure.query(async () => {
      const { getAllCounties } = await import('./db');
      return await getAllCounties();
    }),
    
    // Temporary endpoint to get counties from properties table
    listFromProperties: publicProcedure.query(async () => {
      const { getDb } = await import('./db');
      const { properties } = await import('../drizzle/schema');
      const { sql } = await import('drizzle-orm');
      
      const db = await getDb();
      if (!db) return [];
      
      const result = await db.selectDistinct({ county: properties.county })
        .from(properties)
        .where(sql`county IS NOT NULL AND county != ''`)
        .orderBy(properties.county);
      
      return result.map(r => r.county);
    }),
  }),

  geocoding: router({
    geocodeProperty: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { GeocodingService } = await import('./services/GeocodingService');
        const service = new GeocodingService();
        return await service.geocodeProperty(input);
      }),
    
    geocodeAll: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(100),
      }).optional())
      .mutation(async ({ input }) => {
        const { GeocodingService } = await import('./services/GeocodingService');
        const service = new GeocodingService();
        return await service.geocodeAllProperties(input?.limit);
      }),
  }),

  savedSearches: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        filters: z.string(), // JSON string
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { savedSearches } = await import('../drizzle/schema');
        const db = await getDb();
        if (!db || !ctx.user) throw new Error('Database or user not available');
        
        const result = await db.insert(savedSearches).values({
          userId: ctx.user.id,
          name: input.name,
          filters: input.filters,
        });
        return { success: true, id: result[0].insertId };
      }),
    
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const { getDb } = await import('./db');
        const { savedSearches } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const db = await getDb();
        if (!db || !ctx.user) return [];
        
        return await db.select().from(savedSearches).where(eq(savedSearches.userId, ctx.user.id));
      }),
    
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { savedSearches } = await import('../drizzle/schema');
        const { eq, and } = await import('drizzle-orm');
        const db = await getDb();
        if (!db || !ctx.user) throw new Error('Database or user not available');
        
        await db.delete(savedSearches).where(
          and(
            eq(savedSearches.id, input),
            eq(savedSearches.userId, ctx.user.id)
          )
        );
        return { success: true };
      }),
  }),

  favorites: router({
    add: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { favorites } = await import('../drizzle/schema');
        const db = await getDb();
        if (!db || !ctx.user) throw new Error('Database or user not available');
        
        await db.insert(favorites).values({
          userId: ctx.user.id,
          propertyId: input,
        });
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { favorites } = await import('../drizzle/schema');
        const { eq, and } = await import('drizzle-orm');
        const db = await getDb();
        if (!db || !ctx.user) throw new Error('Database or user not available');
        
        await db.delete(favorites).where(
          and(
            eq(favorites.propertyId, input),
            eq(favorites.userId, ctx.user.id)
          )
        );
        return { success: true };
      }),
    
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const { getDb } = await import('./db');
        const { favorites, properties } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const db = await getDb();
        if (!db || !ctx.user) return [];
        
        // Join favorites with properties to get full property details
        const result = await db
          .select({
            favoriteId: favorites.id,
            property: properties,
          })
          .from(favorites)
          .innerJoin(properties, eq(favorites.propertyId, properties.id))
          .where(eq(favorites.userId, ctx.user.id));
        
        return result.map(r => r.property);
      }),
    
    teamList: protectedProcedure
      .query(async ({ ctx }) => {
        const { getDb } = await import('./db');
        const { favorites, properties, users } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const db = await getDb();
        if (!db || !ctx.user) return [];
        
        // Join favorites with properties and users to get full details with user attribution
        const result = await db
          .select({
            favoriteId: favorites.id,
            property: properties,
            favoritedBy: users.name,
            favoritedAt: favorites.createdAt,
          })
          .from(favorites)
          .innerJoin(properties, eq(favorites.propertyId, properties.id))
          .innerJoin(users, eq(favorites.userId, users.id));
        
        return result;
      }),
    
    check: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { favorites } = await import('../drizzle/schema');
        const { eq, and } = await import('drizzle-orm');
        const db = await getDb();
        if (!db || !ctx.user) return { isFavorite: false };
        
        const result = await db.select().from(favorites).where(
          and(
            eq(favorites.propertyId, input),
            eq(favorites.userId, ctx.user.id)
          )
        ).limit(1);
        
        return { isFavorite: result.length > 0 };
      }),
  }),

  notifications: router({
    // Get user's notification preferences
    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        const { getDb } = await import('./db');
        const { notificationPreferences } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const db = await getDb();
        if (!db || !ctx.user) return null;
        
        const result = await db.select().from(notificationPreferences)
          .where(eq(notificationPreferences.userId, ctx.user.id))
          .limit(1);
        
        return result[0] || null;
      }),
    
    // Update notification preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        counties: z.string().optional(),
        minBid: z.number().optional(),
        maxBid: z.number().optional(),
        emailEnabled: z.boolean(),
        inAppEnabled: z.boolean(),
        frequency: z.enum(['immediate', 'daily']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { notificationPreferences } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const db = await getDb();
        if (!db || !ctx.user) throw new Error('Database or user not available');
        
        // Check if preferences exist
        const existing = await db.select().from(notificationPreferences)
          .where(eq(notificationPreferences.userId, ctx.user.id))
          .limit(1);
        
        const data = {
          userId: ctx.user.id,
          counties: input.counties,
          minBid: input.minBid,
          maxBid: input.maxBid,
          emailEnabled: input.emailEnabled ? 1 : 0,
          inAppEnabled: input.inAppEnabled ? 1 : 0,
          frequency: input.frequency,
        };
        
        if (existing.length > 0) {
          await db.update(notificationPreferences)
            .set(data)
            .where(eq(notificationPreferences.userId, ctx.user.id));
        } else {
          await db.insert(notificationPreferences).values(data);
        }
        
        return { success: true };
      }),
    
    // Get unread notifications
    getUnread: protectedProcedure
      .query(async ({ ctx }) => {
        const { NotificationService } = await import('./services/NotificationService');
        if (!ctx.user) return [];
        return await NotificationService.getUnreadNotifications(ctx.user.id);
      }),
    
    // Mark notification as read
    markAsRead: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { NotificationService } = await import('./services/NotificationService');
        await NotificationService.markAsRead(input);
        return { success: true };
      }),
    
    // Mark all as read
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { NotificationService } = await import('./services/NotificationService');
        if (!ctx.user) throw new Error('User not available');
        await NotificationService.markAllAsRead(ctx.user.id);
        return { success: true };
      }),
  }),

  preferences: router({
    // Get user preferences
    get: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserPreferences } = await import('./db');
        if (!ctx.user) throw new Error('User not available');
        const prefs = await getUserPreferences(ctx.user.id);
        // Return empty object if no preferences exist
        return prefs || {};
      }),
    
    // Save user preferences
    save: protectedProcedure
      .input(z.object({
        defaultCountyFilter: z.string().optional(),
        defaultStatusFilter: z.string().optional(),
        defaultMinBid: z.string().optional(),
        defaultMaxBid: z.string().optional(),
        defaultStartDate: z.string().optional(),
        defaultEndDate: z.string().optional(),
        defaultSortColumn: z.string().optional(),
        defaultSortDirection: z.enum(['asc', 'desc']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { upsertUserPreferences } = await import('./db');
        if (!ctx.user) throw new Error('User not available');
        
        await upsertUserPreferences({
          userId: ctx.user.id,
          ...input,
        });
        
        return { success: true };
      }),
    
    // Reset to defaults (delete preferences)
    reset: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { getDb } = await import('./db');
        const { userPreferences } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        if (!ctx.user) throw new Error('User not available');
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.delete(userPreferences).where(eq(userPreferences.userId, ctx.user.id));
        
        return { success: true };
      }),
  }),

  scraper: router({
    runScraper: protectedProcedure
      .input(z.object({
        scraperName: z.enum(['kania', 'hutchens', 'wake_county', 'rbcwb', 'forsyth', 'gaston', 'alamance', 'catawba', 'cabarrus', 'rutherford', 'edgecombe', 'hoke', 'yadkin', 'anson', 'bladen', 'cumberland', 'mcdowell', 'zls', 'all'])
      }))
      .mutation(async ({ input }) => {
        const { ScraperService } = await import('./scraperService');
        const service = new ScraperService();
        return await service.runScraper(input.scraperName);
      }),
    
    history: publicProcedure
      .input(z.number().optional())
      .query(async ({ input }) => {
        const { getRecentScrapeHistory } = await import('./db');
        return await getRecentScrapeHistory(input || 50);
      }),
  }),

  // Access management router
  access: router({
    getAllowedUsers: protectedProcedure.query(async () => {
      const { getAllowedUsers } = await import('./db');
      return await getAllowedUsers();
    }),

    addUser: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'user']).default('user'),
      }))
      .mutation(async ({ input, ctx }) => {
        const { addAllowedUser } = await import('./db');
        await addAllowedUser({
          email: input.email,
          role: input.role,
          addedBy: ctx.user?.email || 'unknown',
        });
        return { success: true };
      }),

    removeUser: protectedProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { removeAllowedUser } = await import('./db');
        await removeAllowedUser(input.email);
        return { success: true };
      }),
  }),

  // Property collaboration - check-out and notes
  propertyCollaboration: router({
    checkOut: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { properties } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.update(properties)
          .set({
            checkedOutBy: ctx.user!.id,
            checkedOutAt: new Date(),
          })
          .where(eq(properties.id, input.propertyId));
        
        return { success: true };
      }),

    release: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const { properties } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.update(properties)
          .set({
            checkedOutBy: null,
            checkedOutAt: null,
          })
          .where(eq(properties.id, input.propertyId));
        
        return { success: true };
      }),

    addNote: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
        note: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { propertyNotes } = await import('../drizzle/schema');
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.insert(propertyNotes).values({
          propertyId: input.propertyId,
          userId: ctx.user!.id,
          note: input.note,
        });
        
        return { success: true };
      }),

    getNotes: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
      }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { propertyNotes, users } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) return [];
        
        const notes = await db
          .select({
            id: propertyNotes.id,
            note: propertyNotes.note,
            createdAt: propertyNotes.createdAt,
            updatedAt: propertyNotes.updatedAt,
            userName: users.name,
            userEmail: users.email,
          })
          .from(propertyNotes)
          .leftJoin(users, eq(propertyNotes.userId, users.id))
          .where(eq(propertyNotes.propertyId, input.propertyId))
          .orderBy(propertyNotes.createdAt);
        
        return notes;
      }),

    deleteNote: protectedProcedure
      .input(z.object({
        noteId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { propertyNotes } = await import('../drizzle/schema');
        const { eq, and } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Only allow users to delete their own notes
        await db.delete(propertyNotes)
          .where(and(
            eq(propertyNotes.id, input.noteId),
            eq(propertyNotes.userId, ctx.user!.id)
          ));
        
        return { success: true };
      }),

    setARV: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
        arv: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { properties } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.update(properties)
          .set({
            arv: input.arv,
            arvAddedBy: ctx.user!.id,
            arvAddedAt: new Date(),
          })
          .where(eq(properties.id, input.propertyId));
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
