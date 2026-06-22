import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "@shared/models/auth";

export const clerk = clerkMiddleware();

type ClerkUser = Awaited<ReturnType<typeof clerkClient.users.getUser>>;

function getPrimaryEmail(user: ClerkUser): string | null {
  const primaryId = user.primaryEmailAddressId;
  const primary =
    user.emailAddresses.find((email) => email.id === primaryId) ??
    user.emailAddresses[0];
  return primary?.emailAddress ?? null;
}

async function syncClerkUser(userId: string) {
  const clerkUser = await clerkClient.users.getUser(userId);
  const email = getPrimaryEmail(clerkUser);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, clerkUser.id));

  if (existing.length > 0) {
    return;
  }

  await db
    .insert(users)
    .values({
      id: clerkUser.id,
      email,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      profileImageUrl: clerkUser.imageUrl ?? null,
    })
    .onConflictDoNothing();
}

export async function requireAuth(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await syncClerkUser(userId);

    // normalize like earlier code expected
    req.user = { claims: { sub: userId } };
    next();
  } catch (error) {
    console.error("Clerk user sync failed:", error);
    return res.status(500).json({ message: "User sync failed" });
  }
}
