import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { skills: true, applications: true },
    });

    return NextResponse.json(user);
}

export async function PUT(req) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let {
        firstName,
        lastName,
        headline,
        bio,
        location,
        phone,
        experience,
        education,
        skills,
    } = body;

    // ✨ Convert skills string to array if needed
    if (typeof skills === "string") {
        skills = skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!existingUser) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
            firstName,
            lastName,
            headline,
            bio,
            location,
            phone,
            experience,
            education,
            skills: {
                deleteMany: {}, // remove old skills
                create: skills.map((name) => ({ name })),
            },
        },
        include: { skills: true },
    });

    return NextResponse.json(updatedUser);
}

