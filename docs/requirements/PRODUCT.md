# Product vision and requirements

Status: draft; requires church leadership and repository owner review.

## Vision
Provide an accessible, trustworthy public presence for Gracehill Assembly, then develop secure internal ministry operations where justified.

## Scope and requirements
| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-01 | Public home and about | Approved identity, mission, leadership and service information |
| FR-02 | Ministries | Approved descriptions and meaningful next steps |
| FR-03 | Events | Accurate dates, venues and clear past/upcoming status |
| FR-04 | Media | Authorized media with functional links and accessible alternatives |
| FR-05 | Contact | Verified contact details; form either tested end to end or explicitly unavailable |
| FR-06 | Admin prototype | No real data or misleading claim of secure login; exclude from public release |
| NFR-01 | Accessibility | Target WCAG 2.2 AA; keyboard, focus, contrast, labels and screen-reader review |
| NFR-02 | Responsiveness | Verify at 320, 768 and 1440 CSS pixels; no unintended horizontal overflow |
| NFR-03 | Security | No committed secrets; server-side authentication before any restricted service |
| NFR-04 | Privacy | Minimize data; approve access, retention, consent and deletion procedures before collection |
| NFR-05 | Maintainability | Shared components/styles, documented changes, reviewed PRs and checks |
| NFR-06 | Reliability | No broken core navigation; tested failure states; documented release and rollback |

## Stakeholders
Church leadership (content and policy approval), media and administrative teams (operational requirements), visitors and congregation (usability), repository maintainer (engineering).

## Out of scope for first release
Membership databases, finance, prayer request storage, payments, production admin, analytics tracking and automated messaging. Future modules require approved requirements and privacy/security review.

## Open decisions
Confirm branding assets and rights, service schedule, leadership names, contact channels, hosting, content owners, budget and applicable data protection obligations. Do not invent church facts.
