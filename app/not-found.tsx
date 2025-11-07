export default function NotFound() {
  return (
    <div className="mx-auto mt-24 max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/70 backdrop-blur-xl">
      <h1 className="text-2xl font-semibold text-white">Not Found</h1>
      <p className="mt-3 text-sm">
        The requested player or page is outside our curated NBA 75 showcase. Try navigating through the Players or Compare sections to continue exploring.
      </p>
    </div>
  );
}
