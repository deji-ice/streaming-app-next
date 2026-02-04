import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getAuthSession() {
    return await getServerSession(authOptions);
}

export async function requireAuth() {
    const session = await getAuthSession();

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    return session;
}
