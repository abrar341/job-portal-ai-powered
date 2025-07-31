import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Return all useful fields (except password)
        return NextResponse.json(
            {
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    headline: user.headline,
                    bio: user.bio,
                    location: user.location,
                    phone: user.phone,
                    skills: user.skills,
                    resume: user.resume,
                    profileImage: user.profileImage,
                    experience: user.experience,
                    education: user.education,
                    companyName: user.companyName,
                    companyWebsite: user.companyWebsite,
                    designation: user.designation,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
