import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/dashboard" });

      }}
    >
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Log In</button>
    </form>
  );
}
