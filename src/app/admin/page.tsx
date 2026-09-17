import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function AdminDashboardPage( { searchParams } : { searchParams : Promise <{status? : string }> }) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return null;

	const { status } = await searchParams;
	
	const tickets = await prisma.ticket.findMany( {
							where: { status }
							});	

	return (
		<div>
			<h1>All Tickets</h1>
			{tickets.length === 0 ? <p>No Tickets Found</p> :
			<ul>
				{tickets.map((ticket) => (
					<li key={ticket.id}> {ticket.subject} - {ticket.priority ?? "unclassified"}</li>
				))}
			</ul>
			}
			<form method="GET">
 				<select name="status" value={status}>
   				<option value="OPEN">Open</option>
   				<option value="ANSWERED">Answered</option>
   				<option value="">All</option>
  				</select>
				<button type="submit">Select a filter</button>
			</form>

		</div>
	);
}