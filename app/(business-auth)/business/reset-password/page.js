import BusinessAuthForm from "@/components/BusinessAuthForm";

export const metadata = {
  title: "Reset business password — Mara Media",
};

export default function BusinessResetPasswordPage() {
  return <BusinessAuthForm mode="reset" />;
}