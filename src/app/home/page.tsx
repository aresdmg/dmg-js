'use client'

import { Input } from "@/components/ui/input"

export default function HomePage() {
    return (
        <>
            <nav className="w-full h-14 border border-zinc-800/10 flex justify-center items-center space-x-3 px-60 ">
                <div className="w-1/3 h-full flex justify-start items-center" >
                    <p className="uppercase font-lg font-semibold text-primary" >
                        vex
                    </p>
                </div>
                <div className="w-1/3" >
                    <Input className="w-full rounded-sm border-zinc-800/30" placeholder="Search your people" />
                </div>
                <div className="w-1/3" >

                </div>
            </nav>
        </>
    )
}