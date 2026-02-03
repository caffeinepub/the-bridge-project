# Specification

## Summary
**Goal:** Make the Contact form publicly accessible without login, and allow company users to upload legal documents with their internship survey submissions for admin review.

**Planned changes:**
- Remove authentication gating on `/contact` so anonymous, student, and company users can view and submit the contact form.
- Update `frontend/src/pages/ContactPage.tsx` to remove the login-required UI path and ensure submission works when unauthenticated.
- Update `submitContactForm` in `backend/main.mo` to accept anonymous submissions while keeping `getAllContactFormSubmissions` admin-only.
- Add a legal document upload control to the company survey in `frontend/src/pages/CompanyPortalPage.tsx`, listing selected files (name/size) and sending them with the submission payload.
- Extend `CompanySubmission`/`CompanySubmissionInput` and `submitCompanySurvey` in `backend/main.mo` to store uploaded document metadata and content, and return it via `getAllCompanySubmissions`.
- Update `frontend/src/pages/AdminCompanySubmissionsPage.tsx` to display uploaded documents per submission with a download/view option and a clear empty state when none exist.

**User-visible outcome:** Anyone can submit the Contact form at `/contact` without logging in, and company users can attach legal documents to their survey submissions that admins can view/download from the admin submissions page.
