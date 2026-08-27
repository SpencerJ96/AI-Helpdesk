import { registerUser } from "@/actions/auth";


export default function RegisterPage(){
	return (
		<form action={registerUser}>
			<input name="name" placeholder="Name" />
			<input name="email" type="email" placeholder="Email" />
			<input name="password" type="password" placeholder="Password" />
			<button type="submit">Register</button>
		</form>
	);
}