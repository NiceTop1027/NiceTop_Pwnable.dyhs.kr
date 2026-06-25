import { redirect } from "next/navigation";

export default function AdminLecturesRedirectPage() {
  redirect("/admin/curriculum");
}