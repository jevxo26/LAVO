import { redirect } from "next/navigation";

export default function BookLaundryRedirectPage() {
  redirect("/dashboard/book-services");
}
