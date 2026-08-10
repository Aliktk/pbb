// Central catalogue of stand-in photographs (Unsplash, free to use under the Unsplash
// licence). These fill the image slots during the design phase so no page shows an empty grey
// box; every one is a single named entry here so swapping in real, consented PBB media from
// the backend (media library / Supabase Storage, T7) is a one-line change per slot.
//
// Consent note: the thalassemia and people slots use neutral clinical/portrait stand-ins on
// purpose. Real portraits there must be consented (constraint #5) before they replace these.

const U = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const IMG = {
  heroDonation: U('1615461066841-6116e61058f4', 1200), // donor at the bench
  ambulance: U('1587351021759-3e566b6af7cc', 1200),
  bloodBags: U('1516574187841-cb9cc2ca948b', 1200),
  screeningLab: U('1579154204601-01588f351e67', 1200),
  medicalTeam: U('1576091160399-112ba8d25d1d', 1200),
  community: U('1522071820081-009f0129c71c', 1200),
  building: U('1497366216548-37526070297c', 1200),
  partnership: U('1600880292203-757bb62b4baf', 1200),
  landscape: U('1469474968028-56623f02e42e', 1200), // Balochistan-like terrain, stands in for the map
  clinician: U('1550831107-1553da8c8464', 900),
  gloves: U('1584515933487-779824d29309', 900),
  portraitA: U('1509099836639-18ba1795216d', 800),
  portraitB: U('1573497019940-1c28c88b4f3e', 800),
  portraitC: U('1488521787991-ed7bbaae773c', 800),
} as const;

// A small rotation used for galleries / news grids so repeated slots vary.
export const IMG_ROTATION = [
  IMG.heroDonation,
  IMG.bloodBags,
  IMG.ambulance,
  IMG.screeningLab,
  IMG.medicalTeam,
  IMG.community,
  IMG.building,
  IMG.partnership,
] as const;
