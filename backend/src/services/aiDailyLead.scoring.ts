export type AiScoringRule = {
  key: string;
  label: string;
  weight: number;
  action: string;
  isActive: boolean;
};

export type AiLeadScoringInput = {
  notes: string[];
  activities: string[];
  lastFollowupAt: Date | null;
  now: Date;
};

export type AiLeadScore = {
  excluded: boolean;
  score: number;
  reason: string;
  reasonCategory: string;
  lastNote: string | null;
  lastFollowupAt: Date | null;
};

/**
 * Provider boundary for future OpenAI/Gemini/Claude/Ollama integrations.
 * The batch service and its API only depend on this contract.
 */
export interface AiLeadScoringProvider {
  score(input: AiLeadScoringInput, rules: AiScoringRule[]): AiLeadScore;
}

function normalize(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function ruleMatches(text: string, key: string) {
  const readable = key.replace(/_/g, " ");
  return text.includes(readable);
}

export class InternalAiLeadScoringProvider implements AiLeadScoringProvider {
  score(input: AiLeadScoringInput, rules: AiScoringRule[]): AiLeadScore {
    const notes = input.notes.filter(Boolean).slice(0, 20);
    const signalText = normalize([...notes, ...input.activities].join("\n"));
    const matched: Array<{ rule: AiScoringRule; count: number }> = [];

    for (const rule of rules.filter((entry) => entry.isActive)) {
      const count = signalText.split(rule.key.replace(/_/g, " ")).length - 1;
      if (count > 0 || ruleMatches(signalText, rule.key)) {
        matched.push({ rule, count: Math.max(count, 1) });
      }
    }

    const exclusion = matched.find(({ rule }) => rule.action === "EXCLUDE");
    const lastNote = notes[0] || null;
    if (exclusion) {
      return {
        excluded: true,
        score: 0,
        reason: `Excluded: ${exclusion.rule.label}`,
        reasonCategory: exclusion.rule.key,
        lastNote,
        lastFollowupAt: input.lastFollowupAt,
      };
    }

    let score = 0;
    const reasons: string[] = [];
    for (const { rule, count } of matched) {
      const repetition = rule.key === "NO_ANS" ? Math.min(count, 3) : 1;
      score += rule.weight * repetition;
      reasons.push(rule.label);
    }

    // Internal semantic fallback for free-form notes. This is intentionally
    // separate from the persisted rules so a future LLM provider can replace
    // it without changing batch storage or the API contract.
    const customSignals = [
      { pattern: /CALL (AFTER|ON)|WAITING FOR/, score: 45, reason: "Customer requested a later callback" },
      { pattern: /INTERESTED|NEED PRICE|WAITING FOR APPROVAL/, score: 40, reason: "Purchase interest found in notes" },
      { pattern: /QUOTATION SENT|QUOTE SENT/, score: 35, reason: "Waiting after quotation" },
      { pattern: /MEETING FIXED|VISIT COMPLETED|WILL VISIT/, score: 35, reason: "Meeting or visit activity found" },
      { pattern: /SAMPLE SENT|NEED SAMPLE/, score: 30, reason: "Sample follow-up required" },
    ];
    for (const signal of customSignals) {
      if (signal.pattern.test(signalText)) {
        score += signal.score;
        reasons.push(signal.reason);
      }
    }

    if (input.lastFollowupAt) {
      const days = Math.max(0, Math.floor((input.now.getTime() - input.lastFollowupAt.getTime()) / 86_400_000));
      if (days >= 14) {
        score += 18;
        reasons.push(`No follow-up for ${days} days`);
      } else if (days >= 7) {
        score += 12;
        reasons.push(`No follow-up for ${days} days`);
      } else if (days >= 4) {
        score += 6;
      }
    } else {
      score += 8;
      reasons.push("No follow-up recorded yet");
    }

    const primary = matched
      .filter(({ rule }) => rule.weight > 0)
      .sort((a, b) => b.rule.weight - a.rule.weight)[0]?.rule;

    return {
      excluded: false,
      score: Math.max(0, Math.min(100, Math.round(score))),
      reason: reasons.slice(0, 3).join(" · ") || "Recent customer activity requires review",
      reasonCategory: primary?.key || "ACTIVITY_REVIEW",
      lastNote,
      lastFollowupAt: input.lastFollowupAt,
    };
  }
}
