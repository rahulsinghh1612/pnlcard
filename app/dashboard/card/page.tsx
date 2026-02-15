import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Generate Card — PNLCard",
  description: "Generate your trading recap card.",
};

export default function CardGeneratorPage() {
  return (
    <Card className="p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Card generator
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Daily, weekly, and monthly card generation coming soon.
      </p>
    </Card>
  );
}
