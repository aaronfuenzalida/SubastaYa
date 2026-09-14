export default function Placeholder({ title }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <p className="mb-2 inline-block rounded-full bg-brand-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-700">
        En construcción
      </p>
      <h1 className="text-3xl font-bold text-brand-950">{title}</h1>
      <p className="mt-2 text-brand-950/60">Este módulo llega en un próximo commit.</p>
    </section>
  )
}
