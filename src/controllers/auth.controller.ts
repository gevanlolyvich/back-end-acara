import { Request, Response } from "express";
import * as Yup from "yup";

type TRegister = {
    fullname: string;
    username: string;
    email: string,
    password: string,
    confirmPassword: string;
}

const registerValidateSchema = Yup.object({
    fullname: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    confirmPassword: Yup.string().required().oneOf([Yup.ref('password'), ""], "Password be match"),
});

export default {
    async register(req: Request, res: Response) {
        const { 
            fullname, username, email, password, confirmPassword
        } = req.body as unknown as TRegister;

        try {
            await registerValidateSchema.validate({
                fullname,
                username,
                email,
                password,
                confirmPassword,
            });
            res.status(200).json({
                message: "Success Register!",
                data: {
                    fullname,
                    username,
                    email,
                }
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null,
            })
        }
        
    }
}