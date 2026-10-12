import { describe, it, expect } from 'vitest';
import {
  routeGuestQuery,
  getGuideById,
  getFeaturedTopicSuggestions,
} from '../src/lib/ai/guest-router';
import { HEALTH_GUIDES_EN } from '../src/data/health-guides-en';
import { HEALTH_GUIDES_TE } from '../src/data/health-guides-te';

describe('Guest Health Copilot — Intent Router & Safety Gates', () => {
  describe('Gate 1: Emergency Red Flag Detection', () => {
    it('intercepts chest pain immediately as an emergency in English', () => {
      const res = routeGuestQuery('I have severe chest pain radiating to my arm', 'en');
      expect(res.matched).toBe(true);
      expect(res.isEmergency).toBe(true);
      expect(res.intent).toBe('emergency_red_flag');
      expect(res.guide?.id).toBe('emergency-signs');
      expect(res.guide?.warningSigns.length).toBeGreaterThan(0);
    });

    it('intercepts difficulty breathing immediately as an emergency in English', () => {
      const res = routeGuestQuery('Help I cannot breathe right now', 'en');
      expect(res.matched).toBe(true);
      expect(res.isEmergency).toBe(true);
      expect(res.intent).toBe('emergency_red_flag');
    });

    it('intercepts stroke symptoms in English', () => {
      const res = routeGuestQuery('My mother has face drooping and slurred speech', 'en');
      expect(res.matched).toBe(true);
      expect(res.isEmergency).toBe(true);
      expect(res.intent).toBe('emergency_red_flag');
    });

    it('intercepts emergency red flags in Telugu (ఛాతీ నొప్పి / గుండెపోటు)', () => {
      const res = routeGuestQuery('నాకు విపరీతమైన ఛాతీ నొప్పి వస్తోంది', 'te');
      expect(res.matched).toBe(true);
      expect(res.isEmergency).toBe(true);
      expect(res.intent).toBe('emergency_red_flag');
      expect(res.guide?.locale).toBe('te');
    });
  });

  describe('Gate 2: Individualized Dosage Interception', () => {
    it('blocks specific dosage request and routes to safe medicine principles', () => {
      const res = routeGuestQuery('How many tablets of paracetamol should I take?', 'en');
      expect(res.matched).toBe(true);
      expect(res.isEmergency).toBe(false);
      expect(res.intent).toBe('blocked_dosage_request');
      expect(res.guide?.id).toBe('medicine-info');
    });

    it('blocks child dose queries', () => {
      const res = routeGuestQuery('What is the dosage for my child with fever?', 'en');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('blocked_dosage_request');
    });

    it('blocks dosage queries in Telugu (ఎంత డోస్)', () => {
      const res = routeGuestQuery('పిల్లలకి పారాసిటమాల్ ఎంత డోస్ ఇవ్వాలి?', 'te');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('blocked_dosage_request');
    });
  });

  describe('Gate 3: Supported Symptom, Medicine & First Aid Matching', () => {
    it('matches fever query in English', () => {
      const res = routeGuestQuery('I have a mild fever with chills', 'en');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('fever');
      expect(res.guide?.title).toContain('Fever');
      expect(res.guide?.sourceUrl).toContain('medlineplus.gov');
    });

    it('matches cold and cough query in English', () => {
      const res = routeGuestQuery('What should I do for a runny nose and dry cough?', 'en');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('cold-cough');
      expect(res.guide?.sourceName).toContain('CDC');
    });

    it('matches headache query in English', () => {
      const res = routeGuestQuery('I am having a severe throbbing migraine', 'en');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('headache');
    });

    it('matches stomach pain query in English', () => {
      const res = routeGuestQuery('Experiencing abdominal pain and indigestion', 'en');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('stomach-pain');
    });

    it('matches CPR request in English', () => {
      const res = routeGuestQuery('How do I perform hands only cpr?', 'en');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('cpr');
      expect(res.guide?.sourceName).toContain('American Heart Association');
    });

    it('matches general wellness query in English', () => {
      const res = routeGuestQuery('How much water should I drink per day for hydration?', 'en');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('wellness');
    });
  });

  describe('Gate 4: Telugu Language Catalogue Matching', () => {
    it('matches fever query in Telugu (జ్వరం)', () => {
      const res = routeGuestQuery('నాకు చలి జ్వరం వస్తోంది', 'te');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('fever');
      expect(res.guide?.locale).toBe('te');
      expect(res.guide?.title).toContain('జ్వరం');
    });

    it('matches cold & cough query in Telugu (జలుబు)', () => {
      const res = routeGuestQuery('జలుబు మరియు దగ్గు ఎక్కువగా ఉంది', 'te');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('cold-cough');
      expect(res.guide?.locale).toBe('te');
    });

    it('matches stomach pain query in Telugu (కడుపు నొప్పి)', () => {
      const res = routeGuestQuery('తీవ్రమైన కడుపు నొప్పి వస్తోంది', 'te');
      expect(res.matched).toBe(true);
      expect(res.intent).toBe('stomach-pain');
      expect(res.guide?.locale).toBe('te');
    });
  });

  describe('Gate 5: Unsupported & Empty Queries', () => {
    it('safely handles empty queries', () => {
      const res = routeGuestQuery('   ', 'en');
      expect(res.matched).toBe(false);
      expect(res.intent).toBe('empty');
      expect(res.suggestedTopics?.length).toBeGreaterThan(0);
    });

    it('gracefully handles unknown medical topics without inventing medical facts', () => {
      const res = routeGuestQuery('Can you prescribe steroids for a rare rash?', 'en');
      expect(res.matched).toBe(false);
      expect(res.intent).toBe('unsupported_query');
      expect(res.isEmergency).toBe(false);
      expect(res.suggestedTopics?.length).toBeGreaterThan(0);
    });
  });

  describe('Catalogue Integrity & Source Citations', () => {
    it('verifies all English guides have required fields, citations, and disclaimers', () => {
      const guides = Object.values(HEALTH_GUIDES_EN);
      expect(guides.length).toBeGreaterThanOrEqual(7);

      for (const guide of guides) {
        expect(guide.id).toBeDefined();
        expect(guide.title.length).toBeGreaterThan(0);
        expect(guide.summary.length).toBeGreaterThan(0);
        expect(guide.warningSigns.length).toBeGreaterThan(0);
        expect(guide.nextSteps.length).toBeGreaterThan(0);
        expect(guide.sourceName.length).toBeGreaterThan(0);
        expect(guide.sourceUrl.startsWith('https://')).toBe(true);
        expect(guide.reviewedDate).toBeDefined();
        expect(guide.clinicalDisclaimer.length).toBeGreaterThan(0);
      }
    });

    it('verifies all Telugu guides have required fields and source citations', () => {
      const guides = Object.values(HEALTH_GUIDES_TE);
      expect(guides.length).toBeGreaterThanOrEqual(7);

      for (const guide of guides) {
        expect(guide.locale).toBe('te');
        expect(guide.title.length).toBeGreaterThan(0);
        expect(guide.summary.length).toBeGreaterThan(0);
        expect(guide.sourceUrl.startsWith('https://')).toBe(true);
      }
    });
  });
});
