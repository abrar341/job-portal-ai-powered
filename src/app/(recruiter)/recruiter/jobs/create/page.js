"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import JobCreateForm from "@/components/JobCreateForm";

export default function RecruiterJobPostPage() {
    const [recruiterId, setRecruiterId] = useState(null);
    const { data: session, status } = useSession();
    console.log("session", session?.user?.id);

    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // Still loading

        if (!session) {
            router.push("/login");
            return;
        }

        if (session.user.role !== "RECRUITER") {
            router.push("/"); // Redirect if not a recruiter
            return;
        }

        // Set the recruiter ID from session
        setRecruiterId(session.user.id);
    }, [session, status, router]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session || session.user.role !== "RECRUITER") {
        return null; // Will redirect
    }

    return (
        <main className="">
            {recruiterId && <JobCreateForm recruiterId={recruiterId} />
            }
        </main >
    );
}
