'use client'

import { trpc } from "@/components/provider"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
    const { data, isLoading } = trpc.user.me.useQuery()

    return (
        <>
            <nav className="w-full h-14 border border-zinc-800/10 flex justify-center items-center space-x-3 px-60 ">
                <div className="w-1/3 h-full flex justify-start items-center" >
                    <p className="uppercase font-lg font-semibold text-primary" >
                        vex
                    </p>
                </div>
                <div className="w-1/3" >
                    <Input className="w-full rounded-sm border-zinc-800/30" placeholder="Search people by name or email" />
                </div>
                <div className="w-1/3 flex justify-end items-center" >
                    {
                        isLoading ?
                            <Skeleton className="w-10 h-10 rounded-full" /> :
                            (
                                <Avatar className="w-10 h-10" >
                                    <AvatarImage src={data?.avatar} />
                                </Avatar>
                            )
                    }
                </div>
            </nav>
        </>
    )
}