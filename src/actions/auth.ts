"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData){
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	const passwordHash = await bcrypt.hash(password, 10);
	
	await prisma.user.create({
  	data: {
    name,
    email,
    passwordHash,
    role: "USER",
  },
});

}