<div align="center">

# 🌍 The Green Orbit Project (Fieldwise)

**An explainable crop-rotation decision-support prototype powered by NASA Earth observations.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?logo=vercel&logoColor=white)](https://the-green-orbit-project-vhss.vercel.app)
[![NASA Space Apps 2026](https://img.shields.io/badge/NASA-Space_Apps_Challenge_2026-0B3D91?logo=nasa&logoColor=white)](https://www.spaceappschallenge.org/)
[![Data: NASA POWER](https://img.shields.io/badge/Data-NASA_POWER-1f6feb)](https://power.larc.nasa.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[**Live Demo**](https://the-green-orbit-project-vhss.vercel.app) · [Features](#-features) · [How It Works](#-how-it-works) · [Getting Started](#-getting-started) · [Data Sources](#-data-sources) · [Roadmap](#-roadmap)

</div>

---

## 📖 Overview

Farmers and planners often struggle to turn satellite data into practical, local decisions. **GreenOrbit** (shown in the app as *Fieldwise*) bridges that gap: pick any place on Earth, and the app combines NASA climate and soil signals with crop knowledge to suggest **what to plant next**, and explains *why*.

> **Better decisions start with place.**
> One field. Many signals. Local decisions first.

This project was built for the **2026 NASA Space Apps Challenge**. It is a decision-support tool, **not** a replacement for local agronomic expertise.

## ✨ Features

- 🔎 **Location search**: find any city, country, region, or coordinates (e.g. Iowa, Sahel, Queensland, Punjab).
- 🛰️ **NASA climate evidence**: live average temperature, rainfall signal, and solar energy from the NASA POWER API.
- 🌱 **Crop intelligence**: explainable "NASA fit" and "Watch" notes for candidate crops such as cover crops, soybean, and continuous corn.
- 🔄 **Rotation decision planner**: compares rotation strategies (e.g. *Soil builder*, *Dry-season buffer*, *Current rotation*) on water efficiency, soil health, yield outlook, and an overall resilience score.
- 🗺️ **Live map**: nearby places and context from OpenStreetMap.
- 🏭 **Food and circular energy view**: surfaces local facilities relevant to food systems and circular energy.
- 🌐 **Country comparison**: choose a country from the agricultural catalog and compare national crop systems.
- 🖼️ **Satellite and field imagery**: NASA Image and Video Library and Wikimedia Commons.
- 🔌 **Optional integrations**: EOSDA (NDVI crop health), Varda Global FieldID, and SoilHive (soil properties).

## 🧠 How It Works

```
 Search a place ──► Geocode ──► Fetch NASA POWER climate signals
                                      │
                   Soil + crop context (SoilHive, FAO, crop catalog)
                                      │
                                      ▼
                 Score crop fit & rotation strategies
          (water conservation · soil health · yield outlook)
                                      │
                                      ▼
            Explainable recommendation + resilience score
```

Every recommendation comes with a plain-language reason and a caution, so users can question the output instead of just trusting it.

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js (React) |
| Hosting | Vercel |
| Climate data | NASA POWER API |
| Mapping / context | OpenStreetMap |
| Imagery | NASA Image and Video Library, Wikimedia Commons |
| Optional APIs | EOSDA, Varda Global FieldID, SoilHive |

> Update this table if your stack differs.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm, yarn, or pnpm

### Installation

```bash
# 1. Clone the repository (use the URL from the green "Code" button on GitHub)
git clone <repo-url>
cd the-green-orbit-project

# 2. Install dependencies
npm install

# 3. Configure environment variables (see below)
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

NASA POWER and OpenStreetMap need no API key. The optional integrations do:

| Variable | Required | Purpose |
| --- | --- | --- |
| `EOSDA_API_KEY` | No | NDVI crop-health analysis |
| `VARDA_API_KEY` | No | Field ID lookup |
| `SOILHIVE_API_KEY` | No | Global soil properties |

> Rename these to match the variable names your code actually uses. Never commit real keys.

### Build for production

```bash
npm run build
npm start
```

## 🛰️ Data Sources

| Source | Used for |
| --- | --- |
| [NASA POWER](https://power.larc.nasa.gov/) | Live climate API (temperature, precipitation, solar radiation) |
| [SMAP](https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/smap) | Root-zone soil moisture |
| [ECOSTRESS](https://ecostress.jpl.nasa.gov/) | Crop heat and water stress |
| [GPM](https://gpm.nasa.gov/) | Rainfall and extremes |
| [EOSDA API Connect](https://doc.eos.com/) | Optional NDVI crop-health analysis |
| [Varda Global FieldID](https://developer.varda.ag/) | Optional field identifier lookup |
| [SoilHive](https://developer.soilhive.ag/) | Optional soil properties and profiles |
| [FAO Soils Portal](https://www.fao.org/soils-portal/en/) | Soil knowledge and mapping resources |
| [OpenStreetMap](https://www.openstreetmap.org/) | Nearby facilities and local context |
| [Hugging Face Datasets](https://huggingface.co/datasets) | Open crop image and taxonomy datasets |

## ⚠️ Limitations and Disclaimer

- Recommendations are **explainable starting points, not prescriptions**.
- Always confirm soil tests, water rights, disease history, local markets, and planting windows with farmers or local extension experts.
- Some regional descriptions and rotation scores are illustrative and are being replaced with data-driven models.

## 🗺️ Roadmap

- [ ] Replace illustrative rotation scores with data-driven models
- [ ] Integrate SMAP soil moisture and ECOSTRESS stress layers directly
- [ ] Multi-season planning and field-level history
- [ ] Multilingual support
- [ ] Export recommendations as a PDF report
- [ ] Automated tests and CI

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## 👤 Author

**Sakhawat Porag**: creator and maintainer.

## 🙏 Acknowledgements

- [NASA](https://www.nasa.gov/) and the [Space Apps Challenge](https://www.spaceappschallenge.org/) for open Earth observation data
- OpenStreetMap contributors
- Wikimedia Commons contributors for crop imagery

---

<div align="center">
Built for the 2026 NASA Space Apps Challenge · <a href="https://the-green-orbit-project-vhss.vercel.app">View the live demo</a>
</div>
