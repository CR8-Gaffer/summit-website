# Summit website prelaunch checklist

> **This checklist does not authorise publication, deployment, DNS changes, account connections, or external communication.**

Complete each evidence gate and obtain final owner approval before treating the static website as publishable. An item is complete only when its evidence is recorded or linked; visual polish alone is insufficient.

## 1. Identity and legal details

- [ ] Confirm the exact legal entity name that will operate the website and contract with customers.
- [ ] Confirm the current public business name is Summit Asset Maintenance.
- [ ] Confirm the ABN from authoritative registration evidence.
- [ ] Replace every ABN confirmation marker in `about.html` and `privacy.html` with approved wording.
- [ ] Verify that copyright, privacy, contact, invoice, and contractual identity wording all refer to the same entity.
- [ ] Obtain legal review where required; this checklist is not legal advice.

**Evidence/approval record:** Not recorded.

## 2. Contact routing

- [ ] Replace placeholder phone number `1300 000 000` across all pages and metadata with an active, owner-approved number.
- [ ] Verify `enquiries@summitam.com.au` exists, is monitored, and has an approved retention and response process.
- [ ] Confirm telephone and email links work on mobile and desktop.
- [ ] Confirm the business has authority to publish each contact channel.
- [ ] Record who owns first-response responsibility and the expected response window.

**Evidence/approval record:** Not recorded.

## 3. Contact-form behaviour and privacy

- [ ] Select an approved form service or owned endpoint.
- [ ] Set `FORM_ENDPOINT` in `js/contact.js` only after Caleb gives explicit permission to change that protected file.
- [ ] Test successful submission, validation failure, network failure, duplicate submission, and spam handling in a non-public environment.
- [ ] Verify the destination inbox and confirmation message.
- [ ] Document what personal information is collected, why it is needed, where it is stored, who can access it, and when it is deleted.
- [ ] Align the privacy page with the real form provider, data handling, contact details, and legal entity.
- [ ] Confirm any consent language and privacy obligations with appropriate advice.

**Current blocker:** `FORM_ENDPOINT` is empty and the enquiries inbox has not been verified by this workspace audit.

**Evidence/approval record:** Not recorded.

## 4. Insurance and compliance claims

- [ ] Obtain current certificates for public liability and workers' compensation, or approved evidence that accurately supports the intended wording.
- [ ] Confirm named insured, entity, policy periods, limits, exclusions, and service/territory relevance.
- [ ] Remove or substantiate “Fully insured” before publication.
- [ ] Remove the internal “Confirm cover” marker from public copy only after the claim is evidenced and Caleb gives file-specific editing permission.
- [ ] Confirm the appropriate use and wording of AS 1851-2012 and any other cited standard.
- [ ] Obtain insurer, broker, legal, or compliance review where appropriate.

**Evidence/approval record:** Not recorded. Public claims remain unverified under OPEN-004.

## 5. Fleet, readiness, and imagery

- [ ] Verify actual vehicle ownership or availability, fitout, branding, equipment, licensing, and operating readiness.
- [ ] Remove or substantiate “Wrapped, equipped and ready”.
- [ ] Review `assets/img/fleet.jpg` and every fleet reference so imagery cannot reasonably imply a larger or operational fleet than exists.
- [ ] Confirm rights and licences for every website image, video, font, logo, and generated asset.
- [ ] Add appropriate descriptions or alternative text where imagery conveys operational information.

**Evidence/approval record:** Not recorded. Fleet/readiness claims remain unverified under OPEN-004.

## 6. Territory and service scope

- [x] Record DEC-011: Sydney/NSW is the primary launch market using grouped FIFO runs initially; SA is authorised as a small premium pocket; NT remains excluded.
- [ ] Approve concise public geography wording that accurately reflects DEC-011 without implying permanent Sydney presence before it exists.
- [ ] Check titles, metadata, sitemap, footer, contact, privacy, and service pages for consistent geography.
- [ ] Confirm every advertised service is operationally deliverable, insured, safely controlled, and commercially approved.
- [x] Record DEC-012: KES is the primary offer and is not required to be bundled with filter exchange.
- [ ] Present KES as the primary offer; describe filter exchange only as optional or later-stage if separately approved.
- [ ] Ensure pressure washing, soak-tank/filter work, reporting, and compliance wording match current governed operational sources.
- [ ] Do not add NT claims or lead capture. Do not publish SA claims until exact wording and operational readiness are approved.

**Evidence/approval record:** Not recorded.

## 7. Drone service

- [ ] Resolve OPEN-005: future concept, register-interest only, or removal until authorised.
- [ ] Verify the operating model, responsible operator, CASA credentials and approvals, insurance, equipment, safety controls, territory, and delivery readiness.
- [ ] Remove or substantiate any implication of current CASA-approved operation or current delivery capability.
- [ ] Approve the exact lead-handling process before enabling “Register interest”.
- [ ] Confirm privacy and consent treatment for drone-interest enquiries.

**Evidence/approval record:** Not recorded. Drone cleaning remains a future, unverified capability.

## 8. Analytics and attribution

- [ ] Define the minimum questions analytics must answer before selecting a tool.
- [ ] Obtain owner approval before connecting analytics, advertising pixels, session replay, CRM, or attribution services.
- [ ] Configure consent and privacy handling appropriate to the selected tools and audience.
- [ ] Exclude sensitive form content from analytics and session recording.
- [ ] Test campaign parameters, referral attribution, conversion events, and retention settings in a non-public environment.
- [ ] Document account ownership, access, billing, and removal procedure.

**Evidence/approval record:** Not recorded. No analytics connection is authorised by this checklist.

## 9. Technical release checks

- [ ] Rerun the local-link and local-asset audit; expected result is zero broken references.
- [ ] Test the eleven top-level pages at representative mobile, tablet, laptop, and large-screen widths.
- [ ] Test keyboard navigation, visible focus, headings, labels, contrast, reduced motion, and screen-reader basics.
- [ ] Test current Safari, Chrome, Firefox, and Edge versions supported by the release decision.
- [ ] Verify page titles, descriptions, canonical URLs, social cards, sitemap, robots file, favicon, and 404 behaviour.
- [ ] Optimise and verify image/video weight, lazy loading, caching, and performance without changing protected files until authorised.
- [ ] Confirm HTTPS, security headers, DNS, hosting account ownership, rollback, and backups before deployment.
- [ ] Reconcile `README.md` with actual deployment configuration; the audited workspace did not contain the referenced `.github/workflows/deploy.yml`.
- [ ] Run a targeted credential scan and confirm no secret is committed into static files.

**Evidence/approval record:** Local references passed on 14 August 2026; the remaining checks are not recorded as complete.

## 10. Final approval gate

- [x] DEC-011 territory treatment is recorded.
- [x] DEC-012 commercial-model treatment is recorded.
- [ ] OPEN-003 launch-date treatment is recorded.
- [ ] OPEN-004 public claims are evidenced and their exact wording approved.
- [ ] OPEN-005 drone-service treatment is recorded.
- [ ] Identity, ABN, phone, inbox, form endpoint, privacy, insurance, fleet, services, imagery rights, analytics, and technical checks are complete.
- [ ] Caleb Rowlands has approved the exact release candidate and deployment action.
- [ ] Any other required owner, legal, insurer, compliance, or technical approval is recorded.
- [ ] A rollback copy and post-release verification procedure exist.

**Release decision:** Not approved.

> **This checklist does not authorise publication, deployment, DNS changes, account connections, or external communication.**
