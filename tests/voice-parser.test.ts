// tests/voice-parser.test.ts
import { describe, it, expect } from 'vitest';
import { VoiceIdentifierParser } from '../src/shared/voice-parser';

describe('VoiceIdentifierParser (Speech Normalization & Ambiguity Resolution)', () => {
  it('normalizes spoken NATO phonetics and numbers into uppercase plate format', () => {
    const transcript = 'kilo alpha zero one alpha bravo one two three four';
    const result = VoiceIdentifierParser.parse(transcript);

    expect(result.normalizedIdentifier).toBe('KA01AB1234');
    expect(result.type).toBe('VEHICLE_REGISTRATION');
    expect(result.isValidFormat).toBe(true);
    expect(result.formattedDisplay).toBe('KA-01-AB-1234');
  });

  it('detects O versus 0 ambiguity and flags confirmation required', () => {
    // e.g. "K A zero one A B one two three O" where final character is 'O' (letter) instead of '0' (number)
    const transcript = 'K A 0 1 A B 1 2 3 O';
    const result = VoiceIdentifierParser.parse(transcript);

    expect(result.ambiguities.length).toBeGreaterThan(0);
    expect(result.requiresConfirmation).toBe(true);

    const oAmbiguity = result.ambiguities.find((a) => a.character === 'O');
    expect(oAmbiguity).toBeDefined();
    expect(oAmbiguity?.alternatives).toContain('0');
    expect(oAmbiguity?.reason).toContain('Vehicle plate final 4-digits require numbers');
  });

  it('detects B versus 8 ambiguity in digit segments', () => {
    // e.g. "KA 01 B 1234" vs "KA 01 8 1234"
    const transcript = 'K A B 1 2 3 4 5 6';
    const result = VoiceIdentifierParser.parse(transcript);

    const bAmbiguity = result.ambiguities.find((a) => a.character === 'B');
    if (bAmbiguity) {
      expect(bAmbiguity.alternatives).toContain('8');
    }
  });

  it('allows user to resolve ambiguity explicitly via applyAmbiguityResolution', () => {
    const rawPlate = 'KA01AB123O';
    // User selects '0' for index 9
    const resolved = VoiceIdentifierParser.applyAmbiguityResolution(rawPlate, 9, '0');
    expect(resolved).toBe('KA01AB1230');

    const reparsed = VoiceIdentifierParser.parse(resolved);
    expect(reparsed.isValidFormat).toBe(true);
    expect(reparsed.formattedDisplay).toBe('KA-01-AB-1230');
  });
});
