import type { TriageOutput } from '../../triage/schema'

/**
 * Scripted demo answers. They use the SAME schema as live model output, so the
 * rest of the app can't tell them apart. Every citation must exist in the KB
 * (checked by chat.test.ts), and each reply only restates what the cited chunks say.
 */
export interface ScriptedExample {
  id: string
  chip: string // short label on the example button
  userText: string
  output: TriageOutput
}

export const SCRIPTS_EN: ScriptedExample[] = [
  {
    id: 'phone',
    chip: 'Phone rules',
    userText: 'Is my employer allowed to stop me from using my phone?',
    output: {
      level: 'mild',
      reason: 'You are asking about a house rule. Nothing you described sounds harmful.',
      citations: ['phone'],
      not_ready: false,
      reply:
        "That's a good question to ask. MOM says your phone is your personal property and you should have access to it, because it's how you stay in touch with your family. Your employer can agree with you on house rules about *when* you use it, for example not while cooking or caring for children. Rules about timing are normal. Being cut off from your phone completely is not what MOM describes.",
    },
  },
  {
    id: 'rest-day',
    chip: 'No rest day',
    userText: "I haven't had a rest day for a month. Madam says I must work.",
    output: {
      level: 'moderate',
      reason: 'Not getting a rest day for a month goes against MOM rules, but you did not describe being in danger.',
      citations: ['rest-day-monthly-minimum', 'rest-day-compensation'],
      not_ready: false,
      reply:
        "I'm sorry, a month without rest is exhausting. You are entitled to a rest day every week, and at least one rest day every month must be a real day off. It cannot be replaced with extra pay. If you agree to work on your other rest days, you should get at least one extra day's salary for each one. Below are some steps you can take, whenever you are ready.",
    },
  },
  {
    id: 'late-salary',
    chip: 'Salary late',
    userText: 'My salary is always paid late, around the 20th of the next month.',
    output: {
      level: 'moderate',
      reason: 'Salary paid after the 7-day deadline goes against MOM rules.',
      citations: ['salary-on-time', 'salary-records-bank'],
      not_ready: false,
      reply:
        "That sounds stressful, especially if your family depends on that money. Your salary must be paid every month, no later than 7 days after the end of the salary period. Salary paid around the 20th is late under MOM's rules. Keeping a record of when you were paid will help if you decide to ask for help.",
    },
  },
  {
    id: 'unpaid-shouting',
    chip: 'Unpaid + shouting',
    userText: "I haven't been paid for 3 months and my employer shouts at me when I ask.",
    output: {
      level: 'serious',
      reason: 'Months of unpaid salary plus repeated shouting is a clear violation and may be ill-treatment.',
      citations: ['salary-report-unpaid', 'ill-treatment-definition'],
      not_ready: false,
      reply:
        "Thank you for telling me. This is not okay, and it's not your fault. Three months without salary is a serious breach of MOM's rules, and MOM can help you recover your salary. Being shouted at for asking is not acceptable either: MOM says ill-treatment includes mental and emotional abuse. You have options, and you can take them at your own pace.",
    },
  },
  {
    id: 'hit',
    chip: 'I was hit',
    userText: "My employer hit me last night and I'm scared.",
    output: {
      level: 'crisis',
      reason: 'You described physical violence. Your safety comes first.',
      citations: ['abuse-police', 'help-in-danger'],
      not_ready: false,
      reply:
        "I'm so sorry this happened to you. Being hit is abuse, and it's a crime that the police investigate. If you are in danger right now, please call the Police at 999. The emergency contacts are on your screen whenever you need them.",
    },
  },
  {
    id: 'not-ready',
    chip: "Not ready to report",
    userText: "My salary is late every month but I don't want to report. I'm scared of losing my job.",
    output: {
      level: 'moderate',
      reason: 'Late salary goes against MOM rules. You told me you are not ready to act, and that is okay.',
      citations: ['salary-on-time', 'help-report-channels'],
      not_ready: true,
      reply:
        "That fear makes a lot of sense, and you don't have to do anything right now. For your information: your salary must be paid within 7 days after each month ends. I've saved the rules and contacts for you, so they're here if you ever want them. You decide if and when.",
    },
  },
]
