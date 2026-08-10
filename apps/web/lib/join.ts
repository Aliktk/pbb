// Data for the "Get involved" hub and the one-form-five-kinds join flow.
// Ported from the prototype (pbb-pages.js JOINTYPES + FORMFIELDS).

export type JoinKind = 'requester' | 'donor' | 'volunteer' | 'partner' | 'organisation';

export interface JoinType {
  key: JoinKind;
  kicker: string;
  title: string;
  description: string;
}

export const JOIN_TYPES: JoinType[] = [
  { key: 'requester', kicker: 'Need blood', title: 'Request blood for a patient', description: 'Tell us the group, the hospital and your number. A coordinator calls you back. In an emergency, phone 081-2836820 first.' },
  { key: 'donor', kicker: 'Give blood', title: 'Register as a donor', description: 'Join the register for your town. When someone nearby needs your group, we call. You are free to say no, every time.' },
  { key: 'volunteer', kicker: 'Give time', title: 'Volunteer with us', description: 'Camps, outreach, driving, office work. Volunteers collect the Eid hides that fund a large share of the year.' },
  { key: 'partner', kicker: 'Work with us', title: 'Partner organisation', description: 'Hospitals, laboratories and clinics that refer patients or share screening capacity.' },
  { key: 'organisation', kicker: 'Bring us to your town', title: 'Register an organisation', description: 'Welfare societies and community groups who want a PBB branch, or to run a camp under our name.' },
];

export type FieldType = 'text' | 'number' | 'date' | 'time' | 'tel' | 'email' | 'select' | 'textarea';

export type FormRow =
  | { kind: 'section'; title: string }
  | { kind: 'field'; label: string; name: string; type: FieldType; required: boolean; options?: string[] };

const s = (title: string): FormRow => ({ kind: 'section', title });
const f = (label: string, name: string, type: FieldType, required = false, options?: string[]): FormRow =>
  ({ kind: 'field', label, name, type, required, options });

export const FORM_FIELDS: Record<JoinKind, FormRow[]> = {
  requester: [
    s('Who the blood is for'),
    f('Patient name', 'patient', 'text', true),
    f('Gender', 'gender', 'select', true, ['Male', 'Female']),
    f('Age', 'age', 'number', true),
    f('Case or disease', 'disease', 'text', true),
    f('Do you have the medical report?', 'report', 'select', true, ['Yes, I have it', 'No, not yet']),
    s('What is needed'),
    f('Type of blood', 'btype', 'select', true, ['Whole blood', 'RCC — red cell concentrate', 'Platelets', 'FFP — fresh frozen plasma', 'Not sure, the doctor will say']),
    f('Number of bags', 'units', 'number', true),
    f('Date needed', 'date', 'date', true),
    f('Time', 'time', 'time', false),
    f('How urgent', 'urgency', 'select', true, ['Critical — today', 'Urgent — within 2 days', 'Planned — a date is set']),
    s('Where'),
    f('Hospital', 'hospital', 'text', true),
    s('The attendant'),
    f('Attendant name', 'att', 'text', true),
    f('Attendant phone', 'phone', 'tel', true),
    f('Attendant blood group', 'attgroup', 'select', false, ['Do not know yet', 'O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−']),
    f('Can the attendant donate?', 'attdonate', 'select', true, ['Yes, available to donate', 'No', 'Somebody else in the family can']),
    f('Can you arrange an exchange donor?', 'exchange', 'select', true, ['Yes', 'No', 'Not sure']),
    f('Can the donor be brought to the branch?', 'transport', 'select', true, ['Yes, we have transport', 'No, we need help with transport']),
    f('Full address', 'address', 'textarea', false),
  ],
  donor: [
    f('Full name', 'name', 'text', true),
    f('Date of birth', 'dob', 'date', true),
    f('Weight (kg)', 'weight', 'number', true),
    f('Phone', 'phone', 'tel', true),
    f('Area or mohalla', 'address', 'text', false),
    f('When did you last give?', 'last', 'date', false),
  ],
  volunteer: [
    f('Full name', 'name', 'text', true),
    f('Phone', 'phone', 'tel', true),
    f('Email', 'email', 'email', false),
    f('Hours you can give a week', 'hours', 'select', false, ['A few hours', 'Half a day', 'One day', 'More']),
    f('Anything you are good at', 'skills', 'text', false),
  ],
  partner: [
    f('Organisation name', 'org', 'text', true),
    f('Kind', 'kind', 'select', true, ['Hospital', 'Laboratory', 'Clinic', 'Welfare society', 'Other']),
    f('Contact person', 'name', 'text', true),
    f('Phone', 'phone', 'tel', true),
    f('Email', 'email', 'email', false),
    f('What are you hoping to do together?', 'notes', 'textarea', false),
  ],
  organisation: [
    f('Organisation name', 'org', 'text', true),
    f('Registration number', 'reg', 'text', false),
    f('Contact person', 'name', 'text', true),
    f('Role in the organisation', 'role', 'text', false),
    f('Phone', 'phone', 'tel', true),
    f('Email', 'email', 'email', false),
    f('Why does your town need a branch?', 'notes', 'textarea', true),
  ],
};

// Which kinds ask for a blood group up top, and the label to use.
export const NEED_GROUP: Partial<Record<JoinKind, string>> = {
  requester: 'Blood group needed',
  donor: 'Your blood group',
};

// Success-panel copy per kind (from the prototype's submitJoin done() calls).
export const SUCCESS: Record<JoinKind, { title: string; body: string; adminHref: string; adminLabel: string }> = {
  requester: { title: 'Request received', body: 'A coordinator will call you shortly. Keep your phone nearby.', adminHref: '/admin/requests', adminLabel: 'See it in the admin →' },
  donor: { title: 'You are on the register', body: 'Your branch will confirm your details by phone. When someone near you needs your group, we call.', adminHref: '/admin/donors', adminLabel: 'See it in the admin →' },
  volunteer: { title: 'Thank you for offering', body: 'A volunteer lead from your town will call you. Camps are usually arranged a fortnight ahead.', adminHref: '/admin/inbox', adminLabel: 'See it in the admin →' },
  partner: { title: 'Thank you', body: 'The head office will be in touch to arrange a meeting.', adminHref: '/admin/inbox', adminLabel: 'See it in the admin →' },
  organisation: { title: 'Thank you', body: 'The organising committee reviews every request for a new branch. Somebody will call you to talk it through.', adminHref: '/admin/inbox', adminLabel: 'See it in the admin →' },
};
