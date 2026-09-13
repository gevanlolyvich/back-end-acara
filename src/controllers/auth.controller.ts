import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encrypted";
import { generateToken } from "../utils/jwt";

type TRegister = {
    fullName: string;
    username: string;
    email: string,
    password: string,
    confirmPassword: string;
}

type TLogin = {
    identifier: string,
    password: string
}

const registerValidateSchema = Yup.object({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    confirmPassword: Yup.string().required().oneOf([Yup.ref('password'), ""], "Password be match"),
});

export default {
    async register(req: Request, res: Response) {
        const { 
            fullName, username, email, password, confirmPassword
        } = req.body as unknown as TRegister;

        try {
            await registerValidateSchema.validate({
                fullName,
                username,
                email,
                password,
                confirmPassword,
            });

            const result = await UserModel.create({
                fullName,
                username,
                email,
                password,
            });

            res.status(200).json({
                message: "Success Register!",
                data: result,
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null,
            })
        }  
    },

    async login(req: Request, res: Response) {
        const { identifier, password } = req.body as unknown as TLogin;
        try {
            // ambil data user berdasarkan "identifier" ==> email dan username
            const userByIndetifier = await UserModel.findOne({
                $or: [
                    {
                        email: identifier,
                    },
                    {
                        username: identifier,
                    }
                ]
            });

            if (!userByIndetifier) {
                return res.status(403).json({
                    message: "user not found",
                    data: null,
                });
            }

            //validasi password
            const validatePassword: boolean = encrypt(password) === userByIndetifier.password;
            
            if (!validatePassword) {
                return res.status(403).json({
                    message: "user not found",
                    data: null,
                });
            }

            const token = generateToken({
                id: userByIndetifier._id,
                role: userByIndetifier.role,
            });

            res.status(200).json({
                message: "Login Success",
                data: token,
            });

        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null,
            })
        }
    }
}