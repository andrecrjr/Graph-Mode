import { Button } from '@/ui/button'
import Link from 'next/link'
import React from 'react'
import { BGParticle } from '@/components/Home/BgParticle';
import { DownloadIcon } from 'lucide-react';

export default async function ExtensionPage() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900'>
            <div className='container mx-auto px-6 py-20'>
                <div className='max-w-4xl mx-auto text-center'>
                    <div className='mb-12'>
                        <h1 className='text-5xl md:text-6xl font-bold text-white mb-6 leading-tight'>
                            Graph Mode
                            <span className='text-blue-400 block'>Project Ended</span>
                        </h1>
                        <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed'>
                            After 1 year of development and learning, this project has come to an end.
                            It was a valuable journey that taught us many new things and helped us grow as developers.
                        </p>
                    </div>

                    {/* Project Status Section */}
                    <div className='mb-16'>
                        <div className='bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700'>
                            <div className='mb-6'>
                                <h2 className='text-2xl font-semibold text-white mb-3'>
                                    Thank You for Your Support
                                </h2>
                                <p className='text-gray-400 mb-6'>
                                    We're now moving on to new projects and opportunities. Thank you to everyone
                                    who supported and contributed to Graph Mode during its development.
                                </p>
                                <p className='text-gray-300'>
                                    You can explore our other projects and work on our portfolio.
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                                <Link href="https://www.ac-jr.com/" target="_blank" rel="noopener noreferrer">
                                    <Button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg'>
                                        Visit Portfolio
                                    </Button>
                                </Link>
                                <Link href="https://ko-fi.com/andrecrjr" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg text-white">
                                        Follow on Ko-fi for future projects
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* GitHub Repository */}
                    <div className='mb-16'>
                        <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white'>
                            <h2 className='text-3xl font-bold mb-4'>
                                View the GitHub Repository
                            </h2>
                            <p className='text-blue-100 mb-6 text-lg'>
                                The source code is available on GitHub for educational purposes.
                            </p>
                            <div className='flex justify-center'>
                                <Link
                                    href="https://github.com/andrecrjr/graph-mode"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg text-lg font-semibold"
                                >
                                    <DownloadIcon className='w-5 h-5' />
                                    View on GitHub
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Project Features Preview */}
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
    )
}
