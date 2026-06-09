'use client'

import { trpc } from "@/components/provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Register, registerSchema } from "@/types/user"
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircleIcon, EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function SignUp() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)

    const mutation = trpc.user.register.useMutation({
        onSuccess() {
            reset()
            router.push('/auth/sign-in')
        },
        onError(e) {
            const errMsg = e.message || "User creation failed";
            toast.error(errMsg)
        }
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm<Register>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    })

    const createUser = async (data: Register) => {
        await mutation.mutateAsync({
            fullName: data.fullName,
            email: data.email,
            password: data.password
        })
    }

    return (
        <>
            <div className="w-full h-screen flex justify-center items-center">
                <div className="w-3/10 h-auto border rounded-2xl border-zinc-800/20 shadow flex justify-start items-center flex-col p-7" >
                    <div className="w-full flex justify-center items-center flex-col" >
                        <h1 className="text-lg font-medium"> Create your Vex account</h1>
                        <p className="text-sm font-medium text-zinc-800/40"> Get started Vex account today and get started</p>
                    </div>
                    <div className="w-full h-auto pt-5 flex justify-center items-center flex-col space-y-2.5 " >
                        <form onSubmit={handleSubmit(createUser)} className="w-full flex justify-center items-center flex-col space-y-2.5 ">
                            <div className="w-full flex justify-center items-start flex-col space-y-1.5 ">
                                <Label>Full Name</Label>
                                <Input className="h-10 focus:ring-1 focus:outline-primary" placeholder="e.g. Jhon doe" {...register("fullName")} />
                                {
                                    errors.fullName &&
                                    <p className="flex justify-center items-center text-sm text-red-500 gap-1" >
                                        <AlertCircleIcon className="size-4" />
                                        {errors.fullName.message}
                                    </p>
                                }
                            </div>
                            <div className="w-full flex justify-center items-start flex-col space-y-2 ">
                                <Label>Email</Label>
                                <Input className="h-10 focus:ring-0 focus:outline-none" placeholder="e.g. jhondoe@email.com" {...register("email")} />
                                {
                                    errors.email &&
                                    <p className="flex justify-center items-center text-sm text-red-500 gap-1" >
                                        <AlertCircleIcon className="size-4" />
                                        {errors.email.message}
                                    </p>
                                }
                            </div>
                            <div className="w-full flex justify-center items-start flex-col space-y-2 ">
                                <Label>Password</Label>
                                <div className="relative w-full">
                                    <Input type={showPassword ? "text" : "password"} className="h-10 pr-10 focus:ring-0 focus:outline-none" placeholder="e.g. password" {...register("password")} />
                                    <button type="button" className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                                        {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                    </button>
                                </div>
                                {
                                    errors.password &&
                                    <p className="flex justify-center items-center text-sm text-red-500 gap-1" >
                                        <AlertCircleIcon className="size-4" />
                                        {errors.password.message}
                                    </p>
                                }
                            </div>
                            <Button type="submit" disabled={mutation.isPending} className="h-10 w-full">
                                {mutation.isPending ? (<span className="animate-spin" > <Loader2 /> </span>) : "Submit"}
                            </Button>
                        </form>
                        <div className="w-full flex justify-between items-center" >
                            <p className="text-sm w-1/2 flex justify-start items-center gap-1"  >
                                Already have an account ?
                                <Link href={'/auth/sign-in'} className="underline text-emerald-700" >
                                    Login
                                </Link>
                            </p>
                        </div>
                        <Separator className="mt-3 mb-5" />
                        <div className="w-full">
                            <Button className="w-full h-10 border border-zinc-700/20" variant={"secondary"} >
                                Continue with Github
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
