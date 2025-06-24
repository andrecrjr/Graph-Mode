import { auth } from '@/components/Auth';
import { Button } from '@/ui/button'
import AuthExtension from '@/components/Buttons/AuthExtension';
import Link from 'next/link'
import React from 'react'
import AuthButton from '@/components/Buttons';
import { BGParticle } from '@/components/Home/BgParticle';
import { DownloadIcon } from 'lucide-react';

export default async function ExtensionPage() {
    const data = await auth();

    if (!data) {
        return (
            <section className='min-h-screen'>
                <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900'>
                    <div className='container mx-auto px-6 py-20'>
                        <BGParticle />
                        <div className='max-w-4xl mx-auto text-center'>
                            <div className='mb-12'>
                                <h1 className='text-5xl md:text-6xl font-bold text-white mb-6 leading-tight'>
                                    Transform Your Browsing Into
                                    <span className='text-blue-400 block'>Knowledge Graphs</span>
                                </h1>
                                <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed'>
                                    Graph Mode extension captures your Notion pages and creates interactive knowledge graphs.
                                </p>
                            </div>

                            {/* CTA Section */}
                            <div className='mb-16'>
                                <div className='bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700'>
                                    <div className='mb-6'>
                                        <h2 className='text-2xl font-semibold text-white mb-3'>
                                            Ready to get started?
                                        </h2>
                                        <p className='text-gray-400'>
                                            You'll need to sign in first to access your personalized graph experience.
                                        </p>
                                    </div>
                                    <AuthButton className='w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg' callbackUrl='/extension#downloaded' />
                                </div>
                            </div>

                            {/* Features Preview */}
                            <div className='grid md:grid-cols-3 gap-8 text-left'>
                                <div className='bg-gray-800/30 rounded-xl p-6 border border-gray-700'>
                                    <div className='w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4'>
                                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className='text-lg font-semibold text-white mb-2'>Auto-Capture</h3>
                                    <p className='text-gray-400'>Automatically captures your browsing patterns and creates connections between related content.</p>
                                </div>
                                <div className='bg-gray-800/30 rounded-xl p-6 border border-gray-700'>
                                    <div className='w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4'>
                                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className='text-lg font-semibold text-white mb-2'>Visual Insights</h3>
                                    <p className='text-gray-400'>Transform your browsing data into beautiful, interactive visual graphs that reveal hidden patterns.</p>
                                </div>
                                <div className='bg-gray-800/30 rounded-xl p-6 border border-gray-700'>
                                    <div className='w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4'>
                                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <h3 className='text-lg font-semibold text-white mb-2'>Smart Connections</h3>
                                    <p className='text-gray-400'>Discover unexpected relationships between your interests and research topics.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <>
            <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900'>
                <BGParticle />
                <div className='container mx-auto px-6 py-20'>
                    <div className='max-w-4xl mx-auto text-center' id='downloaded'>
                        {/* Welcome Back Section */}
                        <div className='mb-12'>
                            <h1 className='text-5xl md:text-6xl font-bold text-white mb-6 leading-tight'>
                                You're Almost Ready to
                                <span className='text-blue-400 block'>Start Graph Mode!</span>
                            </h1>
                            <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed'>
                                Get your personal authentication key and install the browser extension to begin creating your knowledge graphs.
                            </p>
                        </div>

                        {/* Auth Key Section */}
                        <div className='mb-12'>
                            <div className='bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700'>
                                <div className='mb-6'>
                                    <h2 className='text-2xl font-semibold text-white mb-3'>
                                        Step 1: Get Your Authentication Key
                                    </h2>
                                    <p className='text-gray-400 mb-6'>
                                        Copy this key and paste it into the Graph Mode extension after installation.
                                    </p>
                                </div>
                                <AuthExtension />
                            </div>
                        </div>

                        {/* Download CTA */}
                        <div className='mb-16'>
                            <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white'>
                                <h2 className='text-3xl font-bold mb-4'>
                                    Step 2: Install the Extension
                                </h2>
                                <p className='text-blue-100 mb-6 text-lg'>
                                    Download and install the Graph Mode browser extension to start capturing your browsing patterns.
                                </p>
                                <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                                    <Button size="lg" className='bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg'>
                                        <Link href="/extension/downloaded" className='flex items-center gap-2'>
                                            <DownloadIcon className='w-5 h-5' />
                                            Download Extension
                                        </Link>
                                    </Button>
                                    <p className='text-sm text-blue-100'>
                                        Compatible with Chrome, Firefox, and Edge
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className='grid md:grid-cols-3 gap-6 text-left'>
                            <div className='bg-gray-800/30 rounded-xl p-6 border border-gray-700'>
                                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-4 text-white font-bold'>1</div>
                                <h3 className='text-lg font-semibold text-white mb-2'>Copy Your Key</h3>
                                <p className='text-gray-400 text-sm'>Use the authentication key above to connect the extension to your account.</p>
                            </div>
                            <div className='bg-gray-800/30 rounded-xl p-6 border border-gray-700'>
                                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-4 text-white font-bold'>2</div>
                                <h3 className='text-lg font-semibold text-white mb-2'>Install Extension</h3>
                                <p className='text-gray-400 text-sm'>Download and install the Graph Mode extension from your browser's store.</p>
                            </div>
                            <div className='bg-gray-800/30 rounded-xl p-6 border border-gray-700'>
                                <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-4 text-white font-bold'>3</div>
                                <h3 className='text-lg font-semibold text-white mb-2'>Start Browsing</h3>
                                <p className='text-gray-400 text-sm'>Begin browsing normally and watch your knowledge graph grow automatically.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
