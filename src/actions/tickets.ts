"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createTicket(formData: FormData) {
	const session = await auth();
	if (!session?.user) return;

	const subject = formData.get("subject") as string;
	const content = formData.get("content") as string;

	const ticket = await prisma.ticket.create({
		data:{
			subject, 
			ownerId: session.user.id,
		},
	});

	await prisma.message.create({
		data:{
			ticketId: ticket.id,
			type: "USER",
			content,
			authorId: session.user.id,
		},
	});
}