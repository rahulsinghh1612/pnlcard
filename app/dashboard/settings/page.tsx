import { createClient } from "@/lib/supabase/server";

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
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-zinc-500">Manage your account.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-medium text-zinc-900">Profile</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-xs text-zinc-500">Display name</dt>
            <dd className="text-sm text-zinc-900">{profile?.display_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Currency</dt>
            <dd className="text-sm text-zinc-900">{profile?.currency ?? "INR"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Trading capital</dt>
            <dd className="text-sm text-zinc-900">
              {profile?.trading_capital != null
                ? profile.trading_capital.toLocaleString()
                : "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">X handle</dt>
            <dd className="text-sm text-zinc-900">{profile?.x_handle ?? "Not set"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-zinc-500">
          Editable settings coming soon.
        </p>
      </div>
    </div>
  );
}
