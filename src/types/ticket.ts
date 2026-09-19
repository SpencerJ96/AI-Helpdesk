import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(1),
  content: z.string().min(1),
});

export const SendReplySchema = z.object({
	ticketId: z.string().min(1),
	content:  z.string().min(1),
	draftId:  z.string()
});

export const reanalyzeTicketSchema = z.object({
	ticketId : z.string().min(1)
})

export const editAIAnalysisSchema = z.object({
	category: z.string().min(1),
	priority: z.string().min(1),
	ticketId: z.string().min(1),
})

export const sendUserReplySchema = z.object({
	content : z.string().min(1),
	ticketId: z.string().min(1),
})