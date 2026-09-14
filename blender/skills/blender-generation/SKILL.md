---
name: blender-generation
description: The shared credit workflow for generated assets — live model and tool contracts, non-spending estimate then submission, polling, import, normalization, and capability checks.
---

# Generation — the shared credit workflow

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

Generation spends the signed-in user's credits. This module is the
shared workflow for everything marked `[GEN]` in the Scene Passport;
`blender-hdri` and `blender-pbr` add media-specific rules on top
of it, never instead of it. `blender-greybox` applies when the requested
deliverable is a greybox or motion reference. Whether an asset
is `[BLOCK]` or `[GEN]` is recorded under the construction routing in
`blender-scene`; the provider and cost checks below precede any spend.

## Provider capability and cost

This local Blender server has no model catalog, estimate, generation, polling
or download tools. Use an already connected Higgsfield service and its
installed generation guidance. Do not infer a callable provider from a name
in this module, or make provider HTTP calls inside bl_execute.

Before spending, inspect only the provider operations this asset needs:

1. Read its advertised catalog and tool schemas. Model ids below are routing
   hints only. A catalog of names does not establish parameter support;
   include_schema, params and media fields are valid only if advertised.
2. Establish a supported submission, status/result retrieval and local
   consumption route. Source files must be accessible on the Blender machine.
   If a required route is missing, report it and continue independent work.
3. Obtain a non-spending estimate for the effective model, inputs and quality
   settings, including cost-affecting defaults. Use real references unless
   the estimator explicitly supports placeholders. If cost cannot be
   established, do not submit a paid job to discover it.
4. Report the asset, model, settings and estimated cost. The user's explicit
   Generated/Hybrid request authorizes the covered assets: submit without a
   redundant confirmation when the estimate is within the stated budget.
   Blockout requests authorize no generation; an exceeded budget stops spend.

A missing bl_estimate_generation is not itself a blocker if the connected
provider has a supported equivalent. Its actual schema and job contract own
provider calls; local bl_job_status tracks Blender commands, not generation.

## Blender-first model defaults

- Unclear image-model choice → `image_auto`.
- Detailed generated material, texture source, environment map, or
  composition-preserving restyle → `gpt_image_2`.
- Text-to-3D → pick among the live text-to-3D models by requested
  topology/PBR support.
- One image to 3D → a live single-image model supported by the wrapper's
  actual media fields. Do not assume a backend field such as
  `image_references` is accepted where the wrapper takes `image_url` or
  `image_path`.
- Multiple ordered views → a multiview-to-3D model, preserving
  front/back/left/right order.
- Unclear video-model choice → ask about
  quality, speed, audio, and reference needs; silently picking the most
  expensive studio chain is not a default.
- A normal Blender texture/environment request never routes through a
  marketing, identity, or preset app chain just because the catalog lists
  one.

## Prompt and proxy

- A measured proxy stays in place before generation.
- One asset per prompt: identity, proportions, material intent, topology/use
  intent, explicit exclusions.
- For image-to-3D, a clean source in the intended view without irrelevant
  background.
- Texture/PBR/quality options only when the passport needs them — higher
  settings can change cost.

## 3D intake rules

- Multiple images: same object, clean background, consistent scale and
  lighting, useful angle coverage, deterministic order.
- The Blender proxy survives until the generated asset passes scale,
  silhouette, material, and camera-read audits.
- Rigging/remesh job types may require public model URLs; a private media id
  is not a URL and pretending otherwise fails.
- If the job's media shape cannot be expressed by the available typed
  submission tool, report the connector capability gap — do not stuff paths
  into arbitrary `params`.

## Submit, poll, import

1. Submit through the connected provider's matching tool. Supply an
   idempotency key only if its schema and documented deduplication support
   one. Do not automatically retry an uncertain submission; recover the
   existing job through the provider's status/history route. If it cannot
   be reconciled, report uncertainty instead of creating another paid job.
2. Record the job id, model, estimate and effective parameters. Poll that
   job at reasonable intervals; slow generation is not grounds to duplicate it.
3. Retrieve the completed result with an available provider/download route.
   Keep the source URL/job id and verify the downloaded file is readable
   on the Blender machine. A host-side file in a separate sandbox is not
   automatically a local Blender path.
4. For 3D, call local bl_import_model with its required absolute local `path`
   and a supported file format; never pass a URL or job id as that path.
   Images go through blender-hdri or blender-pbr and their local consumers.
   Persist video through the connected host's available download route.
5. Retain the proxy until the imported asset passes its audits. If generation
   completed but transfer/import failed, report completed-but-not-imported
   with the job id; do not regenerate the asset to repair a download problem.

Do not advertise cancellation unless the provider exposes it. A successful
submission or download does not prove that a World, material or scene changed.

## Normalize the imported asset

Inspect with `bl_get_scene_summary` and `bl_get_object`, then:

- group and rename imports semantically;
- correct scale in metres, orientation, location, origin;
- parent into the intended collection/rig;
- inspect mesh density, normals, materials, texture links, bounding box;
- fit the approved proxy footprint without distorting critical proportions;
- keep provenance for the final report.

Structural and camera-view checks come before deleting or hiding the proxy.
A completed job is not an approved scene asset until it passes them.

## Selection report

Before the immediate submission, record:

- user intent and the Blender consumer;
- chosen `job_type` and why it beats the nearest alternative;
- exact live-schema parameters and reference count/type;
- expected output and follow-up tool;
- estimated credits.

After completion, keep job id, model id, parameters, result path/URL, and
which Blender object/material/World/shot consumed it.
