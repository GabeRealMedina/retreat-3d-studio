# Release fnf-blender-mcp

Run commands from this `blender/` directory. Its package and lockfile are independent of After Effects.

1. Run `npm ci`, `npm test`, `npm run typecheck`, `npm run test:package`, and `test:live` with a real `BLENDER_EXECUTABLE` when available.
2. Version 0.2.1 bundles the modular skills from PR #15. Verify that it is unpublished with `npm view fnf-blender-mcp versions --json`. Never overwrite an existing npm version; bump both manifests for subsequent releases.
3. Keep README.md, skills/use-blender and the fnf-mcp-server command bundle on `fnf-blender-mcp@latest`; preserve historical migration versions. Review migration instructions for removed commands and tools.
4. Merge the source changes and version metadata into `main`, check out its exact commit in a clean worktree, rerun the checks, then run `npm pack --json`, review the contents, then publish the reviewed archive with `npm publish ./fnf-blender-mcp-0.2.1.tgz --access public --registry=https://registry.npmjs.org/` when publication is authorized.
5. Verify the public version and checksum and test a fresh registry installation. Publish the package before deploying the fnf-mcp-server instructions that require it.

Merging the source MR does not publish npm. Version 0.1.0 still requires the old add-on; it is not a fallback for 0.2.0 setup. New clients need a refreshed configuration containing BLENDER_EXECUTABLE. Existing desktop files and add-ons are not removed by this release.
