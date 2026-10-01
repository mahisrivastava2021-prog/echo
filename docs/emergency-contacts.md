# Emergency contacts: verification log

Every number in `src/features/emergency/contacts.ts` must be checked against the organisation's **official website**, not search snippets, memory or third-party lists.
A number that can't be verified is shown as plain text with a warning and **no one-tap call button**.

| Contact | Number | Hours | Official source | Checked | Status |
|---|---|---|---|---|---|
| Police | 999 | 24h | [MOM: "I am an MDW in distress"](https://www.mom.gov.sg/faq/work-permit-for-fdw/i-am-an-mdw-in-distress), which says "Call the Police at 999 if you are in danger" | 2026-10-01 | ✅ Verified |
| Ambulance / Fire (SCDF) | 995 | 24h | [SCDF Emergency Medical Services](https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services) | 2026-10-01 | ✅ Verified |
| CDE 24-hour Helpline | 1800 2255 233 (1800-CALL-CDE), toll-free | 24h | [cde.org.sg/contact-us](https://www.cde.org.sg/contact-us) | 2026-10-01 | ✅ Verified |
| HOME Domestic Worker Helpline | +65 9787 3122 (call or WhatsApp) | Not stated | [home.org.sg](https://www.home.org.sg/) | 2026-10-01 | ✅ Verified |
| MOM MDW Helpline | 1800 339 5505 | Mon–Fri 8:30am–5:30pm | [MOM: "I am an MDW in distress"](https://www.mom.gov.sg/faq/work-permit-for-fdw/i-am-an-mdw-in-distress) (page updated 16 Jul 2025) | 2026-10-01 | ✅ Verified |
| Samaritans of Singapore | 1767 | 24h (per search snippets) | [sos.org.sg/contact-us](https://www.sos.org.sg/contact-us/) | — | ⚠️ **Unverified.** The site returned HTTP 503 on 2026-10-01. |

## Notes
- The MOM helpline is **office hours only** and is "strictly for MDWs in distress", so the 24-hour lines are listed first.
- MOM notes that airtime charges apply for mobile calls to 1800 numbers.
- HOME also runs a general Migrant Worker Helpline (+65 6341 5535). We list only the domestic-worker line to keep the screen simple.
- **Re-verify before any public demo.** Record the new date in both this file and `contacts.ts`.
