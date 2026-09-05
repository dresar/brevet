import type { Modul } from '@/lib/module-types';

// ============================================================
// DJP LOGO — ENCODED AS BASE64 DATA URI (FIXED, IMMUTABLE)
// Source: Official DJP Logo Colored (zonalogo.com)
// This ensures Claude / ChatGPT sees the EXACT logo shape & colors,
// preventing it from inventing or deforming the DJP emblem.
// ============================================================
const DJP_LOGO_BASE64_SVG =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDczMSAzMDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM6c2VyaWY9Imh0dHA6Ly93d3cuc2VyaWYuY29tLyIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoyOyI+CiAgICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgyLjc3MTE0NCwwLDAsMi43Njg4MDUsLTkzMy45MzA4NTQsLTIwMy4yODU2NDgpIj4KICAgICAgICA8Zz4KICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICA8Zz4KICAgICAgICAgICAgICAgICAgICA8Y2xpcFBhdGggaWQ9Il9jbGlwMSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zNjMuOTEsNzMuNDJDMzQ5LjA2LDczLjQyIDMzNy4wMiw4NS40NiAzMzcuMDIsMTAwLjMxTDMzNy4wMiwxMjcuMkMzMzcuMDIsMTI3LjIgMzM3LjYzLDEyMS4yOCAzMzguNTIsMTE4LjM1QzM0Mi4xOCwxMDcuODUgMzUyLjE2LDEwMC4zMSAzNjMuOTEsMTAwLjMxTDQxOC4yOSwxMDAuMzFDNDMwLjA0LDEwMC4zMSA0NDAuMDIsMTA3Ljg1IDQ0My42OCwxMTguMzVDNDQ0LjU3LDEyMS4yOCA0NDUuMTgsMTI3LjIgNDQ1LjE4LDEyNy4yTDQ0NS4xOCwxMDAuMzFDNDQ1LjE4LDg1LjQ2IDQzMy4xNCw3My40MiA0MTguMjksNzMuNDJMMzYzLjkxLDczLjQyWiIvPgogICAgICAgICAgICAgICAgICAgIDwvY2xpcFBhdGg+CiAgICAgICAgICAgICAgICAgICAgPGcgY2xpcC1wYXRoPSJ1cmwoI19jbGlwMSkiPgogICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCB4PSIzMzcuMDIiIHk9IjczLjQyIiB3aWR0aD0iMTA4LjE2IiBoZWlnaHQ9IjUzLjc4IiBzdHlsZT0iZmlsbDp1cmwoI19MaW5lYXIyKTsiLz4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8Zz4KICAgICAgICAgICAgICAgICAgICA8Y2xpcFBhdGggaWQ9Il9jbGlwMyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zOTEuNCw3My40MkMzOTEuNCw3My40MiAzOTcuMzIsNzQuMDMgNDAwLjI1LDc0LjkyQzQxMC43NSw3OC41OCA0MTguMjksODguNTYgNDE4LjI5LDEwMC4zMUw0MTguMjksMTU0LjY5QzQxOC4yOSwxNjYuNDQgNDEwLjc1LDE3Ni40MiA0MDAuMjUsMTgwLjA4QzM5Ny4zMiwxODAuOTcgMzkxLjQsMTgxLjU4IDM5MS40LDE4MS41OEw0MTguMjksMTgxLjU4QzQzMy4xNCwxODEuNTggNDQ1LjE4LDE2OS41NCA0NDUuMTgsMTU0LjY5TDQ0NS4xOCwxMDAuMzFDNDQ1LjE4LDg1LjQ2IDQzMy4xNCw3My40MiA0MTguMjksNzMuNDJMMzkxLjQsNzMuNDJaIi8+CiAgICAgICAgICAgICAgICAgICAgPC9jbGlwUGF0aD4KICAgICAgICAgICAgICAgICAgICA8ZyBjbGlwLXBhdGg9InVybCgjX2NsaXAzKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHg9IjM5MS40IiB5PSI3My40MiIgd2lkdGg9IjUzLjc4IiBoZWlnaHQ9IjEwOC4xNiIgc3R5bGU9ImZpbGw6dXJsKCNfTGluZWFyNCk7Ii8+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICAgICAgPGNsaXBQYXRoIGlkPSJfY2xpcDUiPgogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNDQzLjY4LDEzNi42NUM0NDAuMDIsMTQ3LjE1IDQzMC4wNCwxNTQuNjkgNDE4LjI5LDE1NC42OUwzNjMuOTEsMTU0LjY5QzM1Mi4xNiwxNTQuNjkgMzQyLjE4LDE0Ny4xNSAzMzguNTIsMTM2LjY1QzMzNy42MywxMzMuNzIgMzM3LjAyLDEyNy44IDMzNy4wMiwxMjcuOEwzMzcuMDIsMTU0LjY5QzMzNy4wMiwxNjkuNTQgMzQ5LjA2LDE4MS41OCAzNjMuOTEsMTgxLjU4TDQxOC4yOSwxODEuNThDNDMzLjE0LDE4MS41OCA0NDUuMTgsMTY5LjU0IDQ0NS4xOCwxNTQuNjlMNDQ1LjE4LDEyNy44QzQ0NS4xOCwxMjcuOCA0NDQuNTcsMTMzLjcyIDQ0My42OCwxMzYuNjUiLz4KICAgICAgICAgICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgICAgICAgICAgICAgIDxnIGNsaXAtcGF0aD0idXJsKCNfY2xpcDUpIj4KICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgeD0iMzM3LjAyIiB5PSIxMjcuOCIgd2lkdGg9IjEwOC4xNiIgaGVpZ2h0PSI1My43OCIgc3R5bGU9ImZpbGw6dXJsKCNfTGluZWFyNik7Ii8+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICAgICAgPGNsaXBQYXRoIGlkPSJfY2xpcDciPgogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzM4LjUyLDExOC4zNUMzMzcuNjMsMTIxLjI4IDMzNy4wMiwxMjcuMiAzMzcuMDIsMTI3LjJMMzM3LjAyLDE1NC42OUMzMzcuMDIsMTY5LjU0IDM0OS4wNiwxODEuNTggMzYzLjkxLDE4MS41OEwzOTAuOCwxODEuNThDMzkwLjgsMTgxLjU4IDM4NC44OCwxODAuOTcgMzgxLjk1LDE4MC4wOEMzNzEuNDUsMTc2LjQyIDM2My45MSwxNjYuNDQgMzYzLjkxLDE1NC42OUwzNjMuOTEsMTAwLjMxQzM1Mi4xNiwxMDAuMzEgMzQyLjE4LDEwNy44NSAzMzguNTIsMTE4LjM1Ii8+CiAgICAgICAgICAgICAgICAgICAgPC9jbGlwUGF0aD4KICAgICAgICAgICAgICAgICAgICA8ZyBjbGlwLXBhdGg9InVybCgjX2NsaXA3KSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHg9IjMzNy4wMiIgeT0iMTAwLjMxIiB3aWR0aD0iNTMuNzgiIGhlaWdodD0iODEuMjciIHN0eWxlPSJmaWxsOnVybCgjX0xpbmVhcjgpOyIvPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8Zz4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik01MDYuODYsMTU3LjM5TDQ5NC45MywxNTcuMzlMNDk0LjkzLDE1MS4wMUM0OTMuNDIsMTUyLjg1IDQ5MS44NywxNTQuMjcgNDkwLjI4LDE1NS4yN0M0ODguNjksMTU2LjI3IDQ4Ni45OCwxNTYuOTkgNDg1LjE2LDE1Ny40M0M0ODMuMzQsMTU3Ljg3IDQ4MS4yNiwxNTguMDkgNDc4Ljk0LDE1OC4wOUM0NzUuOTUsMTU4LjA5IDQ3My4xNywxNTcuNjEgNDcwLjYsMTU2LjY1QzQ2OC4wMiwxNTUuNjkgNDY1Ljg4LDE1NC40MSA0NjQuMTcsMTUyLjhDNDYyLjI3LDE1MC45MiA0NjAuODMsMTQ4LjYzIDQ1OS44NCwxNDUuOTNDNDU4Ljg1LDE0My4yMyA0NTguMiwxNDAuNDIgNDU3Ljg5LDEzNy41MUM0NTcuNTgsMTM0LjYgNDU3LjQyLDEzMS4yNiA0NTcuNDIsMTI3LjUxQzQ1Ny40MiwxMjMuNzUgNDU3LjU3LDEyMC40MyA0NTcuODksMTE3LjUzQzQ1OC4yLDExNC42NCA0NTguODUsMTExLjg1IDQ1OS44NCwxMDkuMTZDNDYwLjgzLDEwNi40OCA0NjIuMjcsMTA0LjIgNDY0LjE3LDEwMi4zMkM0NjUuODgsMTAwLjYzIDQ2OC4wMSw5OS4zMiA0NzAuNTcsOTguMzhDNDczLjEzLDk3LjQ0IDQ3NS44OCw5Ni45NyA0NzguODMsOTYuOTdDNDgyLjIsOTYuOTcgNDg1LjE2LDk3LjQ3IDQ4Ny43LDk4LjQ3QzQ5MC4yNCw5OS40NyA0OTIuNTcsMTAxLjIyIDQ5NC43MSwxMDMuNzNMNDk0LjcxLDczLjU2TDUwNi44Niw3My41Nkw1MDYuODYsMTU3LjM5Wk00OTQuNywxMjcuNTJDNDk0LjcsMTIzLjQ2IDQ5NC4zOSwxMjAuMDEgNDkzLjc3LDExNy4xNkM0OTMuMTUsMTE0LjMxIDQ5MS45MiwxMTIuMDMgNDkwLjA4LDExMC4zM0M0ODguMjQsMTA4LjYzIDQ4NS42MSwxMDcuNzcgNDgyLjIsMTA3Ljc3QzQ3OC43NSwxMDcuNzcgNDc2LjA5LDEwOC42MyA0NzQuMjMsMTEwLjM1QzQ3Mi4zNywxMTIuMDcgNDcxLjEzLDExNC4zNSA0NzAuNTEsMTE3LjE4QzQ2OS44OSwxMjAuMDEgNDY5LjU4LDEyMy40NiA0NjkuNTgsMTI3LjUyQzQ2OS41OCwxMzEuNTggNDY5Ljg5LDEzNS4wMyA0NzAuNTEsMTM3Ljg4QzQ3MS4xMywxNDAuNzMgNDcyLjM3LDE0My4wMyA0NzQuMjMsMTQ0Ljc3QzQ3Ni4wOSwxNDYuNTEgNDc4Ljc0LDE0Ny4zOCA0ODIuMiwxNDcuMzhDNDg3LjE2LDE0Ny4zOCA0OTAuNDksMTQ1LjYzIDQ5Mi4xNywxNDIuMTNDNDkzLjg2LDEzOC42MyA0OTQuNywxMzMuNzYgNDk0LjcsMTI3LjUyIiBzdHlsZT0iZmlsbDpyZ2IoMzEsNDcsOTUpO2ZpbGwtcnVsZTpub256ZXJvOyIvPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTYwMC44MSwxMjcuNDlDNjAwLjgxLDEzMS4yNSA2MDAuNjYsMTM0LjU4IDYwMC4zNSwxMzcuNDlDNjAwLjA0LDE0MC40IDU5OS4zNywxNDMuMjIgNTk4LjM0LDE0NS45NEM1OTcuMzEsMTQ4LjY2IDU5NS44NywxNTAuOTQgNTk0LjAxLDE1Mi43OEM1OTIuMzQsMTU0LjQzIDU5MC4yMywxNTUuNzIgNTg3LjY3LDE1Ni42NkM1ODUuMTEsMTU3LjYgNTgyLjM0LDE1OC4wNyA1NzkuMzUsMTU4LjA3QzU3Ni4wMiwxNTguMDcgNTczLjA2LDE1Ny41NCA1NzAuNDgsMTU2LjQ5QzU2Ny45LDE1NS40NCA1NjUuNTksMTUzLjcgNTYzLjUzLDE1MS4yOUw1NjMuNTMsMTgxLjUzTDU1MS4zOCwxODEuNTNMNTUxLjM4LDk3LjcxTDU2My4zLDk3LjcxTDU2My4zLDEwNC4wN0M1NjUuNTEsMTAxLjQxIDU2Ny44Niw5OS41NiA1NzAuMzcsOTguNTJDNTcyLjg3LDk3LjQ4IDU3NS44Myw5Ni45NiA1NzkuMjQsOTYuOTZDNTgyLjI2LDk2Ljk2IDU4NS4wOCw5Ny40NCA1ODcuNyw5OC40QzU5MC4zMiw5OS4zNiA1OTIuNDIsMTAwLjY2IDU5NC4wMSwxMDIuMzFDNTk1Ljg3LDEwNC4xNSA1OTcuMzEsMTA2LjQyIDU5OC4zNCwxMDkuMTJDNTk5LjM3LDExMS44MiA2MDAuMDQsMTE0LjYyIDYwMC4zNSwxMTcuNTFDNjAwLjY1LDEyMC40MSA2MDAuODEsMTIzLjczIDYwMC44MSwxMjcuNDlNNTg4LjY1LDEyNy41MkM1ODguNjUsMTIzLjQ2IDU4OC4zNCwxMjAuMDEgNTg3LjcyLDExNy4xNkM1ODcuMSwxMTQuMzEgNTg1Ljg3LDExMi4wMyA1ODQuMDMsMTEwLjMzQzU4Mi4xOSwxMDguNjMgNTc5LjU2LDEwNy43NyA1NzYuMTUsMTA3Ljc3QzU3Mi43LDEwNy43NyA1NzAuMDQsMTA4LjYzIDU2OC4xOCwxMTAuMzVDNTY2LjMyLDExMi4wNyA1NjUuMDgsMTE0LjM1IDU2NC40NiwxMTcuMThDNTYzLjg0LDEyMC4wMSA1NjMuNTMsMTIzLjQ2IDU2My41MywxMjcuNTJDNTYzLjUzLDEzMS41OCA1NjMuODQsMTM1LjAzIDU2NC40NiwxMzcuODhDNTY1LjA4LDE0MC43MyA1NjYuMzIsMTQzLjAzIDU2OC4xOCwxNDQuNzdDNTcwLjA0LDE0Ni41MSA1NzIuNywxNDcuMzggNTc2LjE1LDE0Ny4zOEM1ODEuMTEsMTQ3LjM4IDU4NC40NCwxNDUuNjMgNTg2LjEyLDE0Mi4xM0M1ODcuODEsMTM4LjYzIDU4OC42NSwxMzMuNzYgNTg4LjY1LDEyNy41MiIgc3R5bGU9ImZpbGw6cmdiKDMxLDQ3LDk1KTtmaWxsLXJ1bGU6bm9uemVybzsiLz4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik01MzUuMzIsMTY1LjI3QzUzNS4zMiwxNzAuMSA1MzMuOTMsMTc0LjA2IDUzMS4xNiwxNzcuMTRDNTI4LjM5LDE4MC4yMyA1MjQuMjUsMTgxLjc3IDUxOC43NSwxODEuNzdMNTA5LjcxLDE4MS43N0w1MDkuNzEsMTcxLjU0TDUxNi42LDE3MS41NEM1MTguOTYsMTcxLjU0IDUyMC42NSwxNzAuOTcgNTIxLjY2LDE2OS44NEM1MjIuNjcsMTY4LjcxIDUyMy4xNywxNjYuOTUgNTIzLjE3LDE2NC41OEw1MjMuMTcsOTcuNzFMNTM1LjMyLDk3LjcxTDUzNS4zMiwxNjUuMjdaIiBzdHlsZT0iZmlsbDpyZ2IoMzEsNDcsOTUpO2ZpbGwtcnVsZTpub256ZXJvOyIvPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTUzNy4xMyw4MS4zMkM1MzcuMTMsODMuNDMgNTM2LjMzLDg1LjI1IDUzNC43NSw4Ni43OEM1MzMuMTYsODguMzEgNTMxLjMyLDg5LjA4IDUyOS4yMyw4OS4wOEM1MjcuMTcsODkuMDggNTI1LjM1LDg4LjI5IDUyMy43Niw4Ni43MkM1MjIuMTcsODUuMTUgNTIxLjM3LDgzLjM1IDUyMS4zNyw4MS4zMkM1MjEuMzcsNzkuMjEgNTIyLjE0LDc3LjM5IDUyMy43LDc1Ljg2QzUyNS4yNSw3NC4zMyA1MjcuMDksNzMuNTYgNTI5LjIzLDczLjU2QzUzMS40LDczLjU2IDUzMy4yNiw3NC4zMSA1MzQuODEsNzUuOEM1MzYuMzUsNzcuMjkgNTM3LjEzLDc5LjE0IDUzNy4xMyw4MS4zMiIgc3R5bGU9ImZpbGw6cmdiKDMxLDQ3LDk1KTtmaWxsLXJ1bGU6bm9uemVybzsiLz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iX0xpbmVhcjIiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxMDguMTU2NTYxLDAsMCwxMDguMTU2NTYxLDMzNy4wMTk0OTIsMTAwLjMwMzIyNSkiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1MiwyMzAsMCk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjAuMDQiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigyNTIsMjMwLDApO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIwLjI0IiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDIwMSwyNSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxOTcsMTQ1LDQ0KTtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJfTGluZWFyNCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAsMTA5LjE5NzM5LC0xMDkuMTk3MzksMCw0MTguMjkyNjEzLDcyLjY0MjM1NCkiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1MiwyMzAsMCk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjAuMDQiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigyNTIsMjMwLDApO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIwLjQ0IiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDIwMSwyNSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxOTcsMTQ1LDQ0KTtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJfTGluZWFyNiIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC0xMDkuNDA2MDI3LDAsLTAsLTEwOS40MDYwMjcsNDQ1LjQzMjQ3MywxNTQuNjgyNTMxKSI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoNDAsNTgsMTM0KTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMC4wOCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDM4LDU0LDEyMSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjAuMjQiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigzMyw0Niw5NSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjAuNTMiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigyMywzMSw2Nyk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjAuNjkiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxOCwyNSw1Nyk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjAuODUiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxNSwyMSw1MSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMywxOSw0OSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMywxOSw0OSk7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PgogICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iX0xpbmVhcjgiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgwLC0xMDkuODE1NDQ2LDEwOS44MTU0NDYsMCwzNjMuOTA1NjU0LDE4My4wNjc2ODMpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYig0MCw1OCwxMzQpO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIwLjA4IiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMzgsNTQsMTIxKTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMC4yNCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDMzLDQ2LDk1KTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMC41MyIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDIzLDMxLDY3KTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMC42OSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDE4LDI1LDU3KTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMC44NSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDE1LDIxLDUxKTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDEzLDE5LDQ5KTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDEzLDE5LDQ5KTtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+Cjwvc3ZnPgo=';

/**
 * Builds a Master Super Prompt for Claude / ChatGPT that sets up TikTok Carousel Prompt Generation.
 *
 * UPGRADE v2 (2026-08) — Key improvements:
 * - Includes EXACT DJP Logo as base64 data URI, so Claude cannot invent/deform the shape.
 * - Advanced compositional grid rules (12-column editorial grid, golden ratio proportions).
 * - Cinematic lighting spec (Rembrandt 45° key-light, large area soft-box fill, no specular blowout).
 * - Detailed typography hierarchy: font family, weight, px size, letter-spacing, line-height.
 * - Strict negative-space mapping to prevent crowded layouts.
 * - DJP logo lock-in: MUST replicate the exact 4-quadrant interlocking shield shape from the base64 image above.
 * - Border / frame styling: thin 1px gold accent rule framing the layout, NOT a thick ornate border.
 */
export function buildTikTokSequentialSuperPrompt(
  modulInput: Modul | Modul[],
  targetBatch: number = 0 // 0 = All Batches Master Prompt, 1-10 = Focused Single-Batch Prompt
): string {
  const moduleList: Modul[] = Array.isArray(modulInput) ? modulInput : [modulInput];

  // Build 100% complete, un-truncated raw material string for all included modules
  const fullModulesData = moduleList
    .map((mObj, mIdx) => {
      const m = mObj.modul;
      return `============================================================
📚 DATA MODUL ${mIdx + 1}: [KODE: ${m.kode}] ${m.judul.toUpperCase()}
============================================================
Ringkasan: ${m.ringkasan || '-'}
Kategori: ${m.kategori || 'Perpajakan'} | Tingkat: ${m.tingkat_kesulitan || 'pemula'} | Estimasi: ${m.estimasi_menit || 120} Menit

RAW CONTENT DATA 100% UTUH (TANPA SINGKATAN & TANPA PEMOTONGAN):
${JSON.stringify(m, null, 2)}`;
    })
    .join('\n\n');

  const moduleHeaderTitles = moduleList.map((mObj) => `[${mObj.modul.kode}] ${mObj.modul.judul}`).join(', ');

  const batchMappingDescriptions: Record<number, string> = {
    1: 'BATCH 1 (SLIDE 1-10): Sampul Modul Utama, Ketentuan Umum Perpajakan (KUP), Hook Kontroversial, Definisi Resmi & Hakikat Hukum Pajak, Mitos vs Fakta Utama, & Dasar Hukum UUD 1945 / UU KUP / UU HPP.',
    2: 'BATCH 2 (SLIDE 11-20): Subjek & Objek Pajak, Syarat NPWP/NIK, & Analogi Simpel Kehidupan Sehari-hari.',
    3: 'BATCH 3 (SLIDE 21-30): Rumus Dasar Perhitungan, Tarif TER PPh 21 / PPN 12% / PPh Final 0.5%, & Logika Matematika Pajak.',
    4: 'BATCH 4 (SLIDE 31-40): Simulasi Perhitungan Kasus Nyata Pak Budi (Karyawan / Freelancer TER PPh 21 / PTKP / PPh 25).',
    5: 'BATCH 5 (SLIDE 41-50): Simulasi Perhitungan Kasus Nyata Bu Siti (UMKM / Omset 500jt Bebas Pajak / PP 55/2022 / PPN 12%).',
    6: 'BATCH 6 (SLIDE 51-60): Instant Cheat Sheet, Tabel TER/PTKP 2026, & Rangkuman Rumus Cepat Hafal Siap Salin.',
    7: "BATCH 7 (SLIDE 61-70): Dos & Don'ts, Tanggal Jatuh Tempo Pembayaran/Pelaporan, & Peringatan Denda Sanksi Coretax DJP 2026.",
    8: 'BATCH 8 (SLIDE 71-80): Studi Kasus Spesifik, Pengecualian Objek Pajak, & Fasilitas Bebas Pajak.',
    9: 'BATCH 9 (SLIDE 81-90): FAQ & 10 Pertanyaan Tersulit Pembaca TikTok (Menjawab Kebingungan Umum).',
    10: 'BATCH 10 (SLIDE 91-100): Master Rangkuman Raksasa Modul + Final Call to Action (CTA) & Sertifikasi Brevet AB.',
  };

  const startSlideNum = targetBatch > 0 ? (targetBatch - 1) * 10 + 1 : 1;
  const endSlideNum = targetBatch > 0 ? targetBatch * 10 : 100;

  const batchScopeInstruction =
    targetBatch > 0
      ? `🎯 FOKUS KHUSUS PEMBUATAN: BATCH ${targetBatch} SAJA (SLIDE ${startSlideNum} s/d SLIDE ${endSlideNum})
   📌 CAKUPAN MATERI BATCH ${targetBatch}: ${batchMappingDescriptions[targetBatch] || ''}
   - Hasilkan BATCH ${targetBatch} secara utuh dengan 10 Slide (Slide ${startSlideNum} s/d Slide ${endSlideNum}). DILARANG MENGULANG MATERI DARI BATCH LAIN (ANTI-DUPLIKASI)!`
      : `🎯 FOKUS PEMBUATAN: SELURUH 10 BATCH (BATCH 1 s/d BATCH 10 - TOTAL 100 SLIDE KUMULATIF)
   - Anda WAJIB membuat SELURUH BATCH 1 s/d BATCH 10 secara terstruktur dari Slide 1 hingga Slide 100 tanpa duplikasi antar-batch.`;

  return `============================================================
🚨 MASTER SYSTEM INSTRUCTION: ULTRA-PROFESSIONAL TAX EDUCATION EDITORIAL CAROUSEL JSON GENERATOR v3 🚨
============================================================
Halo Claude / ChatGPT! Anda adalah Senior Art Director, Lead Editorial Infographic Designer, & Master Educational Content Strategist Spesialis Carousel TikTok Edukasi Perpajakan Indonesia (Brevet AB).
Tugas utama Anda adalah membongkar data kurikulum modul utuh di bawah menjadi PAKET PROMPT VISUAL INFOGRAFIS TIKTOK dengan gaya **Modern Tax Education Editorial**—bersih, tegas, sarat elemen visual infografis profesional (Bento grid cards, split comparison, formula math box, step-by-step pipeline, data table, calendar milestone, compliance shield, dan 3D matte props), serta langsung terbaca dalam 1 detik di smartphone.

${batchScopeInstruction}

============================================================
🔒 LOGO DJP RESMI — DATA URI BASE64 (IMMUTABLE - WAJIB DIREPLIKASI PERSIS)
============================================================
Logo DJP resmi TELAH DISERTAKAN DI BAWAH INI sebagai base64 encoded SVG agar Anda tahu PERSIS bentuk aslinya.
PERHATIKAN dengan seksama dan replikasi dengan AKURAT dalam setiap deskripsi visual prompt:

${DJP_LOGO_BASE64_SVG}

ANALISIS LOGO DJP DI ATAS:
• Bentuk: 4 kuadran geometris rounded saling mengunci membentuk shield (perisai) persegi panjang simetris (BUKAN lingkaran / BUKAN oval).
• Kuadran Atas-Kanan & Atas-Kiri bagian atas: Warna EMAS KUNING gradient (#FCE600 → #FFC919 → #C5912C).
• Kuadran Bawah-Kiri & Bawah-Kanan bagian bawah: Warna BIRU TUA NAVY DJP gradient (#283A86 → #1F2F5F → #0D1331).
• Di kanan lambang: Tipografi tebal navy 'djp' dengan huruf kecil, kemudian di bawahnya 'DIREKTORAT JENDERAL PAJAK'.
• 🚫 DILARANG MENGGAMBAR LOGO DJP BERBENTUK LINGKARAN ATAU OVAL — bentuknya adalah SHIELD/PERISAI PERSEGI ROUNDED!
• 🚫 DILARANG MEMBALIK WARNA — Emas selalu di atas, Navy selalu di bawah pada emblem shield.

============================================================
🚨 ATURAN MUTLAK NOMOR 1 (MANDATORY RULE #1): 1 PROMPT = 1 SLIDE GAMBAR VERTIKAL 4:5 (1080x1350 px) TERPISAH!
============================================================
1. 🚫 DILARANG KERAS MEMBUAT PROMPT 10 SLIDE DALAM SATU CANVAS GAMBAR / POSTER GRID!
   - Setiap \`visual_prompt_en\` dan \`visual_prompt_id\` WAJIB secara eksplisit diawali dengan kalimat:
     "Single 4:5 vertical image ONLY (1080x1350 px) for Slide X (Do NOT render multiple slides or grid poster in one image canvas)..."

============================================================
🚫 LARANGAN MUTLAK TEXT LABEL METADATA INTERNAL:
============================================================
- 🚫 **DILARANG KERAS MENULISKAN FRASA KETERANGAN METADATA SEPERTI "JUDUL MODUL UTUH", "SLIDE 1", "HOOK UTAMA", ATAU LABEL STRUCTURAL LAINNYA KE DALAM GAMBAR!**
- Teks yang dirender pada gambar HANYA BOLEH Teks Judul Materi Asli (contoh: "KETENTUAN UMUM PERPAJAKAN (KUP)" atau "PAJAK ITU APA?"). DILARANG MENAMPILKAN KATA "JUDUL MODUL UTUH" PADA DESAIN GAMBAR!

============================================================
🏷️ ATURAN AREA KOSONG LOGO (POJOK KANAN ATAS - WAJIB DI SELURUH SLIDE 1 s/d 10)
============================================================
- **Pojok Kanan Atas (Top-Right Corner: x:880-1080px, y:0-200px)** di SELURUH SLIDE WAJIB SELALU DIBIARKAN KOSONG, BERSIH, POLOS.
- 🚫 **DILARANG MENGGAMBAR LINGKARAN, BADGE LOGO, ATAU TEKS APAPUN DI POJOK KANAN ATAS!**
- Area pojok kanan atas MURNI berupa background deep navy polos bersih (reserved empty negative space) untuk manual logo overlay nanti.

============================================================
🎨 SISTEM DESAIN PREMIUM & BLUEPRINT ELEMEN INFOGRAFIS (SLIDE 1 s/d 10)
============================================================
Setiap slide dalam 1 batch carousel memiliki peran visual dan format layout unik yang kaya elemen profesional, TIDAK BOLEH polos atau hanya teks saja!

Berikut adalah 10 BLUEPRINT ARSITEKTUR SLIDE yang WAJIB DITERAPKAN:

------------------------------------------------------------
📌 BLUEPRINT SLIDE 1: SAMPUL / COVER UTAMA BATCH
------------------------------------------------------------
• Fungsi: Hero visual cover yang provokatif dan membangun otoritas.
• Elemen Wajib:
  1. Header Bar: Logo DJP 4-Kuadran Shield (120×80px, kiri atas) + Teks "BREVET AB — BELAJAR PAJAK DARI DASAR" + Garis tipis 1px emas horizontal (y:160px). Kanan atas KOSONG POLOS.
  2. Pill Badge: "BATCH [X] · MODUL DASAR" border 1px emas.
  3. H1 Headline Raksasa: Pertanyaan provokatif / Hook materi utama (Inter ExtraBold 96px, putih, max 3 baris).
  4. H2 Sub-hook: 1 baris teks emas (#F59E0B) tajam.
  5. 3 Poin Bahasan: 3 baris teks pengantar dengan bullet point dot emas (#F59E0B).
  6. Stempel Bulat: Stempel emas circular "PAHAM KUP PAHAM PAJAK" dengan ikon checkmark.
  7. Objek 3D Matte: Tumpukan Buku UU KUP/HPP tegak bersampul navy & emas + Dokumen DJP formal dengan grafik chart + Kalkulator solar hitam di atas meja mahoni gelap.
  8. Footer Bar: Garis 1px emas + "BREVET AB — DASAR KUAT • PAHAM • LULUS".

------------------------------------------------------------
📌 BLUEPRINT SLIDE 2: MITOS vs FAKTA / PROBLEM CONFLICT (SPLIT BENTO DUAL-CARD)
------------------------------------------------------------
• Fungsi: Membongkar miskonsepsi umum masyarakat vs aturan resmi undang-undang.
• Elemen Wajib:
  1. Header Zone: Kategori H3 "MITOS VS FAKTA PAJAK" (Slate-400) + Judul H1 "JANGAN SALAH SANGKA!". Kanan atas KOSONG.
  2. Dual Bento Split Card:
     - Kartu Kiri (Mitos): Container slate gelap (#1E293B) bergaris merah tipis, badge merah "❌ MITOS SALAH", teks kesalahpahaman umum (misal: "Punya NPWP Langsung Wajib Bayar Pajak?").
     - Kartu Kanan (Fakta): Container navy (#0F172A) bergaris emas tipis (#F59E0B), badge emas "✅ FAKTA RESMI UU", teks fakta hukum UU (misal: "Penghasilan di Bawah PTKP Bebas Pajak!").
  3. Objek 3D Matte: Kaca Pembesar 3D Matte (Magnifying Glass) berbingkai emas mengarah ke klausul pasal UU + Dokumen Surat Tagihan Pajak (STP) resmi berstempel merah "PERIKSA FAKTA".
  4. Callout Pill: "Sanksi Bunga KUP UU HPP".
  5. Footer Bar standar Brevet AB.

------------------------------------------------------------
📌 BLUEPRINT SLIDE 3: STRUKTUR HUKUM & DIAGRAM ALUR (3-STEP CONNECTED PIPELINE)
------------------------------------------------------------
• Fungsi: Menjelaskan proses hukum atau hierarki konsep secara berurutan langkah demi langkah.
• Elemen Wajib:
  1. Header Zone: Kategori H3 "ALUR & DASAR HUKUM" + Judul H1 materi. Kanan atas KOSONG.
  2. 3-Step Process Pipeline Container: 3 kotak bento node horizontal/vertikal yang terhubung oleh garis konektor 1px emas dengan titik bercahaya:
     - Node 01: "1. Syarat Subjektif" (Badge bulat 01 emas + deskripsi ringkas).
     - Node 02: "2. Syarat Objektif" (Badge bulat 02 emas + deskripsi ringkas).
     - Node 03: "3. Kewajiban Lapor" (Badge bulat 03 emas + status aktif).
  3. Objek 3D Matte: Neraca Timbangan Keadilan 3D Matte (Minimalist Gold & Silver Scales of Justice) + Buku UU HPP tebal dengan pita pembatas buku emas + Clipboard dokumen checklist.
  4. Stempel: Stempel resmi "DASAR HUKUM 2026: UU NO. 7/2021".
  5. Footer Bar standar Brevet AB.

------------------------------------------------------------
📌 BLUEPRINT SLIDE 4: RUMUS MATEMATIKA & STRUKTUR TARIF (BIG FORMULA BREAKDOWN BOX)
------------------------------------------------------------
• Fungsi: Membedah rumus perhitungan pajak dengan jelas, mudah diingat, dan berdaya visual tinggi.
• Elemen Wajib:
  1. Header Zone: Kategori H3 "FORMULA PERHITUNGAN" + Judul H1 "RUMUS CEPAT PPh 21 / PPN". Kanan atas KOSONG.
  2. Prominent Math Formula Block: Box besar warna navy gelap dengan border 1px emas (#F59E0B), memuat rumus matematika pajak dengan format font bold monospace/Inter:
     \`[ PPh 21 = Penghasilan Bruto × Tarif TER (%) ]\`
     dengan highlight warna berbeda pada variabel pengurang dan tarif persentase.
  3. 2 Mini Data Cards di bawah rumus:
     - Card A: "Komponen Bruto (Gaji + Bonus)"
     - Card B: "Kategori TER (A / B / C berdasarkan PTKP)"
  4. Objek 3D Matte: Kalkulator Solar Finansial 3D Matte dengan layar digital angka tajam + Grafik Bar Chart 3D Mini bertingkat 5 level (5%, 15%, 25%, 30%, 35%) + Pensil arsitek klip emas di atas meja kayu gelap.
  5. Footer Bar standar Brevet AB.

------------------------------------------------------------
📌 BLUEPRINT SLIDE 5: SIMULASI KASUS NYATA (CASE STUDY & SALARY LEDGER SLIP)
------------------------------------------------------------
• Fungsi: Menerapkan rumus ke dalam studi kasus nyata Pak Budi (Karyawan) / Bu Siti (UMKM).
• Elemen Wajib:
  1. Header Zone: Kategori H3 "SIMULASI KASUS NYATA" + Judul H1 Studi Kasus. Kanan atas KOSONG.
  2. Persona Profile Badge: Kartu avatar siluet profesional "Pak Budi (Pegawai Swasta - Status K/1 - Gaji Rp 10 Juta/Bln)".
  3. Step-by-Step Ledger Calculation Card: Kartu slip perhitungan 3 baris terstruktur:
     - Baris 1: Gaji Bruto Bulanan = Rp 10.000.000
     - Baris 2: Kategori TER B (Tarif Efektif = 1,5%)
     - Baris 3 (Highlight Box Emas): Potongan PPh 21 Bulanan = Rp 150.000 / bulan.
  4. Objek 3D Matte: Slip Gaji Formal Pajak terlipat rapi dengan stempel cap basah + Cangkir kopi keramik matte elegan + Pena tanda tangan emas premium.
  5. Stempel: "VERIFIKASI CONTOH NYATA".
  6. Footer Bar standar Brevet AB.

------------------------------------------------------------
📌 BLUEPRINT SLIDE 6: TABEL MATRIKS & DATA GRID CHEAT-SHEET (HIGH-CONTRAST DATA TABLE)
------------------------------------------------------------
• Fungsi: Menyajikan tabel perbandingan, lapisan tarif progresif, atau matriks keputusan.
• Elemen Wajib:
  1. Header Zone: Kategori H3 "TABEL DATA & TARIF" + Judul H1 Matriks. Kanan atas KOSONG.
  2. High-Contrast Modern Data Grid (2x3 atau 3x3 Table):
     - Table Header: Background Slate/Navy lebih terang dengan border 1px emas (#F59E0B) (Kolom: Kategori | Rentang Penghasilan | Tarif TER).
     - Table Rows: Alternating rows dengan zebra background subtle, teks putih high-contrast, dan ikon checkmark emas pada baris rekomendasi.
  3. Floating Key Insight Callout Box di bawah tabel: "Tips: Cek PTKP terbaru untuk menentukan kategori TER yang tepat!".
  4. Objek 3D Matte: Folder dokumen arsip kulit hitam dengan emboss logo DJP emas + Kartu NPWP/NIK 3D matte tergeletak di atas meja.
  5. Footer Bar standar Brevet AB.

------------------------------------------------------------
📌 BLUEPRINT SLIDE 7: TIMELINE DEADLINE & JATUH TEMPO (CALENDAR ROADMAP & WARNING)
------------------------------------------------------------
• Fungsi: Memberikan kepastian tanggal penting pembayaran & pelaporan agar tidak terkena denda.
• Elemen Wajib:
  1. Header Zone: Kategori H3 "JATUH TEMPO & TANGGAL PENTING" + Judul H1 "CATAT TANGGAL INI!". Kanan atas KOSONG.
  2. Milestone Timeline Horizontal / Vertikal: Garis waktu dengan 4 titik milestone emas:
     - Tgl 10: Batas Setor PPh Masa
     - Tgl 15: Batas Setor PPN
     - Tgl 20: Batas Lapor SPT Masa
     - 31 Maret / 30 April: Batas Lapor SPT Tahunan Orang Pribadi / Badan.
  3. Alert Warning Box (Merah/Oranye Matte): Kotak peringatan "Denda Terlambat Lapor: SPT OP Rp 100.000 | SPT Badan Rp 1.000.000".
  4. Objek 3D Matte: Kalender Meja 3D Matte (Desk Calendar) dengan cincin emas melingkari tanggal deadline + Jam Pasir / Jam Meja Minimalis 3D Matte navy & emas.
  5. Footer Bar standar Brevet AB.

------------------------------------------------------------
📌 BLUEPRINT SLIDE 8: DO'S & DON'TS / PROTOKOL KEPATUHAN (DUAL-CARD CHECKLIST PROTOCOL)
------------------------------------------------------------
• Fungsi: Panduan praktis apa yang wajib dilakukan dan apa kesalahan fatal yang harus dihindari.
• Elemen Wajib:
  1. Header Zone: Kategori H3 "PROTOKOL KEPATUHAN" + Judul H1 "PANDUAN AMAN DARI DENDA". Kanan atas KOSONG.
  2. Stacked / Side-by-Side Dual Bento Cards:
     - Card Hijau/Emas: "3 KEWAJIBAN WAJIB (DO'S)" → 3 poin checklist dengan ikon check bulat emas (#F59E0B).
     - Card Merah/Oranye: "3 LARANGAN FATAL (DON'TS)" → 3 poin larangan dengan ikon silang bulat merah (#EF4444).
  3. Objek 3D Matte: Perisai Keamanan Pajak 3D Matte (Tax Security Shield) dengan emblem proteksi + Gembok Emas 3D Pengaman Data Coretax + Dokumen dengan stempel "COMPLIANCE VERIFIED".
  4. Footer Bar standar Brevet AB.

------------------------------------------------------------
📌 BLUEPRINT SLIDE 9: RANGKUMAN CEPAT 1 DETIK / TAKEAWAYS (3-CARD EXECUTIVE SUMMARY)
------------------------------------------------------------
• Fungsi: Rangkuman ringkas eksekutif sebelum masuk ke slide Call To Action.
• Elemen Wajib:
  1. Header Zone: Kategori H3 "RANGKUMAN 1 MENIT" + Judul H1 "3 KESIMPULAN PENTING". Kanan atas KOSONG.
  2. 3 Floating Bento Takeaway Cards berjejer:
     - Card 01: Nomor raksasa "01" font emas Inter ExtraBold 48px + 1 kalimat intisari.
     - Card 02: Nomor raksasa "02" font emas Inter ExtraBold 48px + 1 kalimat intisari.
     - Card 03: Nomor raksasa "03" font emas Inter ExtraBold 48px + 1 kalimat intisari.
  3. Big Golden Quote Box: Kotak highlight 1 prinsip emas hukum pajak 2026.
  4. Objek 3D Matte: Tumpukan Koin Emas Matte Rapi (Clean Coin Stack, bukan ledakan) + Gulungan Sertifikat Brevet AB dengan Segel Lilin Merah (Wax Seal) & pita emas + Pena tanda tangan mewah.
  5. Footer Bar standar Brevet AB.

------------------------------------------------------------
📌 BLUEPRINT SLIDE 10: INTERACTIVE CALL TO ACTION & ENGAGEMENT HUB (CTA FINALE)
------------------------------------------------------------
• Fungsi: Mendorong aksi audiens (Like, Save, Share, Komentar, dan Follow untuk Batch berikutnya).
• Elemen Wajib:
  1. Header Zone: Kategori H3 "KUIS & DISKUSI" + Judul H1 "SUDAH PAHAM BELUM?". Kanan atas KOSONG.
  2. Large Glowing CTA Button: Tombol raksasa bergradasi navy & border emas "LIKE & SIMPAN POSTINGAN INI UNTUK PANDUAN!".
  3. 3 Action Icon Pill Badges 3D Matte:
     - Badge 1: Ikon Heart 3D ("Sukai jika bermanfaat")
     - Badge 2: Ikon Bookmark 3D ("Simpan agar tidak hilang saat lapor SPT")
     - Badge 3: Ikon Chat 3D ("Tulis pertanyaan di kolom komentar!")
  4. Next Batch Teaser Card: Kotak intip "NEXT BATCH [X+1]: [Judul Topik Selanjutnya]" dengan panah geser kanan.
  5. Objek 3D Matte: Smartphone 3D Modern Matte menampilkan layar aplikasi Brevet AB / Coretax DJP + Segel Medali Emas Brevet AB.
  6. Footer Bar standar Brevet AB.

============================================================
❌ DON'TS / NEGATIVE PROMPTS SUPER LENGKAP (DILARANG KERAS DI SEMUA SLIDE):
============================================================
1. ❌ NO CARTOON CHARACTERS / NO HUMAN MASCOTS / NO KAWAII ANIME STYLE.
2. ❌ NO CYBERPUNK / NO NEON GLOW / NO TECH HUD / NO CIRCUIT LINES / NO HOLOGRAM.
3. ❌ NO GOLD DOMINANCE / NO EXCESSIVE GLOSSY REFLECTIONS / NO METALLIC SHEEN EVERYWHERE.
4. ❌ NO CROWDED 3D OBJECTS / NO COIN EXPLOSION / NO FLOATING ISOLATED BLACK CARDS.
5. ❌ NO DRAWN LOGO BADGES OR CIRCLES IN TOP-RIGHT CORNER ZONE.
6. ❌ NO METADATA LABEL TEXT (DO NOT RENDER 'JUDUL MODUL UTUH', 'HOOK UTAMA', 'SLIDE TITLE' ON IMAGE).
7. ❌ NO CIRCULAR OR OVAL DJP LOGO — the DJP emblem is a ROUNDED RECTANGLE SHIELD, not a circle.
8. ❌ NO INVERTED DJP LOGO COLORS — gold always on top half, navy always on bottom half.
9. ❌ NO GRADIENT BACKGROUND — background must be FLAT SOLID MATTE NAVY (#0F172A).
10. ❌ NO VIGNETTE / NO BOKEH BACKGROUND / NO BLURRED EDGES.
11. ❌ NO THICK ORNATE BORDERS / NO DECORATIVE FRAMES / NO PATTERN BORDERS.
12. ❌ NO SIMPLE PLAIN TEXT BACKGROUNDS WITHOUT INFOGRAPHIC BENTO CARDS, DIAGRAMS, OR 3D PROPS.

============================================================
🚨 EKSEKUSI LANGSUNG (IMMEDIATE AUTOMATIC JSON OUTPUT):
============================================================
- 🚫 **DILARANG KERAS MEMBALAS DENGAN TEKS KONFIRMASI / BASA-BASI!**
- Anda WAJIB LANGSUNG MENGELUARKAN DATA JSON MURNI secara utuh dan lengkap dari Slide ${startSlideNum} s/d ${endSlideNum} menerapkan 10 BLUEPRINT DI ATAS.

============================================================
📤 FORMAT OUTPUT JSON MURNI 100% VALID
============================================================
{
  "module_title": "${moduleHeaderTitles}",
  "total_batches": ${targetBatch > 0 ? 1 : 10},
  "total_slides": ${targetBatch > 0 ? 10 : 100},
  "global_visual_config": {
    "primary_theme": "Deep DJP Midnight Navy Flat Matte (#0F172A) — NO GRADIENT BACKGROUND",
    "accent_color_1": "DJP Gold Accent Sparingly (#F59E0B) — for thin rules, bento borders, variable highlights",
    "accent_color_2": "Warm Orange Accent Sparingly (#F97316) — for alerts, milestones, and callout icons",
    "visual_style_type": "Modern Tax Education Editorial Premium v3 — 12-column editorial grid, rich bento cards, formula blocks, process pipelines, data tables, Rembrandt matte studio lighting, 3 max objects, top-right clean reserved space",
    "aspect_ratio": "4:5 Vertical Ratio (1080x1350 px)",
    "readability": "Inter ExtraBold 92-112px H1 white, high-contrast bento cards — readable in 1 second on mobile",
    "forbidden_styles": "NO gradient background, NO vignette, NO gold dominance, NO glossy reflections, NO neon HUD, NO cartoon characters, NO crowded 3D objects, NO thick ornate borders, NO circular DJP logo, NO inverted DJP colors, NO metadata text 'JUDUL MODUL UTUH', NO drawn logo badges in top-right corner, NO plain empty text slides"
  },
  "batches": [
    {
      "batch_number": ${targetBatch > 0 ? targetBatch : 1},
      "batch_title": "Batch ${targetBatch > 0 ? targetBatch : 1}: ${targetBatch > 0 ? batchMappingDescriptions[targetBatch] : 'Hook Utama & Dasar Hukum (Slide 1-10)'}",
      "visual_style": "Modern Tax Education Editorial Premium v3 — Rich Bento Layouts, Formula Blocks, Process Pipelines, Data Grids, 3D Matte Props, Top-Right Clean Empty Space",
      "master_batch_prompt": "Single 4:5 vertical image ONLY (1080x1350 px). Master Editorial Style: flat solid matte deep navy (#0F172A). Top-left: Official DJP 4-quadrant rounded shield emblem (120×80px) + 'BREVET AB'. Top-right corner: STRICTLY CLEAN EMPTY NAVY SPACE. Rich infographic structure: Bento container cards with 1px gold/slate borders, formula breakdown boxes, 3-step connected pipelines, comparison grids, high-contrast typography, and realistic matte 3D tax props (UU KUP/HPP book, official document with charts, financial calculator, magnifying glass, desk calendar, security shield) with soft Rembrandt studio lighting. 8K photographic render.",
      "tiktok_caption": "Caption TikTok edusantai super lengkap untuk Batch ${targetBatch > 0 ? targetBatch : 1} (150+ kata) lengkap dengan penjelasan alur, poin penting, dan 10 hashtag viral...",
      "slides": [
        {
          "slide_number": ${startSlideNum},
          "slide_title": "SLIDE ${startSlideNum}: Sampul Interaktif Batch ${targetBatch > 0 ? targetBatch : 1}",
          "legal_verification": "Verifikasi UU HPP No. 7/2021 & Coretax DJP 2026 secara detail...",
          "key_point": "Poin inti edukasi 1-2 kalimat tajam, interaktif, dan mudah difahami...",
          "visual_prompt_en": "Single 4:5 vertical image ONLY (1080x1350 px) for Slide ${startSlideNum} (do NOT render grid poster or multiple slides in one canvas). [BLUEPRINT SLIDE 1: COVER]. Background: solid flat #0F172A deep navy. HEADER (y:0–160px): Top-left Official DJP 4-quadrant rounded shield emblem (120×80px) + 'BREVET AB — BELAJAR PAJAK DARI DASAR'. TOP-RIGHT CORNER (x:880–1080px, y:0–200px): ABSOLUTELY EMPTY FLAT NAVY. 1px gold rule at y:160px. Pill badge 'BATCH 1 · MODUL DASAR'. H1 TITLE (y:240–400px): Inter ExtraBold 900 96px #FFFFFF. H2 SUB-HOOK (y:420px): Inter SemiBold 40px #F59E0B. 3 TOPIC BULLET POINTS (y:470–570px) with gold dot bullets. Circular stamp 'PAHAM KUP PAHAM PAJAK'. 3D OBJECT ZONE (x:620–1020px): Standing UU KUP book with gold spine + DJP formal document with bar chart + black solar calculator on dark mahogany desk, Rembrandt 45° soft-box lighting, zero gloss, soft ambient shadows. FOOTER (y:1210–1350px): 'BREVET AB — DASAR KUAT • PAHAM • LULUS'. 8K photographic render.",
          "visual_prompt_id": "Gambar vertikal 4:5 tunggal (1080x1350 px) KHUSUS Slide ${startSlideNum} saja. [BLUEPRINT SLIDE 1: SAMPUL]. Background navy solid #0F172A. HEADER: Logo DJP shield 4-kuadran di kiri atas + 'BREVET AB'. POJOK KANAN ATAS MUTLAK KOSONG POLOS NAVY. Garis 1px emas. Pill badge 'BATCH 1 · MODUL DASAR'. JUDUL H1 teks putih tebal. SUB-HOOK H2 emas. 3 Poin bahasan dengan bullet emas. Stempel bulat 'PAHAM KUP PAHAM PAJAK'. ZONA 3D: Buku UU KUP tegak + Dokumen DJP ber-grafik + Kalkulator solar hitam di atas meja mahoni gelap, pencahayaan studio Rembrandt 45° matte tanpa kilap. FOOTER: 'BREVET AB — DASAR KUAT • PAHAM • LULUS'. Render 8K.",
          "creator_notes": "Panduan narasi skrip video TikTok untuk Slide ini (50+ kata)..."
        }
      ]
    }
  ]
}

============================================================
📚 KURIKULUM DATA MODUL UTUH 100% TANPA PEMOTONGAN
============================================================
${fullModulesData}

============================================================
🚨 PERINTAH FINAL & EKSEKUSI LANGSUNG! 🚨
MULAI SEKARANG! DILARANG CHAT BASA-BASI ATAU TANYA JAWAB! Hasilkan LANGSUNG data JSON murni khusus Batch ${targetBatch > 0 ? targetBatch : '1-10'} dari Slide ${startSlideNum} s/d ${endSlideNum} dengan menerapkan 10 BLUEPRINT INFOGRAFIS KAYA ELEMEN (Bento Cards, Dual-Card Split Mitos vs Fakta, 3-Step Process Pipeline, Big Formula Box, Real Case Ledger Slip, High-Contrast Data Grid Table, Deadline Timeline & Calendar, Do's & Don'ts Checklist, 3-Card Summary, dan Interactive CTA Hub), rasio gambar 4:5 vertikal (1080x1350 px), WAJIB menggunakan spesifikasi resmi Logo DJP Shield 4-Kuadran Rounded Rectangle PERSIS sesuai base64 encoded SVG di atas, WAJIB membiarkan Pojok Kanan Atas KOSONG POLOS, dan DILARANG KERAS MERENDER KATA METADATA 'JUDUL MODUL UTUH' PADA GAMBAR!`;
}

