"use server";
import { analyzeTicket } from "@/lib/anthropic";
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

export async function sendReply(formData: FormData){
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return; 

	const ticketId = formData.get("ticketId") as string;
	const content = formData.get("content") as string;
	const draftId = formData.get("draftId") as string;

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