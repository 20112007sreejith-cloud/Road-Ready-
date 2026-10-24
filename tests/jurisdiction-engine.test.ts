// tests/jurisdiction-engine.test.ts
import { describe, it, expect } from 'vitest';
import {
  JurisdictionRuleEngine,
  NATIONAL_JURISDICTIONS,
} from '../src/shared/jurisdiction-engine';

describe('JurisdictionRuleEngine (State Rules & Missing Odisha Fallback)', () => {
  it('retrieves configured verified rule packs for Karnataka and Maharashtra', () => {
    const ka = JurisdictionRuleEngine.getRulePack('KA');
    expect(ka.jurisdictionName).toBe('Karnataka');
    expect(ka.version).toBe('2.4.0');
    expect(ka.status).toBe('VERIFIED');
    expect(ka.services.length).toBeGreaterThan(0);

    const mh = JurisdictionRuleEngine.getRulePack('MH');
    expect(mh.jurisdictionName).toBe('Maharashtra');
    expect(mh.status).toBe('VERIFIED');
  });

  it('fails safely for missing Odisha rule pack without inventing fees or substituting another state', () => {
    expect(() => JurisdictionRuleEngine.getRulePack('OD')).toThrowError(
      /Rules unavailable for jurisdiction "OD". Official estimates are unavailable because a validated rule pack has not been configured. We will not guess fees, required documents, or processing times./
    );
  });

  it('provides official transport portal URL for unconfigured jurisdiction', () => {
    const odishaPortal = JurisdictionRuleEngine.getOfficialPortal('OD');
    expect(odishaPortal).toBe('https://odishatransport.gov.in/');
  });

  it('has comprehensive national coverage directory of all 28 states & 8 UTs (36 total)', () => {
    const list = JurisdictionRuleEngine.getNationalCoverage();
    expect(list.length).toBe(36);

    const states = list.filter((j) => j.type === 'STATE');
    const uts = list.filter((j) => j.type === 'UT');
    expect(states.length).toBe(28);
    expect(uts.length).toBe(8);
  });

  it('correctly labels provenance and verification status', () => {
    const verified = JurisdictionRuleEngine.getProvenanceLabel('VERIFIED_OFFICIAL');
    expect(verified.isVerified).toBe(true);

    const synthetic = JurisdictionRuleEngine.getProvenanceLabel('SYNTHETIC_DEMO');
    expect(synthetic.isVerified).toBe(false);

    const unavail = JurisdictionRuleEngine.getProvenanceLabel('UNAVAILABLE');
    expect(unavail.isVerified).toBe(false);
  });
});
