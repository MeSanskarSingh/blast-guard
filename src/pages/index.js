
import Head from "next/head";
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Blast Radius Analysis",
    description:
      "Identify assets that could be exposed when an initial system or account is compromised.",
    icon: "◎",
  },
  {
    number: "02",
    title: "Attack Path Discovery",
    description:
      "Trace relationships between assets and understand how potential threats could propagate.",
    icon: "⌁",
  },
  {
    number: "03",
    title: "Risk Prioritization",
    description:
      "Prioritize exposed assets using criticality, traversal depth, and heuristic risk scores.",
    icon: "◈",
  },
  {
    number: "04",
    title: "Containment Guidance",
    description:
      "Generate actionable, rule-based recommendations to support incident response.",
    icon: "⌖",
  },
];

const workflow = [
  {
    step: "01",
    title: "Model",
    description:
      "Represent enterprise infrastructure as interconnected assets and relationships.",
  },
  {
    step: "02",
    title: "Investigate",
    description:
      "Choose a potentially compromised asset and define the traversal depth.",
  },
  {
    step: "03",
    title: "Analyze",
    description:
      "Explore reachable assets, attack paths, and risk classifications.",
  },
  {
    step: "04",
    title: "Respond",
    description:
      "Review containment recommendations and prioritize defensive action.",
  },
];

const technologies = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "FastAPI",
  "Python",
  "NetworkX",
  "Cytoscape.js",
];

export default function Home() {
  return (
    <>
      <Head>
        <title>BlastGuard | Graph-Based Cyber Threat Intelligence</title>
        <meta
          name="description"
          content="BlastGuard is a graph-based cyber threat hunting platform for attack path discovery, blast radius analysis, and risk prioritization."
        />
        <meta name="theme-color" content="#020617" />
      </Head>

      <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-lg font-bold text-cyan-400">
                G
              </div>
              <span className="text-xl font-bold tracking-tight">
                Blast<span className="text-cyan-400">Guard</span>
              </span>
            </Link>

            <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#workflow" className="transition hover:text-white">
                How it works
              </a>
              <a href="#technology" className="transition hover:text-white">
                Technology
              </a>
            </div>

            <Link
              href="/graph"
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20"
            >
              Launch Dashboard →
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative px-6 pb-24 pt-24 sm:pt-32">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Graph-based Cyber Threat Intelligence
              </div>

              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                See the connections.
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  Expose the impact.
                </span>
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                Understand how threats can propagate across your enterprise
                network. Discover potential attack paths, analyze blast
                radius, and prioritize critical assets with BlastGuard.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/graph"
                  className="rounded-lg bg-cyan-400 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  Launch BlastGuard Dashboard →
                </Link>

                <a
                  href="#features"
                  className="rounded-lg border border-slate-700 bg-slate-900/70 px-7 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Explore capabilities
                </a>
              </div>

              <p className="mt-6 text-xs text-slate-600">
                A graph-based approach to understanding enterprise attack
                surfaces.
              </p>
            </div>

            {/* Network visualization illustration */}
            <div className="relative mx-auto mt-20 max-w-5xl">
              <div className="absolute -inset-4 rounded-3xl bg-cyan-500/[0.04] blur-2xl" />

              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Enterprise Network Topology
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Illustrative threat relationship map
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                    Network visualization
                  </span>
                </div>

                <div className="relative h-[340px] overflow-hidden sm:h-[420px]">
                  <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(51,65,85,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.3)_1px,transparent_1px)] [background-size:36px_36px]" />

                  <svg
                    viewBox="0 0 900 420"
                    className="absolute inset-0 h-full w-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g stroke="#155e75" strokeWidth="2" opacity=".8">
                      <path d="M450 205 L220 100 L100 205 L220 310 L450 205" />
                      <path d="M450 205 L680 100 L800 205 L680 310 L450 205" />
                      <path d="M220 100 L450 55 L680 100" />
                      <path d="M220 310 L450 365 L680 310" />
                      <path d="M450 205 L450 55 M450 205 L450 365" />
                      <path d="M100 205 L450 205 L800 205" />
                    </g>

                    <g stroke="#0e7490" strokeWidth="3" opacity=".9">
                      <path d="M220 100 L450 205 L680 100" />
                      <path d="M450 205 L680 310" />
                    </g>

                    <g fill="#020617" stroke="#22d3ee" strokeWidth="3">
                      <circle cx="450" cy="205" r="22" />
                      <circle cx="220" cy="100" r="15" />
                      <circle cx="220" cy="310" r="15" />
                      <circle cx="680" cy="100" r="15" />
                      <circle cx="680" cy="310" r="15" />
                      <circle cx="450" cy="55" r="12" />
                      <circle cx="450" cy="365" r="12" />
                      <circle cx="100" cy="205" r="12" />
                      <circle cx="800" cy="205" r="12" />
                    </g>

                    <g fill="#22d3ee">
                      <circle cx="450" cy="205" r="7" />
                      <circle cx="220" cy="100" r="5" />
                      <circle cx="220" cy="310" r="5" />
                      <circle cx="680" cy="100" r="5" />
                      <circle cx="680" cy="310" r="5" />
                    </g>

                    <g fill="#f87171" stroke="#fecaca" strokeWidth="2">
                      <circle cx="100" cy="205" r="8" />
                    </g>

                    <g fill="#94a3b8" fontSize="13" fontFamily="sans-serif">
                      <text x="450" y="246" textAnchor="middle">Identity Provider</text>
                      <text x="220" y="72" textAnchor="middle">Workstation</text>
                      <text x="220" y="342" textAnchor="middle">User Account</text>
                      <text x="680" y="72" textAnchor="middle">Business App</text>
                      <text x="680" y="342" textAnchor="middle">Database</text>
                      <text x="450" y="29" textAnchor="middle">Endpoint</text>
                      <text x="450" y="397" textAnchor="middle">Backup Server</text>
                      <text x="100" y="180" textAnchor="middle">Threat</text>
                      <text x="800" y="180" textAnchor="middle">Asset</text>
                    </g>
                  </svg>

                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-4 rounded-lg border border-slate-800 bg-slate-950/90 px-4 py-3 text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      Threat source
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                      Network asset
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                      Relationship
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-slate-800 bg-slate-900/30 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Capabilities
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Understand your attack surface.
              </h2>
              <p className="mt-4 leading-7 text-slate-400">
                BlastGuard transforms network relationships into actionable
                security context, helping analysts understand potential
                exposure beyond isolated alerts.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl text-cyan-400">
                      {feature.icon}
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-8 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Investigation workflow
              </p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                From network data to response.
              </h2>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 font-mono text-sm font-bold text-cyan-300">
                    {item.step}
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>

                  {index !== workflow.length - 1 && (
                    <div className="absolute right-0 top-6 hidden h-px w-12 translate-x-1/2 bg-slate-700 lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology */}
        <section id="technology" className="border-y border-slate-800 bg-slate-900/30 px-6 py-20">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Under the hood
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Built with a modern technology stack.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              A modular architecture combining graph algorithms, API-driven
              analysis, and interactive network visualization.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-300"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900 px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.09] via-transparent to-blue-500/[0.08]" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Start investigating
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Think in graphs.
                <br />
                Respond with context.
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400">
                Explore the modeled enterprise network, investigate
                potential attack propagation, and understand which assets
                deserve attention.
              </p>

              <Link
                href="/graph"
                className="mt-9 inline-flex rounded-lg bg-cyan-400 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Open BlastGuard Dashboard →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">
                Blast<span className="text-cyan-400">Guard</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Graph-Based Cyber Threat Hunting and Blast Radius Analysis
              </p>
            </div>

            <p className="text-xs text-slate-600">
              A cybersecurity project focused on graph-based threat analysis.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
