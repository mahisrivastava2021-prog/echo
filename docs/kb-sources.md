# Knowledge base: sources

Echo answers only from the hand-written chunks in `kb/source/`. Each chunk is a plain-language paraphrase of **one rule from one official page**, plus a short **verbatim quote** so anyone can check it.

| Source page | Page last updated | Chunks |
|---|---|---|
| [MOM: Rest days, health and well-being for MDWs](https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-domestic-worker/employers-guide/rest-days-and-well-being) | 2026-01-16 | rest-day-weekly, rest-day-monthly-minimum, rest-day-compensation, food, accommodation, privacy |
| [MOM: Paying the salary of an FDW](https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-domestic-worker/employers-guide/salary-guidelines) | 2024-03-14 | salary-on-time, salary-full-amount, salary-records-bank, salary-no-safekeeping |
| [MOM FAQ: How can an MDW report unpaid salary?](https://www.mom.gov.sg/faq/work-permit-for-fdw/how-can-an-fdw-report-that-her-salary-has-not-been-paid) | 2025-04-24 | salary-report-unpaid |
| [MOM FAQ: Can an employer keep a worker's passport?](https://www.mom.gov.sg/faq/work-pass-general/can-an-employer-keep-a-workers-passport) | 2026-02-11 | passport |
| [MOM FAQ: MDW medical expenses above insurance](https://www.mom.gov.sg/faq/work-permit-for-fdw/can-i-get-my-fdw-to-co-pay-her-medical-expenses-that-exceed-the-insurance-benefit-limit) | 2024-03-14 | medical |
| [MOM Ask Jaya: MDW access to her phone](https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-domestic-worker/publications-and-resources/ask-jaya/i-want-to-give-my-mdw-access-to-her-phone) | 2024-08-29 | phone |
| [MOM: Employment rules for MDWs](https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-domestic-worker/employers-guide/employment-rules) | 2026-09-23 | work-scope |
| [MOM FAQ: Does ill-treatment include mental or emotional abuse?](https://www.mom.gov.sg/faq/work-permit-for-foreign-worker/does-ill-treatment-of-a-foreign-employee-include-mental-or-emotional-abuse) | 2024-03-14 | ill-treatment-definition |
| [MOM: Abuse and ill-treatment of an FDW](https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-domestic-worker/employers-guide/abuse-and-ill-treatment) | 2024-03-14 | abuse-police |
| [MOM FAQ: I am an MDW in distress. Who can I call?](https://www.mom.gov.sg/faq/work-permit-for-fdw/i-am-an-mdw-in-distress) | 2025-07-16 | help-in-danger |
| [MOM FAQ: MDW not paid, overworked or not given enough food](https://www.mom.gov.sg/faq/work-permit-for-fdw/what-should-i-do-if-an-fdw-has-not-been-paid-is-overworked-or-not-given-enough-food) | 2025-04-24 | help-report-channels |
| [MOM: Transfer an MDW directly to a new employer](https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-domestic-worker/transfer-to-a-new-employer) | 2024-03-14 | transfer-employer |
| [CDE: Contact us](https://www.cde.org.sg/contact-us) and [HOME](https://www.home.org.sg/) | not shown | support-organisations |

All pages were accessed on **2026-10-01**.

## Process
1. Read the official page. Search-engine summaries are not accepted as a source.
2. Write one chunk per rule. Address the worker as "you", use simple words, and add a verbatim quote.
3. Add `keywords` with the everyday words a worker might use, such as "day off", "madam" and "handphone".
4. Run `npm run kb:build`. It validates every chunk: required fields, an allowed official domain and unique IDs.

## Known gaps
- Most MOM pages are written **for employers**. The chunks rephrase them as the worker's rights.
- Not covered yet: the standard employment contract, the 8-hour rest period, safe window-cleaning rules, home leave, and repatriation costs.
- MOM's PDF guides (e.g. *A Guide for Migrant Domestic Workers*) weren't text-extractable with our tools. They're worth adding later.
- The KB is **not reviewed by a lawyer or by MOM**. Echo gives information, not legal advice.
