import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Settings — PNLCard",
  description: "Manage your account settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, currency, trading_capital, x_handle")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-medium text-foreground">Profile</h2>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-muted-foreground">Display name</dt>
              <dd className="text-sm text-foreground">
                {profile?.display_name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Currency</dt>
              <dd className="text-sm text-foreground">
                {profile?.currency ?? "INR"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Trading capital</dt>
              <dd className="text-sm text-foreground">
                {profile?.trading_capital != null
                  ? profile.trading_capital.toLocaleString()
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">X handle</dt>
              <dd className="text-sm text-foreground">
                {profile?.x_handle ?? "Not set"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Editable settings coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
