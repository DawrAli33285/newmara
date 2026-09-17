import { Suspense } from "react";
import BusinessResetPasswordConfirmForm from "@/components/BusinessResetPasswordConfirmForm";

export const metadata = {
  title: "Set new password — Mara Media",
};

export default function BusinessResetPasswordConfirmPage() {
  return (
    <Suspense fallback={null}>
      <BusinessResetPasswordConfirmForm />
    </Suspense>
  );
}