import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { editAIAnalysis, reanalyzeTicket, sendReply } from "@/actions/tickets";

export default async function AdminTicketDetailPage({ params } : { params : Promise <{id : string }> }){
	const { id } = await params;
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return null;

	const ticket = await prisma.ticket.findUnique({
		where : { id },
		include: { messages : true },
	});

	if (!ticket) return null;

	const draft = ticket.messages.find(
		(message) => message.type === "AI_DRAFT" && message.draftStatus === "PENDING");

	return (
		<div>
			<h1>{ticket.subject}</h1>
			<p>Status: {ticket.status}</p>
			<div>
				{ticket.messages
				.filter((message) => message.type !== "AI_DRAFT")
				.map((message) => {
  				const linkedDraft = ticket.messages.find((m) => m.id === message.sourceDraftId);
  				return (
  					<p key={message.id}>
  						{message.content}
  						{linkedDraft && ` (${linkedDraft.draftStatus === "SENT_AS_IS" ? "sent as-is" : "edited"})`}
  					</p>
  				);
				})}
			</div>

			<div>
				<h2>AI Analysis</h2>
				{ticket.aiAnalysisError ? 
					(<p>Error: {ticket.aiAnalysisError}</p>)
					:
					( <div>
					<p>Category: {ticket.category}</p>
					<p>Priority: {ticket.priority}</p>
					<p>Sentiment: {ticket.sentiment}</p>
					  </div>
					)
				}
			</div>

			<div>
				<h3>AI Draft</h3>
				{draft ?
				(<p>AI Draft: {draft.content}</p>)
				:
				(<p>AI Draft unavailable</p>)
				}
			</div>

			 <form action={sendReply}>
			<input type="hidden" name="draftId" value={draft?.id ?? ""}></input>
			<input type="hidden" name="ticketId" value={ticket.id}></input>
			<textarea name="content" placeholder="Write a reply"></textarea>
			<button type="submit">Send Reply</button>
			 </form>

			 <form action={reanalyzeTicket}>
				<input type="hidden" name="ticketId" value={ticket.id}></input>
				<button type="submit">Reanalyze ticket</button>
			 </form>

			 <form action={editAIAnalysis}>
				<input type="hidden" name="ticketId" value={ticket.id}></input>
				<select name="category" value={ticket.category ?? undefined}>
					<option value="NETWORK_IT">Network IT</option>
					<option value="BILLING">Billing</option>
					<option value="ACCOUNT">Account</option>
					<option value="SOFTWARE">Software</option>
					<option value="HARDWARE">Hardware</option>
					<option value="OTHER">Other</option>
				</select>
				<select name="priority" value={ticket.priority ?? undefined}>
					<option value="LOW">Low</option>
					<option value="MEDIUM">Medium</option>
					<option value="HIGH">High</option>
					<option value="CRITICAL">Critical</option>
				</select>
				<button type="submit">Save Edits</button>
			 </form>
		</div>
	)
}