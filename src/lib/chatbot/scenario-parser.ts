import type { ChatScenario, SafetyLevel, SourceCitation } from '../../types/healthChat';

/**
 * Standard trusted health citations mapped for topics previously reviewed by PM/CTO.
 * Unmapped scenarios are flagged as 'unspecified_in_source' per CTO directive.
 */
const VERIFIED_CITATIONS_MAP: Record<string, SourceCitation[]> = {
  'scenario-01': [
    { title: 'Fever in Adults and Children', url: 'https://medlineplus.gov/fever.html', organization: 'MedlinePlus' },
    { title: 'Fever Symptoms and Care', url: 'https://www.cdc.gov', organization: 'CDC' },
  ],
  'scenario-02': [
    { title: 'Headache Causes and Warnings', url: 'https://medlineplus.gov/headache.html', organization: 'MedlinePlus' },
  ],
  'scenario-03': [
    { title: 'Cough Evaluation and Care', url: 'https://medlineplus.gov/cough.html', organization: 'MedlinePlus' },
  ],
  'scenario-09': [
    { title: 'Abdominal Pain Warning Signs', url: 'https://medlineplus.gov/abdominalpain.html', organization: 'MedlinePlus' },
  ],
  'scenario-10': [
    { title: 'Heartburn and Reflux Overview', url: 'https://medlineplus.gov/heartburn.html', organization: 'MedlinePlus' },
  ],
  'scenario-21': [
    { title: 'Breathing Difficulty Emergency', url: 'https://medlineplus.gov/breathingproblems.html', organization: 'MedlinePlus' },
    { title: 'India National Emergency Services 112', url: 'https://112.gov.in', organization: 'Emergency Response Support System (India)' },
  ],
  'scenario-22': [
    { title: 'Warning Signs of a Heart Attack', url: 'https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack', organization: 'American Heart Association' },
    { title: 'India National Emergency Services 112', url: 'https://112.gov.in', organization: 'Emergency Response Support System (India)' },
  ],
  'scenario-23': [
    { title: 'Stroke Warning Signs (FAST)', url: 'https://www.heart.org/en/health-topics/stroke/signs-and-symptoms-of-stroke', organization: 'American Heart Association' },
    { title: 'India National Emergency Services 112', url: 'https://112.gov.in', organization: 'Emergency Response Support System (India)' },
  ],
  'scenario-24': [
    { title: 'First Aid for Severe Bleeding', url: 'https://medlineplus.gov/bleeding.html', organization: 'MedlinePlus' },
    { title: 'India National Emergency Services 112', url: 'https://112.gov.in', organization: 'Emergency Response Support System (India)' },
  ],
  'scenario-25': [
    { title: 'Anaphylaxis Emergency Management', url: 'https://medlineplus.gov/anaphylaxis.html', organization: 'MedlinePlus' },
    { title: 'India National Emergency Services 112', url: 'https://112.gov.in', organization: 'Emergency Response Support System (India)' },
  ],
  'scenario-33': [
    { title: 'Safe Medicine Use and Prescription Labels', url: 'https://medlineplus.gov/safemedicineuse.html', organization: 'MedlinePlus' },
  ],
  'scenario-34': [
    { title: 'Safe Medicine Administration', url: 'https://medlineplus.gov/safemedicineuse.html', organization: 'MedlinePlus' },
  ],
  'scenario-35': [
    { title: 'Drug Reactions and Side Effects', url: 'https://medlineplus.gov/drugreactions.html', organization: 'MedlinePlus' },
  ],
  'scenario-36': [
    { title: 'Drug Interactions Safety', url: 'https://medlineplus.gov/druginteractions.html', organization: 'MedlinePlus' },
  ],
};

/**
 * Parses the canonical health_copilot_40_chatbot_scenarios.md markdown content
 * into an array of typed ChatScenario records.
 */
export function parseScenariosFromMarkdown(markdownContent: string): ChatScenario[] {
  const scenarioRegex = /## Scenario (\d{2}) — ([^\r\n]+)([\s\S]*?)(?=(?:## Scenario \d{2} —)|(?:# Emergency routing rules)|$)/g;
  let match: RegExpExecArray | null;
  const scenarios: ChatScenario[] = [];

  while ((match = scenarioRegex.exec(markdownContent)) !== null) {
    const numStr = match[1];
    const scenarioNumber = parseInt(numStr, 10);
    const id = `scenario-${numStr}`;
    const title = match[2].trim();
    const body = match[3];

    // Extract Example User Input
    const exampleMatch = body.match(/\*\*Example user input:\*\*\s*[“"]([^”"]+)[”"]/);
    const exampleInput = exampleMatch ? exampleMatch[1].trim() : '';

    // Extract Triggers / Keywords
    const triggersMatch = body.match(/\*\*Triggers \/ keywords:\*\*\s*([^\r\n]+)/);
    let triggers: string[] = [];
    if (triggersMatch) {
      const rawTriggers = triggersMatch[1];
      const codeMatches = rawTriggers.match(/`([^`]+)`/g);
      if (codeMatches && codeMatches.length > 0) {
        triggers = codeMatches.map((t) => t.replace(/`/g, '').trim());
      } else {
        triggers = [rawTriggers.trim()];
      }
    }

    // Extract Safety Level
    const safetyMatch = body.match(/\*\*Safety level:\*\*\s*([^\r\n]+)/);
    let safetyLevel: SafetyLevel = 'routine';
    if (safetyMatch) {
      const levelStr = safetyMatch[1].toLowerCase();
      if (levelStr.includes('urgent')) {
        safetyLevel = 'urgent';
      } else if (levelStr.includes('caution')) {
        safetyLevel = 'caution';
      }
    } else if ([33, 34, 35, 36].includes(scenarioNumber)) {
      safetyLevel = 'caution';
    }

    // Extract Predefined Response
    const responseMatch = body.match(/\*\*Predefined response:\*\*[\r\n\s]+[“"]?([\s\S]*?)[”"]?(?=[\r\n]+\*\*Quick replies:\*\*|$)/);
    let response = responseMatch ? responseMatch[1].trim() : '';
    // Strip leading/trailing typographic quotes
    response = response.replace(/^[“"]|[”"]$/g, '').trim();

    // Extract Quick Replies
    const quickRepliesMatch = body.match(/\*\*Quick replies:\*\*\s*([^\r\n]+)/);
    let quickReplies: string[] = [];
    if (quickRepliesMatch) {
      const rawQR = quickRepliesMatch[1];
      const codeMatches = rawQR.match(/`([^`]+)`/g);
      if (codeMatches && codeMatches.length > 0) {
        quickReplies = codeMatches.map((t) => t.replace(/`/g, '').trim());
      }
    }

    // Extract Flow Notes
    const flowMatch = body.match(/\*\*Flow:\*\*\s*([^\r\n]+)/);
    const flowNotes = flowMatch ? flowMatch[1].trim() : undefined;

    // Citations & Translation Status
    const verifiedCitations = VERIFIED_CITATIONS_MAP[id];
    const citationStatus = verifiedCitations && verifiedCitations.length > 0 ? 'verified' : 'unspecified_in_source';
    const sourceCitations: SourceCitation[] = verifiedCitations || [];

    const isTelugu = scenarioNumber === 39;
    const hasTeluguTranslation = isTelugu;
    const teluguResponse = isTelugu ? response : undefined;

    scenarios.push({
      id,
      scenarioNumber,
      title,
      exampleInput,
      triggers,
      keywords: triggers.map((t) => t.toLowerCase()),
      response,
      quickReplies,
      safetyLevel,
      disclaimer: 'Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.',
      flowNotes,
      sourceCitations,
      citationStatus,
      hasTeluguTranslation,
      teluguResponse,
    });
  }

  return scenarios;
}
