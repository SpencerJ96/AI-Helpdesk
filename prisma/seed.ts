import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main(){
	const adminPasswordHash = await bcrypt.hash("admin123", 10);
	const userPasswordHash = await bcrypt.hash("user123", 10);

	await prisma.user.create({
		data: {
			email: "admin@example.com",
			name: "Admin",
			passwordHash: adminPasswordHash,
			role: "ADMIN",
		},
	});


	await prisma.user.create({
		data:{
			email: "user@example.com",
			name: "Test User",
			passwordHash: userPasswordHash,
			role: "USER",
		},
	});
	console.log("seed complete");
}
main();