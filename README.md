# DMAT Case Library

**510(k) pending. Not available for sale in any market and no guarantee of commercialization or feature availability.**

**[View the DMAT Case Library website](https://varian-medicalaffairsappliedsolutions.github.io/dmat-case-library/index.html)**

This repository stores the webpages and supporting assets in [`docs/`](docs/) for publication through **GitHub Pages (`github.io`)** as the DMAT Case Library. The website is an interactive educational showcase of **Dynamic Modulated Arc Therapy (DMAT)** capabilities and the **time–quality navigation** concept across different anatomical sites and planning scenarios. The reports bring together dose distributions, dose–volume histograms (DVHs), selected dosimetric endpoints, and delivery-time information to make planning trade-offs easier to explore.

**For education and demonstration only. Not intended for clinical use or clinical decision-making.**

## Scientific reference

The conceptual reference for this showcase is:

[Dynamic modulated arc therapy (DMAT): A time-aware, modulation-steered optimization framework for next-generation radiotherapy delivery](https://aapm.onlinelibrary.wiley.com/doi/abs/10.1002/acm2.70764). *Journal of Applied Clinical Medical Physics*. 2026;27(9):e70764. DOI: [10.1002/acm2.70764](https://doi.org/10.1002/acm2.70764).

The paper describes a framework that considers dosimetric quality, modulation complexity, and delivery time together. A user-selected modulation level steers the allocation of modulation, while a model of machine dynamics provides timing information during optimization. The relationship between additional delivery time and dosimetric improvement depends on the case and planning objectives.

This library illustrates that navigation concept through saved plan comparisons. The paper provides the scientific methods and study context; the individual reports provide the inputs, assumptions, and evaluation methods for the examples displayed here. Referencing the paper does not imply that every case in this repository was included in the published study.

## Exploring time–quality navigation

On the [published website](https://varian-medicalaffairsappliedsolutions.github.io/dmat-case-library/index.html), start with the case library index and select an anatomical site. Within a report:

1. Review the case overview, prescription, planning setup, and reference plans.
2. Compare synchronized dose-colorwash slices across the available modulation levels.
3. Explore quality–time plots and individual endpoints to see how the displayed dosimetric measures vary with delivery time.
4. Toggle plans and structures in the DVH comparison to inspect coverage and organ-at-risk dose.
5. Where available, use **Plan in motion** to view an illustrative delivery animation.

Interpret “quality” in the context of the selected dosimetric endpoints, goals, priorities, and scoring methods. An aggregate score is not a measure of clinical benefit, and a longer delivery time or higher modulation level does not by itself establish a preferable treatment plan.

## Disclaimers and limitations

- **Educational purpose:** This repository and its reports, images, data, plots, and animations are for technical review, education, and demonstration only. They are not intended for clinical use, clinical decision-making, patient treatment, machine commissioning, or patient-specific quality assurance.
- **No clinical claims:** This library showcases the technical capabilities of the DMAT algorithm. It makes no claim of clinical value, clinical benefit, or improved patient outcomes. These examples do not establish clinical safety, effectiveness, or superiority.
- **Algorithm versions:** Some results shown were generated using non-clinical algorithm versions.
- **Case-specific results:** Results reflect the specific planning data, configurations, and evaluation methods shown; results in other settings may differ. Review each report's planning inputs, reference setup, dose basis, endpoint definitions, and technical details before interpreting comparisons.
- **Timing and comparisons:** Delivery-time values must be interpreted according to the source and method stated in each report. Modeled or estimated timing is not a measured treatment delivery or a guarantee of achievable treatment time. Reference plans may use different planning or delivery configurations. Displayed scores and timing do not establish performance across other systems, workflows, or patients.
- **Illustrative animation:** Plan-in-motion visualizations are for demonstration only. They do not reflect actual machine specifications, dimensions, or delivered treatment. The packaged machine visualization is based on publicly available information. Playback is not a delivery log or a validation of physical delivery or accumulated dose; dose accumulation is disabled in the lightweight packaged viewers.
- **Availability:** Products or features shown may not be commercially available. Availability varies by country, and future availability or commercialization is not guaranteed.
- **Regulatory disclosure:** **510(k) pending. Not available for sale in any market and no guarantee of commercialization or feature availability.** This is the disclosure carried by the showcase; the repository is not a source of current regulatory or commercial availability information.
- **Publication disclosure:** The referenced paper discloses that all its authors are employees of Varian Medical Systems Inc., a Siemens Healthineers company. See the [publication record](https://pubmed.ncbi.nlm.nih.gov/42638435/) for the complete abstract and disclosures.

## Third-party components

The delivery viewers include third-party components with their own copyright notices and license terms. See the `THIRD-PARTY-NOTICES.txt` and `licenses/` files within each `delivery-viewer` directory under `docs/`. Those notices and terms remain applicable.
