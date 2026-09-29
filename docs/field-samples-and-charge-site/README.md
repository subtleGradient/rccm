# Field Samples & Electric Charge publication

[Public site](https://field-samples-and-charge.subtlegradient.chatgpt.site)

The authoring document is [`../field-samples-and-charge.html`](../field-samples-and-charge.html).
Run `python3 docs/field-samples-and-charge-site/export.py` from the RCCM root to
export its public copy to the ignored `.sites/field-samples-and-charge/`
checkout. That directory has its own Git history for Sites publication.

The exporter retains the eleven inline SVG figures and replaces local
references with verified public destinations. It publishes one static file,
`dist/index.html`, and does not include manuscripts or learning journals.
The local companion that has no public copy stays linked only in the local
authoring document. No build step, JavaScript framework, database or runtime
secret is required.

The canonical site identity is recorded in `.openai/hosting.json` here and
copied into the publication checkout. Reuse it for every subsequent version.
Commit and push that checkout's exact source, then package `.openai/hosting.json`
and `dist/index.html` from the pushed commit, save the version and deploy it.
Preserve the explicitly requested public audience.
