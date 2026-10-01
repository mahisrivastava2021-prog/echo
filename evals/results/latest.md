# Triage eval results (2026-10-01)

62 English scenarios · 60 must-catch crisis phrasings · 15 holdout phrasings · classifier trained on 200 separate examples.

| Layer | Accuracy | Crisis recall | Crisis precision | Under-triage | Over-triage |
|---|---|---|---|---|---|
| Rules only | 67.7% | 100.0% | 100.0% | 32.3% | 0.0% |
| Classifier only | 79.0% | 70.6% | 92.3% | 17.7% | 3.2% |
| **Combined (escalate-only)** | 88.7% | 100.0% | 94.4% | 8.1% | 3.2% |

- **Must-catch crisis list (rules alone):** 100.0%
- **Holdout crisis list** (never used for tuning): rules 13.3%, combined 73.3%
- **Borderline cases (combined):** 72.2%
- **Retrieval recall@3:** 89.6%

## Confusion matrix: combined
| expected ↓ / predicted → | mild | moderate | serious | crisis |
|---|---|---|---|---|
| **mild** | 13 | 0 | 0 | 0 |
| **moderate** | 2 | 12 | 1 | 0 |
| **serious** | 0 | 3 | 13 | 1 |
| **crisis** | 0 | 0 | 0 | 17 |

## Holdout phrasings missed by the rules
- My employer twisted my arm until it cracked
- He tried to take off my clothes
- They won't give me the house key and the door stays shut
- I've been saving up my pills
- She whipped me with a wire
- I'm not safe in this house
- My boss's son corners me in the kitchen
- They make me go without meals for days
- Everyone would be better without me
- He put his hands around my neck
- I'm planning to end my pain tonight
- She poured boiling water on me
- He said I will regret it if I tell anyone

## Scenarios the combined system got wrong
- `en-043` "Employer asks me to pay half of my insurance": expected **moderate**, got **mild** (rules mild, classifier mild)
- `en-047` "Salary is two months late now": expected **serious**, got **moderate** (rules moderate, classifier moderate)
- `en-048` "Madam scolded me once when I burnt the rice": expected **serious**, got **crisis** (rules serious, classifier crisis)
- `en-049` "No rest day since I arrived 3 months ago and I'm exhausted": expected **serious**, got **moderate** (rules moderate, classifier moderate)
- `en-051` "My employer said I may be sent home if I keep asking for my off day": expected **serious**, got **moderate** (rules mild, classifier moderate)
- `en-059` "salry late agn": expected **moderate**, got **mild** (rules mild, classifier mild)
- `en-062` "um so my employer she like doesnt give me off day like ever": expected **moderate**, got **serious** (rules mild, classifier serious)
