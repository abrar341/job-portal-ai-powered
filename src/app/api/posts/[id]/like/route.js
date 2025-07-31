// app/api/posts/[id]/like/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// POST - Like/Unlike a post
export async function POST(request, { params }) {
    try {
        const { id } = params;
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check if user already liked the post
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId: id
                }
            }
        });

        if (existingLike) {
            // Unlike the post
            await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like the post
            await prisma.like.create({
                data: {
                    userId,
                    postId: id
                }
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json(
            { error: 'Failed to toggle like' },
            { status: 500 }
        );
    }
}

// -----------------------------------