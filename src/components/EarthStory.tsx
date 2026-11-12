type Props = {
  country: string;
  locationName: string;
};

export function EarthStory({ country, locationName }: Props) {
  return (
    <section className="earth-story mt-8 overflow-hidden rounded-[2rem]">
      <div className="earth-story-hero min-h-[420px] p-7 sm:p-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c6ff7b]">A living field report · {country}</p>
          <h2 className="mt-8 text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-7xl">
            Better decisions begin with a closer look at Earth.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
            {locationName} is not just a point on a map. It is a connected system of soil, weather, crops, water, and people.
          </p>
        </div>
        <div className="mt-24 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-white/75">
          <span className="rounded-full border border-white/25 px-3 py-2">NASA POWER</span>
          <span className="rounded-full border border-white/25 px-3 py-2">SMAP soil moisture</span>
          <span className="rounded-full border border-white/25 px-3 py-2">Open local data</span>
        </div>
      </div>
      <div className="earth-story-paper p-7 text-[#1d3024] sm:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#57715d]">Why this perspective matters</p>
          <h3 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">One field. Many signals.</h3>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#617265]">
            Satellite observations reveal patterns that are difficult to see from the ground alone. Fieldwise turns those patterns into practical questions for farmers and planners.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl divide-y divide-[#cbd4c8] border-y border-[#cbd4c8] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {[
            ["01", "Climate", "Heat and rainfall windows"],
            ["02", "Soil", "Moisture and cover"],
            ["03", "Crops", "Fit and rotation value"],
            ["04", "Action", "Local decisions first"],
          ].map(([number, title, detail]) => (
            <div key={number} className="p-5 text-center sm:p-6">
              <p className="text-xs text-[#8a9b8b]">{number}</p>
              <p className="mt-3 font-semibold">{title}</p>
              <p className="mt-2 text-xs leading-5 text-[#718173]">{detail}</p>
            </div>
          ))}
        </div>
        <div className="story-landscape mt-10 flex min-h-[280px] items-end rounded-2xl p-6 sm:p-9">
          <div className="max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6ff7b]">Designed for the next season</p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">See the signal. Ask better questions. Grow with confidence.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
