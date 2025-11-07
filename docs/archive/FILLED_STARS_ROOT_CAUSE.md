# Root Cause: Filled Stars Not Showing for Favorited Properties

## Problem
Properties that appear on the Favorites page don't show filled stars on the Properties page.

## Database Investigation Results

**Favorited Properties (from database):**
1. **237 Ervin Ln** - Property ID: **390706**, Parcel: 00260870026086
2. **Flem Osborne Road** - Property ID: **390719**, Parcel: 07178006  
3. **546 Woodlawn Avenue** - Property ID: **390988**, Parcel: 546 Woodlawn Avenue

## Root Cause Found!

The issue is in `Properties.tsx` line 247:

```typescript
const favoriteIds = useMemo(() => {
  const ids = new Set(myFavorites?.map(p => p.id) || []);
  return ids;
}, [myFavorites]);
```

**The problem:** `myFavorites` is the result of `trpc.favorites.list.useQuery()`, which returns an array of **property objects** (not favorite objects).

Looking at the `favorites.list` tRPC procedure in `server/routers.ts`:

```typescript
list: protectedProcedure.query(async ({ ctx }) => {
  const result = await db.select({
    id: favorites.id,
    property: properties,
    favoritedAt: favorites.createdAt,
  })
  .from(favorites)
  .innerJoin(properties, eq(favorites.propertyId, properties.id))
  .where(eq(favorites.userId, ctx.user.id))
  .orderBy(desc(favorites.createdAt));

  return result.map(r => r.property); // Returns property objects!
});
```

So `myFavorites` contains property objects, and `myFavorites.map(p => p.id)` gets the **property IDs** (390706, 390719, 390988).

This should work! But let me check if the properties list query is returning the same IDs...

## Next Step
Check if `trpc.properties.list.useQuery()` returns properties with matching IDs (390706, 390719, 390988).
