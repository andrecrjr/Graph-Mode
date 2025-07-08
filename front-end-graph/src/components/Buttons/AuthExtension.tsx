"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { useUserSession } from '../Context/UserSessionContext';
import { toast } from '../hooks/use-toast';

export default function AuthExtension() {
    const [key, setKey] = useState<string>("");
    const { session } = useUserSession();


    useEffect(() => {
        if (session?.user?.tokens?.access_token) {
            const encodedKey = btoa(`${session?.user?.person?.email}:${session?.user?.tokens?.access_token}`);
            setKey(encodedKey);
            localStorage.setItem("graph_mode_key", session?.user?.tokens?.access_token);
            localStorage.setItem("graph_mode_email", session?.user?.person?.email || "");
        }
    }, [session]);

    if (!session) {
        return (
            <section className='flex items-center justify-center w-6/12 gap-4'>
                <p>You are not logged in</p>
            </section>
        )
    }

    const handleCopyKey = () => {
        if (key) {
            navigator.clipboard.writeText(key);
            toast({
                title: "Graph Mode key copied to clipboard",
                description: "You can now use the Graph Mode key in the extension",
                className: "bg-green-700 text-white",
            });
        }
    }


    return (
        <section className='flex items-center justify-center gap-4'>

            <Input className='w-full dark:text-white' type="password" placeholder="Graph Mode key" value={key} readOnly={true} />
            <Button onClick={handleCopyKey}>
                Copy Graph Mode key
            </Button>
        </section>
    )
}
