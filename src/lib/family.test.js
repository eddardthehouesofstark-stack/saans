import { describe, expect, it } from 'vitest';
import {
  addFamilyMember,
  CHILD_WEIGHT,
  DEFAULT_FAMILY,
  familyMemberBudget,
  removeFamilyMember,
  updateFamilyMember,
  weightForAge,
} from './family';

describe('weightForAge', () => {
  it('prices children aged 4–12 at the child dose', () => {
    expect(weightForAge(4)).toBe(CHILD_WEIGHT);
    expect(weightForAge(8)).toBe(1.8);
    expect(weightForAge(12)).toBe(CHILD_WEIGHT);
  });

  it('prices adults and older children at 1.0', () => {
    expect(weightForAge(3)).toBe(1);
    expect(weightForAge(13)).toBe(1);
    expect(weightForAge(34)).toBe(1);
  });

  it('treats a missing age as an adult', () => {
    expect(weightForAge(Number.NaN)).toBe(1);
  });
});

describe('DEFAULT_FAMILY', () => {
  it('seeds two adults and two children', () => {
    expect(DEFAULT_FAMILY).toHaveLength(4);
    expect(DEFAULT_FAMILY.filter((member) => weightForAge(member.age) > 1)).toHaveLength(2);
  });
});

describe('family list helpers', () => {
  it('appends a member without mutating the input', () => {
    const next = addFamilyMember(DEFAULT_FAMILY);
    expect(next).toHaveLength(5);
    expect(DEFAULT_FAMILY).toHaveLength(4);
    expect(next.at(-1).name).toBe('New member');
  });

  it('gives each added member a unique id', () => {
    const first = addFamilyMember([]);
    const second = addFamilyMember(first);
    expect(first[0].id).not.toBe(second[1].id);
  });

  it('patches only the target member', () => {
    const next = updateFamilyMember(DEFAULT_FAMILY, 'k1', { age: 20, name: 'Grown' });
    expect(next.find((member) => member.id === 'k1')).toMatchObject({ age: 20, name: 'Grown' });
    expect(next.find((member) => member.id === 'a1')).toEqual(DEFAULT_FAMILY[0]);
  });

  it('removes one member', () => {
    const next = removeFamilyMember(DEFAULT_FAMILY, 'k2');
    expect(next.map((member) => member.id)).toEqual(['a1', 'a2', 'k1']);
  });
});

describe('familyMemberBudget', () => {
  const ledger = { budget: 12.95, savings: 2.4 };

  it('scales budget and savings by the member dose', () => {
    expect(familyMemberBudget(ledger, { id: 'k', name: 'Kid', age: 8 })).toEqual({
      weight: 1.8,
      budget: 12.95 * 1.8,
      saved: 2.4 * 1.8,
    });
  });

  it('leaves adults untouched', () => {
    expect(familyMemberBudget(ledger, { id: 'a', name: 'Adult', age: 34 })).toEqual({
      weight: 1,
      budget: 12.95,
      saved: 2.4,
    });
  });
});
