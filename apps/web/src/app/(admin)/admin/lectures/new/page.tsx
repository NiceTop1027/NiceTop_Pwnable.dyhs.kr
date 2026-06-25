import { redirect } from "next/navigation";

export default function AdminLecturesNewRedirectPage() {
  redirect("/admin/curriculum/new");
}