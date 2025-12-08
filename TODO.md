# TODO: Implement Proper Forgot Password Flow with Gmail Email Delivery and Dashboard Redirect

## Steps to Complete
- [ ] Modify `src/lib/email.ts` to prioritize Gmail SMTP even in development if `SMTP_USER` and `SMTP_PASS` are set, falling back to Ethereal otherwise
- [ ] Update `src/app/api/auth/reset-password/route.ts` to generate a JWT token after successful password reset and return it in the response
- [ ] Modify `src/app/reset-password/page.tsx` to store JWT token in cookie and redirect to `/admin/dashboard` after successful reset
- [ ] Update TODO.md to reflect completed steps and add testing instructions

## Followup Steps (After Implementation)
- [ ] Set environment variables for Gmail SMTP (SMTP_USER, SMTP_PASS with app password)
- [ ] Test forgot password flow: enter email, check Gmail for reset link, click link, reset password, verify dashboard redirect
- [ ] Ensure admin is logged in after reset by checking dashboard access

## Notes
- Email library will use real Gmail SMTP if credentials are provided, otherwise falls back to Ethereal for development
- After password reset, user will be automatically logged in and redirected to admin dashboard
- JWT token will be stored in cookie for authentication
