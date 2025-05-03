"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner";
import FormField from "./FormField";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3),
    });
};



const AuthForm = ({ type }: { type: FormType }) => { // Define the type of the form as we conditionally render the form based on the type of the form - sign-in or sign-up
    // 1. Define your form.
    const router = useRouter()
    const formSchema = authFormSchema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            if (type === "sign-up") {
                toast.success("Account created successfully! , please sign in to continue.")
                router.push("/sign-in")
        }else{
            toast.success("Sign in successfully!")
            router.push("/")
        }
    }catch(error){
        toast.error("Something went wrong!")
    }
    }

    const isSignIn = type === "sign-in"; // Check if the form type is sign-in

    

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38} />
                    <h2 className="text-primary-100">AceAI</h2>
                </div>

                <h3 className="text-center">Ace Job Preparation with AI</h3>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <FormField
                                control={form.control} // form control is used to manage the form state and validation , form state means the current values of 
                                // the form fields and validation means checking if the values are valid or not , react hook form provides a way to manage the
                                //  form state and validation using the useForm hook
                                name="name"
                                label="Name"
                                placeholder="Your Name"
                                type="text"
                            />
                        )} {/* Conditionally render the name field based on the form type */}

                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your email address"
                            type="email"
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                            type="password"
                        />

                        <Button className="btn" type="submit">
                            {isSignIn ? "Sign In" : "Create an Account"}
                        </Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignIn ? "No account yet?" : "Have an account already?"} {/* If the page is isSignIn then render no account yet else 2nd one */}
                    <Link
                        href={!isSignIn ? "/sign-in" : "/sign-up"}
                        className="font-bold text-user-primary ml-1"
                    >
                        {!isSignIn ? "Sign In" : "Sign Up"} {/* If the page is not isSignIn then render signIn else 2nd one */}
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default AuthForm