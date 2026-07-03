import Link from "next/link";
import { getAdminServiceClient } from "@/lib/admin/auth";
import { getRideGameConfig } from "@/lib/game-config-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminConfirmForm } from "@/components/admin/AdminConfirmForm";
import { GameConfigEditor } from "@/components/admin/GameConfigEditor";
import {
  clearStreetRunLeaderboard,
  deleteStreetRunScore,
  deleteStreetRunScoresForEmail,
} from "@/lib/admin/actions";
import { formatDate } from "@/lib/utils";
import type { StreetRunScore } from "@/types/database";

function uniqueEmails(scores: StreetRunScore[]) {
  return [
    ...new Set(
      scores
        .map((row) => row.email)
        .filter((email): email is string => Boolean(email)),
    ),
  ].sort();
}

export default async function AdminGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const supabase = await getAdminServiceClient();

  const [{ data, error }, gameConfig] = await Promise.all([
    supabase
      .from("street_run_scores")
      .select("*")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true }),
    getRideGameConfig(supabase),
  ]);

  const scores = (data || []) as StreetRunScore[];
  const emails = uniqueEmails(scores);
  const topScore = scores[0]?.score ?? 0;
  const showEmails = view === "emails";
  const showEdit = view === "edit";

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 text-xs uppercase tracking-widest ${
      active
        ? "bg-muted-gold text-near-black"
        : "border border-clay/30 text-bone/60 hover:text-bone"
    }`;

  return (
    <>
      <AdminPageHeader
        title="Games"
        description="Ride scores, player emails, and editable game content for /ride."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/games" className={tabClass(!showEmails && !showEdit)}>
          Leaderboard
        </Link>
        <Link href="/admin/games?view=emails" className={tabClass(showEmails)}>
          Emails ({emails.length})
        </Link>
        <Link href="/admin/games?view=edit" className={tabClass(showEdit)}>
          Edit game
        </Link>
        {!showEdit && (
          <>
            <span className="mx-2 hidden h-4 w-px bg-clay/30 sm:inline" aria-hidden />
            <AdminConfirmForm
              action={clearStreetRunLeaderboard}
              confirmMessage="Clear the entire ride leaderboard? All scores and collected emails will be removed."
              className="inline"
            >
              <button
                type="submit"
                className="px-3 py-1.5 text-xs uppercase tracking-widest text-dried-blood hover:text-bone"
              >
                Clear leaderboard
              </button>
            </AdminConfirmForm>
          </>
        )}
      </div>

      {showEdit ? (
        <GameConfigEditor initial={gameConfig} />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-4">
            <AdminCard className="px-5 py-4">
              <p className="text-display text-3xl text-muted-gold">{scores.length}</p>
              <p className="mt-1 text-sm text-bone/60">Total submissions</p>
            </AdminCard>
            <AdminCard className="px-5 py-4">
              <p className="text-display text-3xl text-muted-gold">{emails.length}</p>
              <p className="mt-1 text-sm text-bone/60">Unique emails</p>
            </AdminCard>
            <AdminCard className="px-5 py-4">
              <p className="text-display text-3xl text-muted-gold">{topScore}</p>
              <p className="mt-1 text-sm text-bone/60">Top score</p>
            </AdminCard>
          </div>

          {error ? (
            <AdminCard className="text-dried-blood">
              Could not load ride scores: {error.message}
            </AdminCard>
          ) : showEmails ? (
            <div className="overflow-x-auto border border-clay/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-clay/20 bg-warm-charcoal/80 text-left text-bone/50">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Best score</th>
                    <th className="px-4 py-3">Runs</th>
                    <th className="px-4 py-3">Last played</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-bone/50">
                        No player emails collected yet.
                      </td>
                    </tr>
                  ) : (
                    emails.map((email) => {
                      const runs = scores.filter((row) => row.email === email);
                      const best = Math.max(...runs.map((row) => row.score));
                      const lastPlayed = runs.reduce(
                        (latest, row) => (row.created_at > latest ? row.created_at : latest),
                        runs[0].created_at,
                      );
                      const displayName =
                        runs.find((row) => row.username)?.username ?? runs[0].username ?? "—";

                      return (
                        <tr key={email} className="border-b border-clay/10">
                          <td className="px-4 py-3">
                            <a href={`mailto:${email}`} className="text-bone hover:text-muted-gold">
                              {email}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-bone/80">{displayName}</td>
                          <td className="px-4 py-3 text-bone">{best}</td>
                          <td className="px-4 py-3 text-bone/70">{runs.length}</td>
                          <td className="px-4 py-3 text-bone/50">{formatDate(lastPlayed)}</td>
                          <td className="px-4 py-3">
                            <AdminConfirmForm
                              action={deleteStreetRunScoresForEmail}
                              confirmMessage={`Remove all ride scores for ${email}?`}
                              hiddenFields={{ email }}
                            >
                              <button
                                type="submit"
                                className="text-xs uppercase tracking-widest text-dried-blood hover:text-bone"
                              >
                                Remove all
                              </button>
                            </AdminConfirmForm>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto border border-clay/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-clay/20 bg-warm-charcoal/80 text-left text-bone/50">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Character</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-bone/50">
                        No scores yet. Play the ride at{" "}
                        <Link href="/" className="text-muted-gold hover:text-bone">
                          /
                        </Link>
                        .
                      </td>
                    </tr>
                  ) : (
                    scores.map((row, index) => (
                      <tr key={row.id} className="border-b border-clay/10">
                        <td className="px-4 py-3 text-bone/50">{index + 1}</td>
                        <td className="px-4 py-3 text-bone">{row.username}</td>
                        <td className="px-4 py-3">
                          {row.email ? (
                            <a
                              href={`mailto:${row.email}`}
                              className="text-bone/70 hover:text-muted-gold"
                            >
                              {row.email}
                            </a>
                          ) : (
                            <span className="text-bone/40">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-bone">{row.score}</td>
                        <td className="px-4 py-3 text-bone/70">{row.character ?? "—"}</td>
                        <td className="px-4 py-3 text-bone/50">{formatDate(row.created_at)}</td>
                        <td className="px-4 py-3">
                          <DeleteButton
                            action={deleteStreetRunScore}
                            id={row.id}
                            label="Remove"
                            confirmMessage={`Remove this score (${row.score}) for ${row.username}?`}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <section className="mt-10">
            <h2 className="text-display mb-3 text-lg uppercase text-bone">Quick links</h2>
            <AdminCard className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-bone">KillsComfort Ride</p>
                  <p className="text-sm text-bone/50">Full warehouse experience · /</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/admin/games?view=edit"
                    className="text-sm text-muted-gold hover:text-bone"
                  >
                    Edit content →
                  </Link>
                  <Link href="/" target="_blank" className="text-sm text-muted-gold hover:text-bone">
                    Open game →
                  </Link>
                </div>
              </div>
            </AdminCard>
          </section>
        </>
      )}
    </>
  );
}
