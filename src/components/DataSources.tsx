const dataSources = [
  { name: "SMAP", detail: "Root-zone soil moisture", href: "https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/smap" },
  { name: "ECOSTRESS", detail: "Crop heat & water stress", href: "https://ecostress.jpl.nasa.gov/" },
  { name: "GPM", detail: "Rainfall & extremes", href: "https://gpm.nasa.gov/" },
  { name: "NASA POWER", detail: "Live climate API used here", href: "https://power.larc.nasa.gov/" },
  { name: "EOSDA API Connect", detail: "Optional NDVI crop-health analysis", href: "https://doc.eos.com/" },
  { name: "Varda Global FieldID", detail: "Optional field identifier lookup", href: "https://developer.varda.ag/" },
  { name: "SoilHive", detail: "Optional global soil properties and profiles", href: "https://developer.soilhive.ag/" },
  { name: "FAO Soils Portal", detail: "Global soil knowledge and mapping resources", href: "https://www.fao.org/soils-portal/en/" },
  { name: "Hugging Face Datasets", detail: "Open crop image and taxonomy datasets", href: "https://huggingface.co/datasets" },
];

export function DataSources() {
  return <section id="sources" className="grid gap-3 sm:grid-cols-2">{dataSources.map((source) => <a key={source.name} href={source.href} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#c6ff7b]/50 hover:bg-[#c6ff7b]/5"><p className="font-semibold">{source.name} <span className="text-[#c6ff7b]">↗</span></p><p className="mt-2 text-sm text-[#8fa49a]">{source.detail}</p></a>)}</section>;
}
