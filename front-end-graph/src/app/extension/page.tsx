import { auth } from '@/components/Auth';
import { Button } from '@/ui/button'
import AuthExtension from '@/components/Buttons/AuthExtension';
import Link from 'next/link'
import React from 'react'

export default async function ExtensionPage() {
    const data = await auth();

    if (!data) {
        return (
            <section className='flex flex-col items-center justify-center h-screen text-gray-100'>
                <h1 className='text-4xl font-bold'>
                    Authentication is required to use the extension.
                </h1>
                <Button>
                    <Link href="/app">
                        Login
                    </Link>
                </Button>
            </section>
        )
    }
    return (
        <>
            <section className='flex flex-col items-center justify-center h-[85vh] text-gray-100'>
                <h1 className='text-4xl font-bold'>
                    Welcome to Graph Mode now to start using the extension!
                </h1>
                <p>Get your Graph Mode key below and paste it in the extension.</p>
                <AuthExtension />
            </section>
        </>
    )
}
