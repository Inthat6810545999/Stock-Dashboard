# Login error responsive audit — 2026-10-12

Changed the password sign-in failure state on `/login` only. In the in-app browser, a fabricated invalid email and password produced the inline error beneath the password field. Typing again cleared the error and reset `aria-invalid`.

Checked the rendered failure state with requested desktop sizes 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080, and 2560×1440; tablet sizes 768×1024, 1024×768, 820×1180, 1180×820, 834×1194, 1194×834, 1024×1366, 1366×1024, and 1180×690; and phone sizes 360×800, 800×360, 375×667, 667×375, 390×844, 844×390, 430×932, and 932×430. The browser reported CSS viewports scaled to 5/6 of requested dimensions. At every reported viewport, the page had no horizontal overflow, the card fit horizontally, and the alert fit inside the card below the password input. Short landscape screens scroll vertically as needed.

This is viewport simulation in the Codex in-app browser, not physical-device or cross-browser verification.
