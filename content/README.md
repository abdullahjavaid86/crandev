# content/ — ALL PLACEHOLDER

Every file here is **invented sample data**, written so the sections have a
correct shape to render. None of it is true.

Replace before launch:

| file                      | what has to become real                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `work.json`               | clients, outcomes, stacks, dates. **Every `outcome` states a number that is made up.**             |
| `stats.json`              | all four figures                                                                                   |
| `testimonials.json`       | quotes and the people attributed to them — these are fabricated attributions to invented companies |
| `brands.json`             | company names and logo files                                                                       |
| `services.json`           | timelines and deliverables                                                                         |
| `process.json`            | durations                                                                                          |
| `team.json`, `roles.json` | still empty; fill when real                                                                        |

`cover` and `photo` point at Unsplash placeholder URLs. When real images
arrive they should become **static imports** (`import cover from
'@/public/work/x.png'`) so they get a blur placeholder and intrinsic sizing —
see CLAUDE.md §7.0. That is a schema change, not just a value change.

The zod schemas in `lib/content/schemas.ts` still apply: slugs must be
kebab-case and a project `outcome` must contain a digit. They keep the shape
honest; they cannot make the content true.
