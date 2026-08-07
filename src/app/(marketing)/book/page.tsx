import { redirect } from "next/navigation";

export default function BookRedirectPage() {
  redirect("/dashboard/book-services");
}
