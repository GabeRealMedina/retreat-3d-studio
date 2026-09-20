#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { BlenderTransport } from "./transport.js";
import { createRetreatServer } from "./retreat.js";

const blender = new BlenderTransport();
const server = createRetreatServer(blender);
server.server.onclose = () => { void blender.close(); };
const shutdown = async () => { await blender.close(); await server.close(); };
process.once("SIGINT", () => { void shutdown(); });
process.once("SIGTERM", () => { void shutdown(); });
await server.connect(new StdioServerTransport());
