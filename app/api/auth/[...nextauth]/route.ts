import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(
        { message: "NextAuth has been removed. Use Supabase auth instead." },
        { status: 410 }
    );
}

export async function POST() {
    return NextResponse.json(
        { message: "NextAuth has been removed. Use Supabase auth instead." },
        { status: 410 }
    );
}
