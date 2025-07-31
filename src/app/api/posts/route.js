// app/api/posts/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all posts for feed
export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        headline: true,
                        profileImage: true
                    }
                },
                likes: {
                    select: {
                        id: true,
                        userId: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}

// POST - Create a new post
export async function POST(request) {
    try {
        const { content, imageUrl, authorId } = await request.json();

        if (!content || !authorId) {
            return NextResponse.json(
                { error: 'Content and author ID are required' },
                { status: 400 }
            );
        }

        const post = await prisma.post.create({
            data: {
                content,
                imageUrl,
                authorId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        headline: true,
                        profileImage: true
                    }
                },
                likes: {
                    select: {
                        id: true,
                        userId: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}

