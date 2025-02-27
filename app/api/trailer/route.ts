import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    console.log(searchParams)
    return NextResponse.json({ message: searchParams });
}

