'use client'

import { trpc } from "@/components/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Login, loginSchema } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const { register, handleSubmit, formState: { errors }, reset } = useForm<Login>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
    })

    const mutation = trpc.user.login.useMutation({
        onSuccess(data) {
            if (data.data.isNew) {
                router.push('/update-avatar')
                return
            } else {
                toast.success("Welcome")
                router.push('/home')
            }
            reset()
        },
        onError(e) {
            const errMsg = e.message || "User login failed";
            toast.error(errMsg)
        }
    })

    const loginUser = async (data: Login) => {
        await mutation.mutateAsync({
            email: data.email,
            password: data.password
        })
    }


    return (
        <>
            <div className="w-full h-screen flex justify-center items-center">
                <div className="w-3/10 h-auto border rounded-2xl border-zinc-800/20 shadow flex justify-start items-center flex-col p-7" >
                    <div className="w-full flex justify-center items-center flex-col" >
                        <h1 className="text-lg font-medium"> Sign in into your Vex account</h1>
                        <p className="text-sm font-medium text-zinc-800/40"> Enter your credentials and get started</p>
                    </div>
                    <div className="w-full h-auto pt-5 flex justify-center items-center flex-col space-y-2.5 " >
                        <form onSubmit={handleSubmit(loginUser)} className="w-full flex justify-center items-center flex-col space-y-2.5 ">
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
                                Don't have an account ?
                                <Link href={'/auth/sign-up'} className="underline text-emerald-700" >
                                    Register
                                </Link>
                            </p>
                            <Link href={"#"} className="w-1/2 flex justify-end items-center text-sm underline text-emerald-700" >
                                Forgot password?
                            </Link>
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