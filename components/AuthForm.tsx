"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod" // zod is a validation library for typescript and javascript , z is the default export of zod which is used to create schemas for validation
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"; // sonner is a notification library for react , it is used to show notifications in the app
import FormField from "./FormField";
import { auth } from "@/firebase/client"; // auth is the firebase auth instance which is used to authenticate users
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"; // createUserWithEmailAndPassword is a firebase auth method which is used to create a new user with email and password
// signInWithEmailAndPassword is a firebase auth method which is used to sign in a user with email and password

import { signIn, signUp } from "@/lib/actions/auth.action";
import {Form} from "@/components/ui/form"

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
    const formSchema = authFormSchema(type); // authFormSchema is a function which takes the type of the form and returns a zod schema for validation
    const form = useForm<z.infer<typeof formSchema>>({ // useForm is a react hook form method which is used to create a form and manage its state
        // z.infer<typeof formSchema> is used to infer the type of the form schema i.e. the type of the form fields
        // zodResolver is used to resolve the zod schema and validate the form fields
        // zod schema is a validation schema created using zod library which is used to validate the form fields
        resolver: zodResolver(formSchema), // zodResolver is a function which takes the zod schema and returns a resolver function which is used to validate the form fields
        defaultValues: {
            name: "",
        },
    })

 const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") { // Check if the form type is sign-up 
        const { name, email, password } = data; // Destructure the data object to get the name, email and password fields
        // Create a new user with email and password using firebase auth

        const userCredential = await createUserWithEmailAndPassword( // passing the auth instance and email and password to create a new user in firebase
          auth, // auth means the firebase auth instance , each time we create a new user we pass the auth instance to it to create a new user
          email,
          password
        );

        const result = await signUp({ // signUp is a function which takes the user details and saves it to the database
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) { // Check if the signUp was successful 
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in."); // Show success message if the signUp was successful
        router.push("/sign-in"); // Redirect to sign-in page after successful sign-up
      } else { // If the form type is sign-in
        const { email, password } = data; // Destructure the data object to get the email and password fields

        const userCredential = await signInWithEmailAndPassword( // passing the auth instance and email and password to sign in the user to firebase to sign in the user
            // by checking if the user exists in the database
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken(); // after signing in the user we get the idToken of the user which is used to authenticate the user
        // check if the idToken is not null or undefined , if it is null or undefined then show error message
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({ // signIn is a function which takes the user details and saves it to the database as it is used to authenticate the user
          // by checking if the user exists in the database
          email,
          idToken,
        });

        toast.success("Signed in successfully.");   // Show success message if the signIn was successful
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

    const isSignIn = type === "sign-in"; // Check if the form type is sign-in

    

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38} />
                    <h2 className="text-primary-100">AceAI</h2>
                </div>

                <h3 className="text-center">Ace Job Preparation with AI</h3>

                <Form {...form}> {/* Form is a component which takes the form object and passes it to the FormField component to manage the form state and validation */}
                    {/* ... form means the form object which is created using the useForm hook and passed to the FormField component */}
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