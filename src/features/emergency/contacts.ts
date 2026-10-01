import type { MessageKey } from '../../i18n/t'

/**
 * Single source of truth for every phone number shown in Echo.
 *
 * Rules (see CLAUDE.md):
 * - Every number must be checked against the organisation's OFFICIAL website.
 * - Record where and when it was checked, so it can be re-verified.
 * - If a number can't be verified, set verified: false. The UI then shows it
 *   as plain text with a warning, never as a one-tap call button.
 *
 * Full verification notes: docs/emergency-contacts.md
 */
export interface EmergencyContact {
  id: string
  name: string // proper noun, not translated
  descriptionKey: MessageKey // translated "when to call" text
  display: string // how the number is shown
  tel: string // what the phone dials (no spaces)
  hoursKey: MessageKey
  urgent: boolean // true = shown first, in red (danger to life)
  verified: boolean
  sourceUrl: string
  verifiedOn: string // ISO date
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'police',
    name: 'Police',
    descriptionKey: 'contact.police.desc',
    display: '999',
    tel: '999',
    hoursKey: 'hours.24h',
    urgent: true,
    verified: true,
    sourceUrl: 'https://www.mom.gov.sg/faq/work-permit-for-fdw/i-am-an-mdw-in-distress',
    verifiedOn: '2026-10-01',
  },
  {
    id: 'ambulance',
    name: 'Ambulance / Fire (SCDF)',
    descriptionKey: 'contact.ambulance.desc',
    display: '995',
    tel: '995',
    hoursKey: 'hours.24h',
    urgent: true,
    verified: true,
    sourceUrl: 'https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services',
    verifiedOn: '2026-10-01',
  },
  {
    id: 'cde',
    name: 'Centre for Domestic Employees (CDE)',
    descriptionKey: 'contact.cde.desc',
    display: '1800 2255 233',
    tel: '18002255233',
    hoursKey: 'hours.24h',
    urgent: false,
    verified: true,
    sourceUrl: 'https://www.cde.org.sg/contact-us',
    verifiedOn: '2026-10-01',
  },
  {
    id: 'home',
    name: 'HOME Domestic Worker Helpline',
    descriptionKey: 'contact.home.desc',
    display: '+65 9787 3122',
    tel: '+6597873122',
    hoursKey: 'hours.notStated',
    urgent: false,
    verified: true,
    sourceUrl: 'https://www.home.org.sg/',
    verifiedOn: '2026-10-01',
  },
  {
    id: 'mom',
    name: 'MOM Migrant Domestic Worker Helpline',
    descriptionKey: 'contact.mom.desc',
    display: '1800 339 5505',
    tel: '18003395505',
    hoursKey: 'hours.momOffice',
    urgent: false,
    verified: true,
    sourceUrl: 'https://www.mom.gov.sg/faq/work-permit-for-fdw/i-am-an-mdw-in-distress',
    verifiedOn: '2026-10-01',
  },
  {
    // sos.org.sg returned HTTP 503 on 2026-10-01, so it was only seen in search
    // snippets. Re-check the live site before flipping this to true.
    id: 'sos',
    name: 'Samaritans of Singapore (SOS)',
    descriptionKey: 'contact.sos.desc',
    display: '1767',
    tel: '1767',
    hoursKey: 'hours.24h',
    urgent: false,
    verified: false,
    sourceUrl: 'https://www.sos.org.sg/contact-us/',
    verifiedOn: '',
  },
]
