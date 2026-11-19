# Tools and integrations

## Roblox Studio (2026-10-23)
- This cloud session can't reach Studio on Xavier's PC. There is an official Roblox Studio MCP server you install on the
  computer next to the Claude desktop app; with this chat linked to that computer, Claude could build / edit in Studio.
  Recording would still be done in Studio (Moon Animator etc.), a different pipeline from ours.
- Sources: [Roblox Studio MCP server (official)](https://mcp.so/servers/studio-rust-mcp-server),
  [robloxstudio-mcp (community)](https://glama.ai/mcp/servers/@boshyxd/robloxstudio-mcp/blob/a7a918df2bd92027177c4893462925ee737a5635/studio-plugin/INSTALLATION.md)

## Voice
- Xavier records the Zack-D voice himself (files "Zack-D-Films-..."); the trained AI voice was judged flat and slow
  (2026-11-10). tools/voice.py aligns his take.

## Textures
- Poly Haven (tools/polyhaven.py), Normal GL, 1K/2K; code-made textures look stylised.
