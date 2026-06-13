'use client'

import { useState } from "react"
import { trpc } from "../provider"
import { Input } from "../ui/input"
import { useRouter } from "next/navigation"
import { Skeleton } from "../ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Avatar, AvatarImage } from "../ui/avatar"
import { BadgeCheck, Bolt, Loader2, LogOut } from "lucide-react"
import { toast } from "sonner"

export default function Navbar() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const { data, isLoading } = trpc.user.me.useQuery()

    const logoutUser = trpc.user.logout.useMutation({
        onSuccess() {
            router.push('/auth/sign-in')
        },
        onError(e) {
            const errMsg = e.message || "Logout failed"
            toast.error(errMsg)
        }
    })

    const handleSearch = () => {
        router.push(`/search?q=${query}`)
    }

    return (
        <>
            <nav className="w-full h-14 border border-zinc-800/10 flex justify-center items-center space-x-3 px-60 ">
                <div className="w-1/3 h-full flex justify-start items-center" >
                    <p className="uppercase font-lg font-semibold text-primary" >
                        vex
                    </p>
                </div>
                <div className="w-1/3 flex justify-center items-center space-x-1.5">
                    <Input
                        className="w-full rounded-sm border-zinc-800/30"
                        placeholder="Search people by name or email"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={
                            (e) => {
                                if (e.key === "Enter") {
                                    handleSearch()
                                }
                            }
                        }
                    />
                </div>
                <div className="w-1/3 flex justify-end items-center" >
                    {
                        isLoading ?
                            <Skeleton className="w-10 h-10" /> :
                            (
                                <DropdownMenu >
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className="w-10 h-10 cursor-pointer">
                                            <AvatarImage src={data?.avatar} />
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>
                                                My Account
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem className="cursor-pointer" >
                                                <span>
                                                    <BadgeCheck className="size-4" />
                                                </span>
                                                <p>
                                                    Profile
                                                </p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer" >
                                                <span>
                                                    <Bolt className="size-4" />
                                                </span>
                                                <p>
                                                    Setting
                                                </p>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={async () => await logoutUser.mutateAsync()} >
                                                <span>
                                                    {
                                                        logoutUser.isPending ?
                                                            <span className="animate-spin" >
                                                                <Loader2 className="size-4" />
                                                            </span>
                                                            :
                                                            <LogOut className="size-4" />
                                                    }
                                                </span>
                                                <p>
                                                    {
                                                        logoutUser.isPending ? `Working` : `Logout`
                                                    }
                                                </p>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )
                    }
                </div>
            </nav>
        </>
    )
}