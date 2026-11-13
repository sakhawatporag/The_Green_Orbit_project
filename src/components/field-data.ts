export type FieldLocation = {
  name: string;
  country: string;
  shortName: string;
  latitude: number;
  longitude: number;
  position: string;
  color: string;
  soil: string;
  rain: string;
  digest: string;
  source: string;
};

export type NasaPowerData = {
  source: string;
  parameters: {
    T2M?: Record<string, number>;
    PRECTOTCORR?: Record<string, number>;
    ALLSKY_SFC_SW_DWN?: Record<string, number>;
  };
};

export const locations: FieldLocation[] = [
  {
    name: "Iowa, United States",
    country: "United States",
    shortName: "Iowa",
    latitude: 42.03,
    longitude: -93.63,
    position: "left-[36%] top-[36%]",
    color: "#c6ff7b",
    soil: "0.31 m³/m³",
    rain: "728 mm",
    digest: "Moisture is stable, but summer heat is increasing. A winter cover crop can protect bare soil and improve infiltration.",
    source: "SMAP + GPM + NASA POWER",
  },
  {
    name: "Sahel, Africa",
    country: "Senegal",
    shortName: "Sahel",
    latitude: 14.7,
    longitude: -15.2,
    position: "left-[67%] top-[48%]",
    color: "#ffd37a",
    soil: "0.12 m³/m³",
    rain: "386 mm",
    digest: "Low root-zone moisture and irregular rainfall favor drought-tolerant crops, residue cover, and shorter growing windows.",
    source: "SMAP + GPM + ECOSTRESS",
  },
  {
    name: "Queensland, Australia",
    country: "Australia",
    shortName: "Queensland",
    latitude: -27.47,
    longitude: 153.03,
    position: "left-[56%] top-[69%]",
    color: "#9fe8ff",
    soil: "0.22 m³/m³",
    rain: "614 mm",
    digest: "Heat stress is the key signal. Deep-rooted rotations and lower water demand can help fields recover between wet seasons.",
    source: "ECOSTRESS + NASA POWER",
  },
  {
    name: "Punjab, India",
    country: "India",
    shortName: "Punjab",
    latitude: 30.9,
    longitude: 75.85,
    position: "left-[73%] top-[39%]",
    color: "#e5a7ff",
    soil: "0.24 m³/m³",
    rain: "649 mm",
    digest: "Warm temperatures and seasonal rainfall make water-efficient cereal and pulse rotations a promising path for soil recovery.",
    source: "SMAP + GPM + NASA POWER",
  },
];
