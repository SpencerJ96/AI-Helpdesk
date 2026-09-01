import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage(){
	const session = await auth();
	if (!session?.user) return null;

	const tickets = await prisma.ticket.findMany( {
		where: { ownerId: session.user.id},
	} );


	return (
		<div>
			<h1>My Tickets</h1>
			<ul>
				{tickets.map((ticket) => (
					<li key={ticket.id}> {ticket.subject} - {ticket.status} </li>
				))}
			</ul>
		</div>
	);
}