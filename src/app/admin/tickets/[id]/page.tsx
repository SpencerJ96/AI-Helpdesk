import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReply } from "@/actions/tickets";

export default async function AdminTicketDetailPage({ params } : { params : Promise <{id : string }> }){
	const { id } = await params;
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return null;

	const ticket = await prisma.ticket.findUnique({
		where : { id },
		include: { messages : true },
	});

	if (!ticket) return null;


	return (
		<div>
			<h1>{ticket.subject}</h1>
			<p>Status: {ticket.status}</p>
			<div>
				{ticket.messages.map((message) => (
					<p key={message.id}>{message.content}</p>
				))}
			</div>

			 <form action={sendReply}>
			<input type="hidden" name="ticketId" value={ticket.id}></input>
			<textarea name="content" placeholder="Write a reply"></textarea>
			<button type="submit">Send Reply</button>
			 </form>
		</div>
	)
}