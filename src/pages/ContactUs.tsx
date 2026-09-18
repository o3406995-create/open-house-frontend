export default function ContactUs() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-4xl font-semibold text-slate-900 mb-4">Contact Us</h1>
      <p className="text-lg text-slate-600 leading-8 mb-8">
        Have questions or want to get in touch? Send us a message and we'll get back to you shortly.
      </p>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form className="space-y-6">
          <label className="block text-left text-sm font-medium text-slate-700">
            Name
            <input
              type="text"
              placeholder="Your name"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block text-left text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block text-left text-sm font-medium text-slate-700">
            Message
            <textarea
              rows={5}
              placeholder="Write your message..."
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
