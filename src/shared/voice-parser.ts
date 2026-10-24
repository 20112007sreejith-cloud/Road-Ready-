// src/shared/voice-parser.ts
// Voice-Assisted Identifier Parser & Ambiguity Engine for RTO One

export interface DetectedAmbiguity {
  index: number;
  character: string;
  alternatives: string[];
  reason: string;
  recommendedValue: string;
}

export interface VoiceParseResult {
  rawTranscript: string;
  cleanedText: string;
  normalizedIdentifier: string;
  formattedDisplay: string;
  type: 'VEHICLE_REGISTRATION' | 'DRIVING_LICENCE' | 'UNKNOWN';
  isValidFormat: boolean;
  ambiguities: DetectedAmbiguity[];
  requiresConfirmation: boolean;
  confidenceScore: number;
}

export class VoiceIdentifierParser {
  private static readonly SPOKEN_WORDS_MAP: Record<string, string> = {
    // Digits
    zero: '0',
    oh: '0',
    one: '1',
    won: '1',
    two: '2',
    too: '2',
    to: '2',
    three: '3',
    tree: '3',
    four: '4',
    for: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    ate: '8',
    nine: '9',
    double: 'DOUBLE', // handled in tokenizer

    // NATO / Phonetic Alphabets
    alpha: 'A',
    bravo: 'B',
    charlie: 'C',
    delta: 'D',
    echo: 'E',
    foxtrot: 'F',
    golf: 'G',
    hotel: 'H',
    india: 'I',
    juliet: 'J',
    kilo: 'K',
    lima: 'L',
    mike: 'M',
    november: 'N',
    oscar: 'O',
    papa: 'P',
    quebec: 'Q',
    romeo: 'R',
    sierra: 'S',
    tango: 'T',
    uniform: 'U',
    victor: 'V',
    whiskey: 'W',
    xray: 'X',
    yankee: 'Y',
    zulu: 'Z',
  };

  /**
   * Normalize spoken speech transcript to candidate alphanumeric string
   */
  public static normalizeTranscript(transcript: string): string {
    if (!transcript) return '';

    // Convert to lowercase and split by spaces/punctuation
    const tokens = transcript
      .toLowerCase()
      .replace(/[-_./,\\]/g, ' ')
      .trim()
      .split(/\s+/);

    const charList: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === 'double' && i + 1 < tokens.length) {
        const nextToken = tokens[i + 1];
        const mapped = this.SPOKEN_WORDS_MAP[nextToken] || nextToken.toUpperCase();
        if (mapped.length === 1) {
          charList.push(mapped, mapped);
          i++; // skip next
          continue;
        }
      }

      if (this.SPOKEN_WORDS_MAP[token]) {
        charList.push(this.SPOKEN_WORDS_MAP[token]);
      } else {
        // Alphanumeric character chunks
        const cleaned = token.replace(/[^a-z0-9]/g, '').toUpperCase();
        for (const ch of cleaned) {
          charList.push(ch);
        }
      }
    }

    return charList.join('');
  }

  /**
   * Parse and detect ambiguities (O vs 0, B vs 8, I vs 1)
   */
  public static parse(transcript: string): VoiceParseResult {
    const rawTranscript = transcript;
    const cleanedText = transcript.trim();
    const candidate = this.normalizeTranscript(transcript);

    const ambiguities: DetectedAmbiguity[] = [];

    // Indian Vehicle Reg Pattern: [State 2 letters][RTO 2 digits][Series 1-3 letters][Number 4 digits]
    // Example: KA01AB1234, MH12DE5021, DL04C1234
    // DL pattern: [State 2 letters][Year/Code 2-4 digits][Number 7-11 digits]

    // Check positions for character vs digit ambiguity
    for (let i = 0; i < candidate.length; i++) {
      const char = candidate[i];

      // Ambiguity: 'O' vs '0'
      if (char === 'O' || char === '0') {
        // In index 0 or 1: must be State letters (e.g. KA, MH, OD). '0' here is likely 'O' (e.g., OD for Odisha)
        if (i < 2) {
          if (char === '0') {
            ambiguities.push({
              index: i,
              character: '0',
              alternatives: ['O', '0'],
              reason: 'State prefix requires letters. "0" was spoken where "O" may be intended.',
              recommendedValue: 'O',
            });
          }
        }
        // In index 2 or 3: RTO code (numbers). 'O' here is likely '0' (e.g., KA 01)
        else if (i >= 2 && i <= 3) {
          if (char === 'O') {
            ambiguities.push({
              index: i,
              character: 'O',
              alternatives: ['0', 'O'],
              reason: 'RTO code requires digits. "O" (Letter) was detected where "0" (Zero) is typical.',
              recommendedValue: '0',
            });
          }
        }
        // In last 4 characters: Serial number (digits). 'O' here is likely '0'
        else if (i >= candidate.length - 4) {
          if (char === 'O') {
            ambiguities.push({
              index: i,
              character: 'O',
              alternatives: ['0', 'O'],
              reason: 'Vehicle plate final 4-digits require numbers. "O" was detected where "0" is typical.',
              recommendedValue: '0',
            });
          }
        }
        // In the series letters (between RTO code and final digits): '0' here is likely 'O'
        else {
          ambiguities.push({
            index: i,
            character: char,
            alternatives: ['O', '0'],
            reason: 'Ambiguous "O" (Letter) vs "0" (Number Zero). Explicit confirmation required.',
            recommendedValue: char === 'O' ? 'O' : '0',
          });
        }
      }

      // Ambiguity: 'B' vs '8'
      if (char === 'B' || char === '8') {
        // If in digit section
        if ((i >= 2 && i <= 3) || i >= candidate.length - 4) {
          if (char === 'B') {
            ambiguities.push({
              index: i,
              character: 'B',
              alternatives: ['8', 'B'],
              reason: 'Digit section detected "B" where "8" (Eight) may have been spoken.',
              recommendedValue: '8',
            });
          }
        }
      }
    }

    // Vehicle regex validation
    const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
    const isVehicle = vehicleRegex.test(candidate);

    // DL regex validation
    const dlRegex = /^[A-Z]{2}[0-9]{11,15}$/;
    const isDl = dlRegex.test(candidate);

    let type: VoiceParseResult['type'] = 'UNKNOWN';
    let isValidFormat = false;

    if (isVehicle) {
      type = 'VEHICLE_REGISTRATION';
      isValidFormat = true;
    } else if (isDl) {
      type = 'DRIVING_LICENCE';
      isValidFormat = true;
    } else if (candidate.length >= 8 && candidate.length <= 16) {
      // Near match candidate
      type = 'VEHICLE_REGISTRATION';
      isValidFormat = false;
    }

    // Format display: e.g. KA-01-AB-1234
    let formattedDisplay = candidate;
    if (isVehicle && candidate.length >= 8) {
      const state = candidate.slice(0, 2);
      const rto = candidate.slice(2, 4);
      const series = candidate.slice(4, candidate.length - 4);
      const num = candidate.slice(candidate.length - 4);
      formattedDisplay = `${state}-${rto}-${series}-${num}`;
    }

    const requiresConfirmation = ambiguities.length > 0;
    const confidenceScore = ambiguities.length === 0 && isValidFormat ? 0.98 : 0.72;

    return {
      rawTranscript,
      cleanedText,
      normalizedIdentifier: candidate,
      formattedDisplay,
      type,
      isValidFormat,
      ambiguities,
      requiresConfirmation,
      confidenceScore,
    };
  }

  /**
   * Apply user's selected resolution for an ambiguous character
   */
  public static applyAmbiguityResolution(
    candidate: string,
    index: number,
    chosenChar: string
  ): string {
    if (index < 0 || index >= candidate.length) return candidate;
    const chars = candidate.split('');
    chars[index] = chosenChar;
    return chars.join('');
  }
}
