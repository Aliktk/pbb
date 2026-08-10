// Primary navigation, ported from the prototype's NAV + DICON tables. Hrefs are rewritten
// from the prototype's hash routes (#/x) to Next paths (/x). This is the single nav source.

export interface NavItem {
  label: string;
  href: string;
  description: string;
  icon: string; // SVG path for the dropdown item glyph
}

export interface NavGroup {
  label: string;
  href?: string; // top-level direct link (Home, Contact)
  items?: NavItem[]; // dropdown children
}

export const NAV: NavGroup[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    items: [
      { label: 'The problem we are solving', href: '/problem', description: 'Twelve gaps, and our answer', icon: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z' },
      { label: 'Our story', href: '/about', description: 'Since 24 March 1999', icon: 'M12 8v8m-4-4h8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z' },
      { label: 'Our leadership', href: '/people', description: 'Committee and medical staff', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
      { label: 'Who stands with us', href: '/supporters', description: 'Supporting organisations', icon: 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z' },
      { label: 'Our branches', href: '/branches', description: '6 offices, 14 towns', icon: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-9h.01' },
    ],
  },
  {
    label: 'Services',
    items: [
      { label: 'What we provide', href: '/services', description: 'Screened blood, on exchange', icon: 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z' },
      { label: 'Thalassemia children', href: '/thalassemia', description: 'Free, without exchange', icon: 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z' },
    ],
  },
  {
    label: 'Get involved',
    items: [
      { label: 'Everything in one place', href: '/join', description: 'Five ways to take part', icon: 'M4 5h16M4 12h16M4 19h10' },
      { label: 'Who needs blood now', href: '/needs', description: 'Every open request, no names', icon: 'M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 3v12m0 0 4-4m-4 4-4-4' },
      { label: 'Request blood', href: '/join/requester', description: 'For a patient in hospital', icon: 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z' },
      { label: 'Register as a donor', href: '/join/donor', description: 'Takes three minutes', icon: 'M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 3v12m0 0 4-4m-4 4-4-4' },
      { label: 'Volunteer with us', href: '/join/volunteer', description: 'Camps and outreach', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
      { label: 'Partner organisation', href: '/join/partner', description: 'Hospitals and laboratories', icon: 'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z' },
      { label: 'Register an organisation', href: '/join/organisation', description: 'Bring a branch to your town', icon: 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6' },
      { label: 'Work with us', href: '/partners', description: 'Hospitals, labs, foundations', icon: 'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z' },
      { label: 'Donate', href: '/donate', description: 'Bank transfer, Zakat, Eid hides', icon: 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z' },
    ],
  },
  {
    label: 'Media',
    items: [
      { label: 'Photos & videos', href: '/gallery', description: 'Camps, ambulances, the new building', icon: 'M3 5h18v14H3zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm13 8-6-7-5 6-3-3-3 4' },
      { label: 'Announcements & events', href: '/news', description: 'What is happening now', icon: 'M4 4h12v16H4zM16 8h4v10a2 2 0 0 1-4 0V8ZM7 8h6M7 12h6M7 16h4' },
      { label: 'Publications', href: '/publications', description: 'Posters, appeals and reports', icon: 'M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-4v14h2a2 2 0 0 1 2 2z' },
      { label: 'Questions', href: '/faq', description: 'Things people ask us', icon: 'M9.1 9a3 3 0 1 1 4.5 2.6c-.9.5-1.6 1.3-1.6 2.4m0 4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

// Towns PBB serves — the ONE list every form/filter/dropdown reads (mirrors PBBTOWNS).
export const TOWNS = [
  'Quetta', 'Pishin', 'Zhob', 'Loralai', 'Chaman', 'Muslim Bagh', 'Killa Saifullah',
  'Dukki', 'Musakhel', 'Sherani', 'Harnai', 'Ziarat', 'Qila Abdullah', 'Sibi',
] as const;

export const BLOOD_GROUPS = ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'] as const;
