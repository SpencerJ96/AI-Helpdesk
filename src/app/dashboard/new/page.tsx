import { createTicket } from "@/actions/tickets";

export default function NewTicketPage(){
	return(
		<form action={createTicket}>
			<input name="subject" placeholder="Subject"/>
			<textarea name="content" placeholder="Describe your issue" />
			<button type="submit">Submit Ticket</button>
		</form>
	);
}