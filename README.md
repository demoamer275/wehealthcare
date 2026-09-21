# Reference Demo Framework (for AEM EDS)

**Build your Own Demos for EDS**
- Custom Themes (with and without code)
- Dynamic Media Templates
- Dynamic Media Open API & native Dynamic Media Blocks
- Style-friendly blocks including (not an exhaustive list):
  - Teaser
  - Cards (multiple layout style options in UI)
  - Video
  - Content Fragment
- **Native Mobile Apps (iOS & Android)** for a true Headless Experience:
  - Create and customize as per your own brand (no code required)
  - Dynamic Media Template
  - Content Fragments
  - List of Content Fragments

- **Site Template** for quick sites:
  - Quickly create and customize new sites as per your own brand
  - Template contains placeholder blocks with various styling options

## Environments
- Preview: http://main--refdemoeds--aemxsc.aem.page/
- Live: http://main--refdemoeds--aemxsc.aem.live/

## Documentation
[Ref Demo 2.0](https://adobe.com/go/refdemo) 

## Authoring
Content is authored in [Document Authoring (da.live)](https://da.live), not AEM Crosswalk/Universal Editor. Use the sidekick's "Edit" action, or open the site directly at `https://da.live/edit#/{org}/{site}/{path}`.

## Installation
1. Use the "Use This Template" option in this repository to create your own repository.
2. Connect the repository to your da.live org/site (see `.migration/project.json` for the current org/site mapping).
