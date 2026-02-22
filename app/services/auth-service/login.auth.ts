import z from "zod";
import { comparePassword } from "./bcrypt.util.js";
import { findUserByEmail } from "../../data-access-layer/user/user.js";



export const loginSchema = z.object({

    email: z
        .string({ error: "Email is required" })
        .email({ message: "Invalid email format" })
        .toLowerCase(), // normalise to lowercase before storing

    password: z
        .string({ error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(72, { message: "Password cannot exceed 72 characters (bcrypt limit)" }),
});

type LoginProp = z.infer<typeof loginSchema>


export const login = async (rawInput: LoginProp) => {

    const parsed = loginSchema.safeParse(rawInput)

    if(parsed.error){
        return {
            success: false,
            error: "Validation failed",
            details: parsed.error.flatten().fieldErrors, // field-level errors for the frontend
        };
    }

    const { email, password } = parsed.data
    const user = await  findUserByEmail(email)
    if(!user.success){
        return {
            success: false,
            error: "User not found",
        }
    }

    const isPassword = await comparePassword(password, user.data.password)

    if(isPassword){
        return {
            success: true,
            data: {
                id: user.data.id,
                name: user.data.name,
                email: user.data.email,
            }
        }
    }

    return {
        success: false,
        error: "Invalid credentials",
    }

}