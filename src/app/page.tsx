import { IntakeForm } from "@/components/intake-form";

const services = [
  {
    title: "Getting online",
    body: "If people can't find you, they walk into the place they can. A simple site, a maps listing, hours and photos that actually match the shop.",
  },
  {
    title: "Organizing data",
    body: "Receipts in a shoebox, inventory in someone's head. We'll put customers, stock, and sales somewhere you can trust — and keep using.",
  },
  {
    title: "Scaling the shop",
    body: "Busier is good until the owner is in every loop. We'll sort orders, staffing, and the next step so growth doesn't break what already works.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <a href="#top" className="font-display text-xl tracking-tight text-ink">
          Storefront Studio
        </a>
        <a
          href="#inquire"
          className="rounded-full border border-line bg-paper-raised px-4 py-2 text-sm font-medium text-ink hover:border-forest/40"
        >
          {"Tell me what's stuck"}
        </a>
      </header>

      <main id="top" className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-8 sm:pt-16">
          <p className="text-sm font-medium tracking-wide text-terracotta uppercase">
            For brick-and-mortar shops
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.1] tracking-tight text-ink sm:text-6xl">
            {`Your shop is already the real thing. Let's get the rest of it caught up.`}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {`I help local businesses get found, get organized, and grow without turning into a tech company. No pitch deck. Just tell me what's in the way.`}
          </p>
          <a
            href="#inquire"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-terracotta px-7 text-sm font-semibold text-white hover:bg-terracotta-dark"
          >
            Send a note
          </a>
        </section>

        <section className="border-y border-line bg-paper-raised/70">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-16 sm:grid-cols-3">
            {services.map((service) => (
              <article key={service.title}>
                <h2 className="font-display text-2xl tracking-tight text-ink">
                  {service.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted">{service.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="inquire"
          className="mx-auto w-full max-w-3xl px-6 py-20"
        >
          <h2 className="font-display text-4xl tracking-tight text-ink">
            {"What's going on at the shop?"}
          </h2>
          <p className="mt-3 mb-8 max-w-xl text-muted leading-relaxed">
            {`Drop your name, the business, and the problem. I'll open a workspace for your shop and email myself so I can start.`}
          </p>
          <IntakeForm />
        </section>
      </main>

      <footer className="border-t border-line px-6 py-8 text-center text-sm text-muted">
        Storefront Studio · consultant for local shops
      </footer>
    </div>
  );
}
