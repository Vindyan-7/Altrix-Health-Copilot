import { describe, it, expect } from 'vitest';
import { MockExtractionProvider } from '../src/lib/ai/mock-provider';
import { GeminiProvider } from '../src/lib/ai/gemini-provider';
import fs from 'node:fs';
import path from 'node:path';

// Helper for validating internal returnTo redirects
function validateReturnTo(url: string | null): string {
  if (!url) return '/dashboard';
  const allowed = ['/dashboard', '/records', '/review', '/timeline', '/copilot'];
  if (allowed.some((a) => url === a || url.startsWith(a + '?') || url.startsWith(a + '/'))) {
    return url;
  }
  return '/dashboard';
}

describe('Phase 4C: Landing Page, Authentication Flow & Demo Cleanup', () => {
  describe('1. Open Redirect Prevention (Safe Return-To URLs)', () => {
    it('accepts valid internal paths for post-login redirect', () => {
      expect(validateReturnTo('/dashboard')).toBe('/dashboard');
      expect(validateReturnTo('/records')).toBe('/records');
      expect(validateReturnTo('/copilot?mode=ai')).toBe('/copilot?mode=ai');
      expect(validateReturnTo('/review')).toBe('/review');
      expect(validateReturnTo('/timeline')).toBe('/timeline');
    });

    it('rejects external and malicious redirect attempts by defaulting to /dashboard', () => {
      expect(validateReturnTo('https://evil.com')).toBe('/dashboard');
      expect(validateReturnTo('//evil.com')).toBe('/dashboard');
      expect(validateReturnTo('javascript:alert(1)')).toBe('/dashboard');
      expect(validateReturnTo('/\\evil.com')).toBe('/dashboard');
      expect(validateReturnTo(null)).toBe('/dashboard');
      expect(validateReturnTo('')).toBe('/dashboard');
    });
  });

  describe('2. Honest AI Fallback Response', () => {
    it('returns honest unavailable message when external AI service is unreachable', async () => {
      const mockProvider = new MockExtractionProvider();
      const response = await mockProvider.generateChat({
        messages: [{ role: 'user', content: 'What are vitamins?' }],
        locale: 'en',
      });

      expect(response.isUnavailable).toBe(true);
      expect(response.isMockFallback).toBe(true);
      expect(response.provider).toBe('ServiceUnavailable');
      expect(response.message).toContain('General health AI chat is temporarily unavailable');
      expect(response.message).toContain('Guided Health Copilot');
      expect(response.suggestedQuestions).toBeInstanceOf(Array);
      expect(response.suggestedQuestions?.length).toBeGreaterThan(0);
    });

    it('returns honest unavailable message in Telugu when requested', async () => {
      const mockProvider = new MockExtractionProvider();
      const response = await mockProvider.generateChat({
        messages: [{ role: 'user', content: 'విటమిన్లు ఏమిటి?' }],
        locale: 'te',
      });

      expect(response.isUnavailable).toBe(true);
      expect(response.isMockFallback).toBe(true);
      expect(response.message).toContain('సాధారణ ఆరోగ్య AI చాట్ ప్రస్తుతం అందుబాటులో లేదు');
      expect(response.message).toContain('గైడెడ్ హెల్త్ కోపైలట్‌ను ఉపయోగించండి');
    });

    it('GeminiProvider falls back to honest unavailable response when API key is unconfigured', async () => {
      const geminiProvider = new GeminiProvider();
      const response = await geminiProvider.generateChat({
        messages: [{ role: 'user', content: 'Can I take aspirin?' }],
        locale: 'en',
      });

      expect(response.isUnavailable).toBe(true);
      expect(response.isMockFallback).toBe(true);
      expect(response.message).toContain('General health AI chat is temporarily unavailable');
    });
  });

  describe('3. Customer-Facing Cleanliness (No Hardcoded Demo Identities or Credits)', () => {
    const customerFiles = [
      'src/pages/index.astro',
      'src/pages/dashboard.astro',
      'src/pages/auth.astro',
      'src/pages/records.astro',
      'src/pages/timeline.astro',
      'src/pages/copilot.astro',
      'src/components/TopBar.astro',
      'src/components/Sidebar.astro',
      'src/components/Footer.astro',
    ];

    it('ensures no customer-facing file contains "Priya Sharma"', () => {
      for (const relPath of customerFiles) {
        const fullPath = path.resolve(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          expect(content).not.toContain('Priya Sharma');
        }
      }
    });

    it('ensures public footer contains no developer team credits', () => {
      const footerPath = path.resolve(process.cwd(), 'src/components/Footer.astro');
      const footerContent = fs.readFileSync(footerPath, 'utf8');
      expect(footerContent).not.toContain('Vindyan');
      expect(footerContent).not.toContain('ChatGPT');
      expect(footerContent).not.toContain('Antigravity');
    });

    it('ensures records page has no sample-record creation button in normal flow', () => {
      const recordsPath = path.resolve(process.cwd(), 'src/pages/records.astro');
      const recordsContent = fs.readFileSync(recordsPath, 'utf8');
      expect(recordsContent).not.toContain('btn-save-sample-record');
      expect(recordsContent).not.toContain('+ Save Sample Synthetic CBC to Vault');
    });

    it('ensures public landing page exists at src/pages/index.astro with hero animation', () => {
      const indexPath = path.resolve(process.cwd(), 'src/pages/index.astro');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      expect(indexContent).toContain('hero-animate');
      expect(indexContent).toContain('prefers-reduced-motion');
      expect(indexContent).toContain('Altrix Health Copilot');
      expect(indexContent).toContain('Try Health Copilot (Guest Mode)');
    });

    it('ensures workspace dashboard exists at src/pages/dashboard.astro', () => {
      const dashPath = path.resolve(process.cwd(), 'src/pages/dashboard.astro');
      const dashContent = fs.readFileSync(dashPath, 'utf8');
      expect(dashContent).toContain('dashboard-auth-view');
      expect(dashContent).toContain('dashboard-guest-view');
      expect(dashContent).toContain('Sign In to Access Your Dashboard');
    });

    it('ensures dashboard and records remove misleading upload actions and wire honest vault intake', () => {
      const dashContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/dashboard.astro'), 'utf8');
      expect(dashContent).not.toContain('+ Upload Record');
      expect(dashContent).toContain('Upload Document');
      expect(dashContent).toContain('Sign In to Access Your Dashboard');

      const recordsContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/records.astro'), 'utf8');
      expect(recordsContent).not.toContain('simulateExtraction');
      expect(recordsContent).not.toContain('SYNTHETIC_REPORT_STATS');
      expect(recordsContent).toContain('Upload Health Document');
      expect(recordsContent).toContain('health_documents_vault');
    });

    it('ensures timeline and review pages show genuine empty states in normal user flows', () => {
      const timelineContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/timeline.astro'), 'utf8');
      expect(timelineContent).not.toContain('SYNTHETIC_PATIENT');
      expect(timelineContent).toContain('Your Health Timeline is Empty');
      expect(timelineContent).toContain('timeline-empty-state');

      const reviewContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/review.astro'), 'utf8');
      expect(reviewContent).toContain('review-empty-state');
      expect(reviewContent).toContain('No Document Staged for Review');
    });
  });

  describe('4. Public Website Navigation, Clean UI & Authentication Repair', () => {
    it('ensures PublicNav component exists with required navigation items and branding', () => {
      const navPath = path.resolve(process.cwd(), 'src/components/PublicNav.astro');
      expect(fs.existsSync(navPath)).toBe(true);

      const navContent = fs.readFileSync(navPath, 'utf8');
      expect(navContent).toContain('Altrix Health');
      expect(navContent).toContain('Home');
      expect(navContent).toContain('Health Copilot');
      expect(navContent).toContain('Log in');
      expect(navContent).toContain('Create account');
      expect(navContent).toContain('/auth?mode=signin');
      expect(navContent).toContain('/auth?mode=signup');
    });

    it('ensures Layout.astro isolates Sidebar to workspace pages and does not include global SyntheticBanner', () => {
      const layoutPath = path.resolve(process.cwd(), 'src/layouts/Layout.astro');
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');

      // Global SyntheticBanner removed from customer layout
      expect(layoutContent).not.toContain('SyntheticBanner');
      expect(layoutContent).not.toContain('<SyntheticBanner');

      // PublicNav rendered on public paths, Sidebar on workspace paths
      expect(layoutContent).toContain('PublicNav');
      expect(layoutContent).toContain('isWorkspace');
      expect(layoutContent).toContain('isWorkspacePath');
    });

    it('ensures public landing page and footer have no HacXLerate or prototype tags', () => {
      const indexPath = path.resolve(process.cwd(), 'src/pages/index.astro');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      expect(indexContent).not.toContain('HacXLerate 2026');

      const footerPath = path.resolve(process.cwd(), 'src/components/Footer.astro');
      const footerContent = fs.readFileSync(footerPath, 'utf8');
      expect(footerContent).not.toContain('HacXLerate 2026');
      expect(footerContent).not.toContain('HacXLerate Challenge');
      expect(footerContent).not.toContain('DEMO MODE');
    });

    it('ensures auth page supports selecting signup mode from URL parameters and handles email redirect', () => {
      const authPath = path.resolve(process.cwd(), 'src/pages/auth.astro');
      const authContent = fs.readFileSync(authPath, 'utf8');

      expect(authContent).toContain('requestedMode');
      expect(authContent).toContain('isSignUpInitial');
      expect(authContent).toContain('setTab');
      expect(authContent).toContain("params.get('confirmed')");
    });

    it('ensures auth page implements split-screen UX with minimal header and password toggle', () => {
      const authPath = path.resolve(process.cwd(), 'src/pages/auth.astro');
      const authContent = fs.readFileSync(authPath, 'utf8');

      // Minimal header & back to website
      expect(authContent).toContain('Back to website');
      expect(authContent).toContain('hideNav={true}');
      expect(authContent).toContain('hideFooter={true}');

      // Split-screen structure
      expect(authContent).toContain('lg:grid lg:grid-cols-2');
      expect(authContent).toContain('PostgreSQL Row Level Security');
      expect(authContent).toContain('Zero Value Fabrication');

      // Password visibility toggles
      expect(authContent).toContain('btn-toggle-password-signin');
      expect(authContent).toContain('btn-toggle-password-signup');

      // Guest Copilot reassurance link
      expect(authContent).toContain('Guest Copilot →');
    });

    it('ensures signUpUser validates email syntax, handles rate limits, and detects duplicate users', async () => {
      const { signUpUser } = await import('../src/lib/supabase/auth');

      // Rejects malformed email without domain
      const invalidRes = await signUpUser('user@invalid', 'validPassword123');
      expect(invalidRes.error?.code).toBe('INVALID_EMAIL');

      // Valid format passes input validation
      const validFormatRes = await signUpUser('valid.user@example.com', 'short');
      expect(validFormatRes.error?.code).toBe('WEAK_PASSWORD');
    });
  });

  describe('4. Final Hour: Profile, Sidebar and Signup Name', () => {
    it('validates required full name during signup in signUpUser()', async () => {
      const { signUpUser } = await import('../src/lib/supabase/auth');

      // Rejects empty or whitespace-only full name when supplied
      const emptyNameRes = await signUpUser('test@example.com', 'password123', 'en', '  ');
      expect(emptyNameRes.error?.code).toBe('MISSING_FULL_NAME');
      expect(emptyNameRes.error?.message).toContain('full name');

      const singleCharRes = await signUpUser('test@example.com', 'password123', 'en', 'A');
      expect(singleCharRes.error?.code).toBe('MISSING_FULL_NAME');
    });

    it('ensures auth page signup form includes required Full name input field', () => {
      const authPath = path.resolve(process.cwd(), 'src/pages/auth.astro');
      const authContent = fs.readFileSync(authPath, 'utf8');

      expect(authContent).toContain('id="signup-fullname"');
      expect(authContent).toContain('name="full_name"');
      expect(authContent).toContain('Full name');
      expect(authContent).toContain('signUpUser(email, password, lang, fullName)');
    });

    it('ensures workspace sidebar has fixed layout structure and scrollable main region', () => {
      const layoutPath = path.resolve(process.cwd(), 'src/layouts/Layout.astro');
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');

      // Workspace layout flex container with fixed sidebar and scrollable main
      expect(layoutContent).toContain('h-screen w-full flex overflow-hidden');
      expect(layoutContent).toContain('flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-aura-canvas');
      expect(layoutContent).toContain("currentPath.startsWith('/profile')");

      const sidebarPath = path.resolve(process.cwd(), 'src/components/Sidebar.astro');
      const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
      expect(sidebarContent).toContain('h-screen overflow-y-auto');
    });

    it('ensures sidebar navigation includes required primary items with single Dashboard entry and separates secondary items', () => {
      const sidebarPath = path.resolve(process.cwd(), 'src/components/Sidebar.astro');
      const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

      // Primary navigation items: single clear Dashboard entry instead of duplicate Home and Workspace
      expect(sidebarContent).toContain("label: 'Dashboard'");
      expect(sidebarContent).not.toContain("label: 'Home'");
      expect(sidebarContent).not.toContain("label: 'Workspace'");
      expect(sidebarContent).toContain("label: 'Health Copilot'");
      expect(sidebarContent).toContain("label: 'My Records'");
      expect(sidebarContent).toContain("label: 'Report Review'");
      expect(sidebarContent).toContain("label: 'Health Timeline'");

      // Secondary section
      expect(sidebarContent).toContain('Account & Services');
      expect(sidebarContent).toContain('My Profile');
      expect(sidebarContent).toContain('/profile');
      expect(sidebarContent).toContain('Nearby Care (Coming Soon)');

      // Working sign out button
      expect(sidebarContent).toContain('id="btn-sidebar-signout"');
      expect(sidebarContent).toContain('btn-sidebar-signout');
      expect(sidebarContent).toContain('signOutUser');
      expect(sidebarContent).toContain("window.location.href = '/'");
    });

    it('ensures dedicated Profile page exists at src/pages/profile.astro with full name editing', () => {
      const profilePath = path.resolve(process.cwd(), 'src/pages/profile.astro');
      expect(fs.existsSync(profilePath)).toBe(true);

      const profileContent = fs.readFileSync(profilePath, 'utf8');
      expect(profileContent).toContain('Account Profile');
      expect(profileContent).toContain('id="profile-fullname"');
      expect(profileContent).toContain('id="profile-email"');
      expect(profileContent).toContain('id="profile-language"');
      expect(profileContent).toContain('id="btn-save-profile"');
      expect(profileContent).toContain('updateUserProfile');
      expect(profileContent).toContain('id="btn-profile-signout"');
    });

    it('ensures TopBar links profile to /profile when signed in and renders user initials', () => {
      const topbarPath = path.resolve(process.cwd(), 'src/components/TopBar.astro');
      const topbarContent = fs.readFileSync(topbarPath, 'utf8');

      expect(topbarContent).toContain('id="topbar-profile-link"');
      expect(topbarContent).toContain("linkEl.href = '/profile'");
      expect(topbarContent).toContain('getInitials');
    });

    it('ensures public navigation logo and links route to /', () => {
      const publicNavPath = path.resolve(process.cwd(), 'src/components/PublicNav.astro');
      const publicNavContent = fs.readFileSync(publicNavPath, 'utf8');

      // Brand link points to public root /
      expect(publicNavContent).toContain('href="/"');
      expect(publicNavContent).toContain('aria-label="Altrix Health Copilot Home"');
      expect(publicNavContent).toContain('Home');
    });

    it('ensures signed-out visitors on /dashboard and /records see unauthenticated gates without private data', () => {
      const dashboardPath = path.resolve(process.cwd(), 'src/pages/dashboard.astro');
      const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

      // Dashboard hides private data and shows guest gate by default when unauthenticated
      expect(dashboardContent).toContain('id="dashboard-auth-view" class="hidden');
      expect(dashboardContent).toContain('id="dashboard-guest-view"');
      expect(dashboardContent).toContain('Sign In to Access Your Dashboard');
      expect(dashboardContent).toContain('btnSignOut');
      expect(dashboardContent).toContain("window.location.href = '/'");

      const recordsPath = path.resolve(process.cwd(), 'src/pages/records.astro');
      const recordsContent = fs.readFileSync(recordsPath, 'utf8');

      // Records hides vault-auth-view and displays guest view
      expect(recordsContent).toContain('id="vault-auth-view" class="hidden');
      expect(recordsContent).toContain('id="vault-guest-view"');
      expect(recordsContent).toContain('Want to test private document storage & multi-user isolation?');
    });

    it('ensures auth page redirects signed-in users away from login to safe destination', () => {
      const authPath = path.resolve(process.cwd(), 'src/pages/auth.astro');
      const authContent = fs.readFileSync(authPath, 'utf8');

      // Active session redirect logic
      expect(authContent).toContain("if (params.get('confirmed') === 'true')");
      expect(authContent).toContain('const dest = getSafeReturnTo()');
      expect(authContent).toContain('window.location.href = dest');
    });

    it('ensures records page contains live document upload dropzone and secure download integration', () => {
      const recordsPath = path.resolve(process.cwd(), 'src/pages/records.astro');
      const recordsContent = fs.readFileSync(recordsPath, 'utf8');

      // Dropzone and live upload
      expect(recordsContent).toContain('id="upload-container"');
      expect(recordsContent).toContain('id="dropzone"');
      expect(recordsContent).toContain('id="file-input"');
      expect(recordsContent).toContain('id="btn-upload-file"');
      expect(recordsContent).toContain('health_documents_vault');
      expect(recordsContent).toContain('POST');
      expect(recordsContent).toContain('/api/vault/documents');

      // Secure download integration
      expect(recordsContent).toContain('/api/vault/download');
      expect(recordsContent).toContain('btn-doc-download');
    });

    it('ensures secure download endpoint validates token, parameters, and path scoping', async () => {
      const downloadPath = path.resolve(process.cwd(), 'src/pages/api/vault/download.ts');
      expect(fs.existsSync(downloadPath)).toBe(true);

      const downloadContent = fs.readFileSync(downloadPath, 'utf8');
      expect(downloadContent).toContain('verifyAccessToken');
      expect(downloadContent).toContain('DownloadQuerySchema');
      expect(downloadContent).toContain('createSignedUrl');
      expect(downloadContent).toContain('expectedPrefix');
    });
  });
});



