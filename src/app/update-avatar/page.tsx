'use client'

import { trpc } from "@/components/provider";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

export default function UpdateAvatar() {
    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)

    const handleFileSelection = () => {
        fileInputRef.current?.click()
    }

    const handleFileChanage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        } else {
            toast.error("No file selected")
        }
    }

    const saveImage = trpc.user.updateAvatar.useMutation({
        onSuccess() {
            toast.success("Avatar updated")
            router.push('/home')
        },
        onError(e) {
            const errMsg = e.message || "Failed to update avatar"
            toast.error(errMsg)
        }
    })

    const handleFileUpload = async () => {
        setLoading(true)
        try {
            if (!selectedFile) {
                toast.info("No file selected")
                return
            }

            const formdata = new FormData()
            formdata.append("avatar", selectedFile)

            const res = await fetch('/api/upload/avatar', {
                method: "POST",
                body: formdata
            })

            const data = await res.json()

            if (!data?.url) {
                toast.error("Failed to upload image")
                return
            }

            await saveImage.mutateAsync({ url: data?.url })
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <nav className="fixed top-0 w-full h-14 border border-zinc-800/10 flex justify-center items-center space-x-3 px-60 ">
                <div className="w-1/3 h-full flex justify-start items-center" >
                    <p className="uppercase font-lg font-semibold text-primary" >
                        vex
                    </p>
                </div>
                <div className="w-1/3"></div>
                <div className="w-1/3"></div>
            </nav >
            <main className="w-full h-screen flex justify-center items-center flex-col space-y-4 " >
                <input className="hidden" type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleFileChanage(e)} />
                <div className="w-1/3 h-1/3 border-2 border-dashed border-zinc-800/40 rounded-lg flex justify-center items-center flex-col space-y-4 cursor-pointer" onClick={() => handleFileSelection()} >
                    <div className="size-32 rounded-full flex justify-center items-center bg-emerald-500/20" >
                        <p className="text-lg text-emerald-800 flex justify-center items-center " >
                            <Upload className="size-7" />
                        </p>
                    </div>
                    <p className="text-sm text-zinc-800/40" >
                        {
                            selectedFile ? `${selectedFile.name}` : `Select you profile picture to upload`
                        }
                    </p>
                </div>
                <div className="w-1/3 flex justify-center items-center space-x-2" >
                    <Button className="w-1/2 h-10 border border-zinc-800/20" variant={"secondary"} onClick={() => router.push('/home')} >
                        Skip
                    </Button>
                    <Button className="w-1/2 h-10" disabled={loading} onClick={() => handleFileUpload()} >
                        {
                            loading ? (
                                <>
                                    <span className="animate-spin" > <Loader2 />  </span>
                                    <p>
                                        Submitting
                                    </p>
                                </>
                            )
                                : `Upload`
                        }
                    </Button>
                </div>
            </main>
        </>
    )
}