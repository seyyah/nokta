import { router } from 'expo-router';

export interface ForgeCycle {
  id: string;
  reportName: string;
  hypothesis: string;
  result: 'SUCCESS' | 'FAIL' | 'ROLLBACK' | 'STUCK';
  changedFiles: string;
  testResult: string;
  commitHash: string;
  kg: number;
  humanTouchPoints: number;
  startTime: string;
  endTime: string;
}

export interface BridgeLogEntry {
  roomId: string;
  startTime: string;
  endTime: string;
  stuckTopic: string;
  summary: string;
  participants: number;
  nextCycleContext?: string;
}

export class ForgeHeuristicsService {
  /**
   * Helper to extract the topic (konu) from the report name or path
   * e.g., 'bug-report-2026-05-18-19-15-onboarding.md' -> 'onboarding'
   */
  public static extractTopic(reportName: string): string {
    if (!reportName) return 'general';
    // Match the trailing part after date and before extension
    const matches = reportName.match(/(?:report-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-)?([a-zA-Z0-9_-]+)(?:\.md)?$/);
    if (matches && matches[1]) {
      // Clean up common prefixes
      return matches[1].replace(/^(voice-|bug-)/, '');
    }
    return reportName.toLowerCase();
  }

  /**
   * Checks if a specific topic is STUCK.
   * Stuck Condition:
   * - 2 consecutive FAIL states for the same topic OR
   * - 2 consecutive ROLLBACK states for the same topic.
   */
  public static isTopicStuck(cycles: ForgeCycle[], topic: string): boolean {
    const topicCycles = cycles.filter(
      (c) => this.extractTopic(c.reportName) === topic.toLowerCase()
    );

    // Sort by cycle ID or time to inspect chronological sequence
    const sorted = [...topicCycles].sort((a, b) => Number(a.id) - Number(b.id));

    if (sorted.length < 2) return false;

    // Check consecutive outcomes
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i].result;
      const next = sorted[i + 1].result;

      if (
        (current === 'FAIL' && next === 'FAIL') ||
        (current === 'ROLLBACK' && next === 'ROLLBACK')
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Analyzes all cycles and returns a list of topics that are currently STUCK.
   */
  public static getStuckTopics(cycles: ForgeCycle[]): string[] {
    const topics = Array.from(new Set(cycles.map((c) => this.extractTopic(c.reportName))));
    return topics.filter((t) => this.isTopicStuck(cycles, t));
  }

  /**
   * After adding a new cycle result, check if the topic is now STUCK.
   * If STUCK, automatically navigate to the Expert Bridge screen.
   *
   * @param cycles   Full list of cycles (including the new one just added)
   * @param newCycle The cycle that was just completed
   * @returns true if STUCK and bridge was triggered, false otherwise
   */
  public static checkAndTriggerBridge(
    cycles: ForgeCycle[],
    newCycle: ForgeCycle
  ): boolean {
    const topic = this.extractTopic(newCycle.reportName);

    if (this.isTopicStuck(cycles, topic)) {
      console.warn(
        `[ForgeHeuristics] STUCK detected for topic: "${topic}". Triggering Expert Bridge...`
      );

      // Navigate to bridge screen with topic context and auto-trigger flag
      router.push({
        pathname: '/bridge',
        params: {
          stuckTopic: topic,
          auto: 'true',
        },
      });

      return true;
    }

    return false;
  }

  /**
   * Builds a FORGE.md cycle log entry string (20-minute box format).
   */
  public static buildForgeEntry(cycle: ForgeCycle): string {
    const start = new Date(cycle.startTime);
    const end = new Date(cycle.endTime);
    const durMin = Math.round((end.getTime() - start.getTime()) / 60000);

    const resultEmoji = {
      SUCCESS: '✅',
      FAIL: '❌',
      ROLLBACK: '↩️',
      STUCK: '🔴',
    }[cycle.result];

    return `
## Cycle #${cycle.id} — ${this.extractTopic(cycle.reportName).toUpperCase()}

| Alan              | Değer                                      |
|-------------------|--------------------------------------------|
| Rapor             | \`${cycle.reportName}\`                      |
| Hipotez           | ${cycle.hypothesis}                         |
| Sonuç             | ${resultEmoji} **${cycle.result}**          |
| Başlangıç         | ${cycle.startTime}                         |
| Bitiş             | ${cycle.endTime}                           |
| Süre              | ~${durMin} dk                              |
| Değiştirilen      | \`${cycle.changedFiles}\`                   |
| Test Çıktısı      | ${cycle.testResult}                        |
| KG                | ${cycle.kg}                                |
| İnsan Müdahalesi  | ${cycle.humanTouchPoints}                  |

---
`;
  }

  /**
   * Builds a BRIDGE.md log entry string.
   */
  public static buildBridgeEntry(entry: BridgeLogEntry): string {
    const dur = Math.round(
      (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 1000
    );

    return `
## Expert Bridge Log — ${entry.startTime.slice(0, 10)}

| Alan       | Değer                        |
|------------|------------------------------|
| Oda ID     | \`${entry.roomId}\`           |
| Başlangıç  | ${entry.startTime}           |
| Bitiş      | ${entry.endTime}             |
| Süre       | ${dur}s                      |
| Katılımcı  | ${entry.participants}        |
| STUCK Konu | \`${entry.stuckTopic}\`      |

### Görüşme Özeti
${entry.summary}

### Sonraki Cycle için Context
${entry.nextCycleContext || `> "${entry.stuckTopic}" konusundaki çözüm önerisi bir sonraki Forge cycle'ına hipotez olarak feed edilecek.`}

---
`;
  }
}
