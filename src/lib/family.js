/**
 * Family mode — one routine, several pairs of lungs.
 *
 * Children breathe more air per kilogram of body weight, so their row is
 * priced at `CHILD_WEIGHT` times the adult figure. The maths lives here as
 * pure functions so the component stays presentational and the behaviour is
 * testable without a DOM.
 */

/** Children in this age range are priced at the child dose. */
export const CHILD_AGE_MIN = 4;
export const CHILD_AGE_MAX = 12;

/** Dose multiplier for a child relative to an adult, same routine. */
export const CHILD_WEIGHT = 1.8;

/** @typedef {{ id: string, name: string, age: number }} FamilyMember */

/** @type {FamilyMember[]} */
export const DEFAULT_FAMILY = [
  { id: 'a1', name: 'You', age: 34 },
  { id: 'a2', name: 'Partner', age: 32 },
  { id: 'k1', name: 'Kid 1', age: 8 },
  { id: 'k2', name: 'Kid 2', age: 5 },
];

let memberSeq = 0;

/**
 * Dose multiplier for one age.
 * @param {number} age
 * @returns {number} 1.8 for ages 4–12, otherwise 1.
 */
export function weightForAge(age) {
  return age >= CHILD_AGE_MIN && age <= CHILD_AGE_MAX ? CHILD_WEIGHT : 1;
}

/**
 * @param {FamilyMember[]} members
 * @param {Partial<FamilyMember>} [overrides]
 * @returns {FamilyMember[]} a new list with a default adult appended.
 */
export function addFamilyMember(members, overrides = {}) {
  memberSeq += 1;
  return [...members, { id: `m${Date.now()}-${memberSeq}`, name: 'New member', age: 30, ...overrides }];
}

/**
 * @param {FamilyMember[]} members
 * @param {string} id
 * @param {Partial<FamilyMember>} patch
 * @returns {FamilyMember[]} a new list with one member patched.
 */
export function updateFamilyMember(members, id, patch) {
  return members.map((member) => (member.id === id ? { ...member, ...patch } : member));
}

/**
 * @param {FamilyMember[]} members
 * @param {string} id
 * @returns {FamilyMember[]} a new list without that member.
 */
export function removeFamilyMember(members, id) {
  return members.filter((member) => member.id !== id);
}

/**
 * Price one member's copy of the day from the shared ledger.
 * @param {{ budget: number, savings: number }} ledger
 * @param {FamilyMember} member
 * @returns {{ weight: number, budget: number, saved: number }}
 */
export function familyMemberBudget(ledger, member) {
  const weight = weightForAge(member.age);
  return {
    weight,
    budget: ledger.budget * weight,
    saved: ledger.savings * weight,
  };
}
