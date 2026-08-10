// The web uses display labels ("O-", "AB+"); the API uses bloodGroup + rhFactor enums. These
// two helpers convert between them so a form can send what the API expects and vice versa.

export interface GroupParts {
  bloodGroup: 'A' | 'B' | 'AB' | 'O';
  rhFactor: 'POSITIVE' | 'NEGATIVE';
}

/** "O-" -> { bloodGroup: 'O', rhFactor: 'NEGATIVE' }. The minus is U+2212 (matches the UI). */
export function splitGroup(label: string): GroupParts {
  const rhFactor = /[-−]$/.test(label) ? 'NEGATIVE' : 'POSITIVE';
  const bloodGroup = label.replace(/[+\-−]/g, '') as GroupParts['bloodGroup'];
  return { bloodGroup, rhFactor };
}

/** { bloodGroup:'O', rhFactor:'NEGATIVE' } -> "O-" (U+2212), matching lib/nav BLOOD_GROUPS. */
export function joinGroup(bloodGroup: string, rhFactor: string): string {
  return `${bloodGroup}${rhFactor === 'NEGATIVE' ? '−' : '+'}`;
}
