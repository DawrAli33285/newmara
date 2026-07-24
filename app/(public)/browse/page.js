import PublicationsGrid from "@/components/PublicationsGrid";
import HowItWorks from "@/components/HowItWorks";

export const metadata = {
  title: "Publications — Mara Media",
  description:
    "Browse all five Mara Media publications — The Skipper, Take Off, Go West, Due South and The Business — and start reading in three simple steps.",
};

export default function PublicationsPage() {
  return (
    <main className="bg-white">
      <PublicationsGrid heading="Choose Your Publication" />
      <HowItWorks
        heading="Start Reading"
        bgClassName="bg-[#F7F8FA]"
      />
    </main>
  );
}
