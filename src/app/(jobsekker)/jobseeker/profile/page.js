import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileViewer from "@/components/ProfileViewer";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect("/login");
    }

    // Fetch user profile directly in the server component
    let user = null;
    try {
        user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                skills: true, // Include skills if you have a relation
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <p className="text-red-600">Error loading profile. Please try again.</p>
            </div>
        );
    }

    return <ProfileViewer user={user} />;
}