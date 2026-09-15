import { cookies } from "next/headers";
import Link from "next/link";

export default async function CognitoDemoPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("cognito_user")?.value;
  const userInfo = userCookie ? JSON.parse(userCookie) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16 text-slate-900">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Amazon Cognito</p>
          <h1 className="mt-2 text-3xl font-semibold">OIDC sample</h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
        >
          Back home
        </Link>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {userInfo ? (
          <>
            <h2 className="text-2xl font-semibold">Welcome, {userInfo.username || userInfo.email || "user"}</h2>
            <p className="mt-3 text-slate-600">You are signed in with Amazon Cognito.</p>

            <div className="mt-6 space-y-3">
              <a
                href="/api/cognito/logout"
                className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Logout
              </a>
            </div>

            <pre className="mt-6 overflow-x-auto rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">Sign in with Amazon Cognito</h2>
            <p className="mt-3 text-slate-600">
              This example follows the Amazon Cognito OIDC login flow with OpenID Connect.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/api/cognito/login?next=/cognito-demo"
                className="inline-flex rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Login with Cognito
              </a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
