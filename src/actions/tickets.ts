"use server";
import { analyzeTicket } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTicketSchema } from "@/types/ticket";
import { SendReplySchema } from "@/types/ticket";
import { reanalyzeTicketSchema } from "@/types/ticket";
import { editAIAnalysisSchema } from "@/types/ticket";
import { sendUserReplySchema } from "@/types/ticket";

export async function createTicket(formData: FormData) {
	const session = await auth();
	if (!session?.user) return;

	const subject = formData.get("subject") as string;
	const content = formData.get("content") as string;

	createTicketSchema.parse({ subject, content })

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

	try {
		const analysis = await analyzeTicket(subject, content);
		
		await prisma.ticket.update({
			where: { id: ticket.id},
			data :{
				category: analysis.category,
				priority: analysis.priority,
				sentiment: analysis.sentiment,
				aiAnalyzedAt: new Date(),
			},
		});
		 await prisma.message.create({
			data:{
				ticketId: ticket.id,
				type: "AI_DRAFT",
				content: analysis.draftReply,
				draftStatus: "PENDING"
			}
		 });
	
	} catch (error){
		await prisma.ticket.update({
			where: { id: ticket.id },
			data: { aiAnalysisError: "AI analysis failed"},
		});
	}
}

export async function replyAsUser ( formData : FormData ) {
	const session = await auth();


	const ticketId = formData.get("ticketId") as string;
	const ticket = await prisma.ticket.findUnique({ where: {id: ticketId } })
	if (!ticket) return;
	

	if (ticket.ownerId !== session?.user?.id) return;

	const content = formData.get("content") as string;

	sendUserReplySchema.parse({ticketId, content })


	await prisma.message.create({
		data:{
			ticketId,
			type: "USER",
			content,
			authorId : session.user.id
		}
		})

	await prisma.ticket.update ({
		where : { id : ticketId},
		data : { status : "OPEN" }
	})
}

export async function sendReply(formData: FormData){
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return; 

	const ticketId = formData.get("ticketId") as string;
	const content = formData.get("content") as string;
	const draftId = formData.get("draftId") as string;

	SendReplySchema.parse({ ticketId, content, draftId })


	if (draftId) {
		const draftContent = await prisma.message.findUnique({
			where: { id: draftId }
		})
		if (draftContent) {

		if (content === draftContent.content){
			await prisma.message.update({
				where: {id: draftId},
				data: {draftStatus: "SENT_AS_IS"}
			})
		} else {
			await prisma.message.update({
				where: { id: draftId},
				data: {draftStatus: "SENT_EDITED"}
			})
		}}
	}

	await prisma.message.create({
		data:{
			ticketId,
			type: "ADMIN",
			content,
			authorId : session.user.id,
			sourceDraftId : draftId || null 
		},
	});

	await prisma.ticket.update({
		where: { id: ticketId },
		data: { status: "ANSWERED"}, 
	});
}

export async function reanalyzeTicket(formData: FormData) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return;

	const ticketId = formData.get("ticketId") as string;

	reanalyzeTicketSchema.parse({ ticketId })


	const ticket = await prisma.ticket.findUnique({
		where: { id: ticketId },
		include: { messages : true},
	});
	if (!ticket) return;

	const OGMessage = ticket.messages.find((message) => message.type === "USER")
	if (!OGMessage) return;

	await prisma.message.updateMany({
		where: { ticketId, type: "AI_DRAFT", draftStatus: "PENDING"},
		data: { draftStatus: "DISCARDED" },
	});

	try {
		const ReAnalyze = await analyzeTicket(ticket.subject, OGMessage.content);

		await prisma.ticket.update({
			where: { id: ticket.id },
			data: {
				category: ReAnalyze.category,
				priority: ReAnalyze.priority,
				sentiment: ReAnalyze.sentiment,
				aiAnalyzedAt: new Date(),
				aiAnalysisError: null,
			},
		});

		await prisma.message.create({
			data:{
				ticketId: ticket.id,
				type: "AI_DRAFT",
				content: ReAnalyze.draftReply,
				draftStatus: "PENDING"
			}
		});
	} catch (error){
		await prisma.ticket.update({
			where: { id: ticket.id },
			data: { aiAnalysisError: "Ai Analysis Failed"},
		});
	}
}

export async function editAIAnalysis(formData: FormData){
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return;

	const newPrio = formData.get("priority") as string;
	const newCate = formData.get("category") as string;
	const ticketId = formData.get("ticketId") as string;

	editAIAnalysisSchema.parse({ category: newCate, priority: newPrio, ticketId })


	await prisma.ticket.update({
		where: { id: ticketId},
		data : { category: newCate,
				 priority : newPrio,
				 categoryOverridden : true,
				 priorityOverridden : true,
		}
	})
}