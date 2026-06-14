'use client'

import Navbar from "@/components/layout/navbar";
import { trpc } from "@/components/provider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function Search() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q');

    const search = trpc.user.find.useQuery({ query: q! })
    const sendReq = trpc.request.create.useMutation({
        onSuccess: () => {
            toast.success("Request sent")
        },
        onError: (err) => {
            if (err.message == "Request exists") {
                toast.info("Request exists")
                return
            }

            const errMsg = err.message || "Failed to send request"
            toast.error(errMsg)
        }
    })

    const handleSendRequest = async (toId: string) => {
        await sendReq.mutateAsync({ to: toId })
    }

    return (
        <>
            <Navbar />
            <main className="w-full h-auto py-5 flex justify-center items-center flex-col space-y-3.5" >
                <div className="max-w-4xl min-w-4xl flex justify-start items-center space-x-2.5" >
                    <Button variant={"outline"} size={"icon"} onClick={() => history.back()} >
                        <ChevronLeft />
                    </Button>
                    <p className="text-xl font-semibold" >Search results for "{q}"</p>
                </div>
                <div className="max-w-4xl min-w-4xl" >
                    <div className="w-full h-auto flex justify-center items-center flex-col space-y-3.5">
                        {search.isLoading ? (
                            <>
                                <Skeleton className="w-full h-16" />
                                <Skeleton className="w-full h-16" />
                                <Skeleton className="w-full h-16" />
                            </>
                        ) : (
                            search.data?.map((e) => (
                                <div className="w-full h-16 bg-zinc-300/20 border rounded-lg px-5 flex" key={e.id} >
                                    <div className="w-1/2 h-full flex justify-start items-center space-x-3">
                                        <Avatar className="size-10" >
                                            <AvatarImage src={e.avatar} className="size-10" />
                                        </Avatar>
                                        <p className="text-lg" >
                                            {e.name}
                                        </p>
                                    </div>
                                    <div className="w-1/2 h-full flex justify-end items-center" >
                                        <Button className="bg-emerald-600 rounded-sm" disabled={sendReq.isPending} onClick={() => handleSendRequest(e.id)} >
                                            {
                                                sendReq.isPending ? <span className="animate-spin"><Loader2 /></span> : null
                                            }
                                            Send request
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </>
    )

}