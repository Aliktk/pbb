export interface HomepageSection {
  id: string;
  key: string;
  name: string;
  live: boolean;
  desc: string;
  category: 'hero' | 'inventory' | 'services' | 'impact' | 'network' | 'updates' | 'challenge' | 'cta';
  config: Record<string, any>;
}

export const EXACT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    key: 'hero',
    name: 'Hero Section',
    live: true,
    desc: 'Main hero headline, subtext, 4 impact metrics & dispatch badge',
    category: 'hero',
    config: {
      eyebrowBadge: 'Serving Balochistan since 24 March 1999',
      headlinePart1: 'Blood is life.',
      headlineHighlight: 'record',
      subheadline:
        'Screened, tested blood for anyone who needs it — free and without exchange for thalassemia children, mothers, emergencies, and disasters across 14 towns.',
      primaryBtnText: 'Request Blood',
      primaryBtnLink: '/join/requester',
      secondaryBtnText: 'Register as Donor',
      secondaryBtnLink: '/join/donor',
      metric1Val: '64,000+',
      metric1Lbl: 'Bags donated',
      metric2Val: '200',
      metric2Lbl: 'Thalassemia kids',
      metric3Val: '14',
      metric3Lbl: 'Towns served',
      metric4Val: '3',
      metric4Lbl: '24/7 Ambulances',
      branchTagTitle: 'Quetta Central Branch',
      branchTagSubtitle: 'Active emergency dispatch',
      heroImage: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=70',
    },
  },
  {
    id: 'sec-shortage',
    key: 'shortage_strip',
    name: 'Live Stock Status Bar',
    live: true,
    desc: 'Real-time inventory grid for 8 blood groups (Critical, Low, Available)',
    category: 'inventory',
    config: {
      label: 'Live Inventory',
      title: 'Current Blood Stock Status',
      updatedText: 'Updated 2 hrs ago · Quetta Main',
      footerNote:
        'If your group shows Critical or Low, your donation today directly saves an emergency patient.',
      linkText: 'Register Now →',
      linkUrl: '/join/donor',
    },
  },
  {
    id: 'sec-what-we-do',
    key: 'what_we_do',
    name: 'What We Do (4 Pillars)',
    live: true,
    desc: 'Four operational pillars: Screened blood, Thalassemia care, Ambulance service, Disaster response',
    category: 'services',
    config: {
      label: 'What we do',
      heading: 'Four things, done since 1999',
      lead:
        'Blood is never purchased. The only source is exchange from relatives of the patient and registered members.',
      p1Title: 'Screened blood',
      p1Desc:
        'Tested by ELISA for Hepatitis B, Hepatitis C, HIV/AIDS and MP before it reaches a patient.',
      p2Title: 'Thalassemia care',
      p2Desc:
        '200 registered children transfused regularly, free of cost and without exchange.',
      p3Title: 'Ambulance service',
      p3Desc:
        'Three vehicles in Quetta, running twenty-four hours a day for anyone who needs them.',
      p4Title: 'Disaster response',
      p4Desc:
        'Abbottabad 2005, Ziarat 2008, and every bomb blast and emergency since.',
    },
  },
  {
    id: 'sec-yearly-chart',
    key: 'yearly_chart',
    name: 'Impact Record Chart',
    live: true,
    desc: '27-year transfusion history chart (1999 to 2012 bags data)',
    category: 'impact',
    config: {
      label: 'Impact Record',
      heading: 'Twenty-Seven Years of Transfusions',
      lead:
        'Every bag transfused since our founding in 1999. Published records through 2012 (digitization ongoing).',
      peakText: '2011 (Peak Year: 9,484 bags)',
    },
  },
  {
    id: 'sec-where-we-are',
    key: 'where_we_are',
    name: 'Coverage & Network Map',
    live: true,
    desc: '6 office branches, 14 towns served, emergency dispatch features',
    category: 'network',
    config: {
      label: 'Coverage & Network',
      heading: '6 Office Branches. 14 Towns Served.',
      lead:
        'From our head office beside the Quetta Press Club reaching out to Zhob, Chaman, and Loralai — bridging gaps for towns with no dedicated blood bank.',
      feat1: '24/7 Central Emergency Dispatch',
      feat2: 'Direct Cold-Chain Supply Protocol',
      btnText: 'View All Branch Locations →',
      btnLink: '/branches',
    },
  },
  {
    id: 'sec-announcements',
    key: 'announcements',
    name: 'Latest News & Events',
    live: true,
    desc: '3 community cards: Free donation camp, New building, Eid hide collection',
    category: 'updates',
    config: {
      label: 'Latest Updates',
      heading: 'Announcements & Community Events',
      item1Tag: 'Blood camp',
      item1Date: '12 September',
      item1Title: 'Free donation camp, Pishin',
      item1Desc:
        'Band Road branch, 9am to 4pm. Walk in or register to attend.',
      item2Tag: 'Notice',
      item2Date: '3 September',
      item2Title: 'New building - final stage',
      item2Desc:
        'Construction of the new Quetta premises has entered its last phase.',
      item3Tag: 'Appeal',
      item3Date: 'Runs to 20 June',
      item3Title: 'Eid ul Adha hide collection',
      item3Desc: 'Volunteers collect cattle hides across all branches.',
    },
  },
  {
    id: 'sec-problem',
    key: 'systemic_challenge',
    name: 'Systemic Challenge Block',
    live: true,
    desc: 'Highlights 12 operational gaps, 0 national registries, paper diary history',
    category: 'challenge',
    config: {
      label: 'Systemic Challenge',
      heading: 'Blood Exists. It Just Doesn\'t Reach People in Time.',
      lead:
        'No national database, scarce voluntary donors, bags expiring in one town while a patient waits in the next. Learn about the twelve operational gaps we are solving.',
      btnText: 'Explore the 12 Operational Gaps →',
      btnLink: '/problem',
      stat1Val: '0',
      stat1Lbl: 'National blood registries before this platform',
      stat2Val: '200+',
      stat2Lbl: 'Thalassemia children relying exclusively on our network',
      stat3Val: '1999',
      stat3Lbl: 'The year our paper diary donor system began',
    },
  },
  {
    id: 'sec-closing-band',
    key: 'closing_band',
    name: 'Donate Banner CTA',
    live: true,
    desc: 'Bottom action banner: Donate Blood. Save a Life Today.',
    category: 'cta',
    config: {
      title: 'Donate Blood. Save a Life Today.',
      desc:
        'It takes just 15 minutes. For over 200 children in Balochistan, it is the difference between a healthy month and a critical hospital stay.',
      btnText: 'Get Involved Now →',
      btnLink: '/join',
    },
  },
];
