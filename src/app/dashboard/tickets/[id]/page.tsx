import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { replyAsUser } from "@/actions/tickets";


export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { messages: true },
  });

  if (!ticket || ticket.ownerId !== session.user.id) return null;

  return (
    <div>

      <h1>{ticket.subject}</h1>
      <p>Status: {ticket.status}</p>

      <div>
        {ticket.messages
          .filter((message) => message.type !== "AI_DRAFT")
          .map((message) => (
            <p key={message.id}>{message.content}</p>
          ))}
      </div>

		<div>
		  	<form action={replyAsUser}>
				<input type="hidden" value={ticket.id} name="ticketId"></input>
				<textarea name="content" placeholder="Enter your Reply Here"></textarea>
				<button type="submit">Reply</button>
			</form>
		</div>  

    </div>
  );
}
