import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function AdminDashboardPage() {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return null;

	const tickets = await prisma.ticket.findMany();

	return (
		<div>
			<h1>All Tickets</h1>
			<ul>
				{tickets.map((ticket) => (
					<li key={ticket.id}> {ticket.subject} - {ticket.priority ?? "unclassified"}</li>
				))}
			</ul>
		</div>
	);
}