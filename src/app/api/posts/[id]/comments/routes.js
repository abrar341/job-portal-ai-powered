// app/api/posts/[id]/comments/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Get comments for a post
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const comments = await prisma.comment.findMany({
            where: {
                postId: id
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST - Add a comment to a post
export async function POST(request, { params }) {
    try {
        const { id } = params;
        const { content, authorId } = await request.json();

        if (!content || !authorId) {
            return NextResponse.json(
                { error: 'Content and author ID are required' },
                { status: 400 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                authorId,
                postId: id
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true
                    }
                }
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}

// -----------------------------------