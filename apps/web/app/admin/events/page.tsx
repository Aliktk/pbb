'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { IMG } from '../../../lib/images';

export interface Attendee {
  name: string;
  bloodGroup: string;
  town: string;
  phone: string;
}

export interface EventItem {
  id: string;
  name: string;
  kind: 'Blood Camp' | 'Awareness' | 'Campaign' | 'Workshop' | 'Fundraiser';
  date: string;
  time: string;
  location: string;
  town: string;
  attendeesCount: number;
  maxCapacity: number;
  image: string;
  status: 'live' | 'draft' | 'completed';
  description: string;
  registeredList: Attendee[];
}

const IMAGE_PRESETS = [
  { label: 'Community Blood Drive', url: IMG.community },
  { label: 'Quetta Central Facility', url: IMG.building },
  { label: 'Screening Laboratory', url: IMG.screeningLab },
  { label: 'Emergency Ambulance Unit', url: IMG.ambulance },
  { label: 'Medical Team Dispatch', url: IMG.medicalTeam },
  { label: 'Healthcare Network', url: IMG.partnership },
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    name: 'Free Blood Donation Camp & Screening',
    kind: 'Blood Camp',
    date: '12 September 2026',
    time: '9:00 AM - 4:00 PM',
    location: 'Band Road Branch Desk',
    town: 'Pishin',
    attendeesCount: 48,
    maxCapacity: 100,
    image: IMG.community,
    status: 'live',
    description: 'Annual voluntary blood donation and ELISA virus screening camp organized for Pishin district.',
    registeredList: [
      { name: 'Hameed Ullah', bloodGroup: 'O+', town: 'Pishin', phone: '+92 333 7812345' },
      { name: 'Sana Gul', bloodGroup: 'B−', town: 'Pishin', phone: '+92 300 9821341' },
      { name: 'Abdul Manan', bloodGroup: 'A+', town: 'Huramzai', phone: '+92 312 4567890' },
      { name: 'Dr. Tariq Kakar', bloodGroup: 'AB+', town: 'Pishin', phone: '+92 334 1122334' },
      { name: 'Bibisara Tareen', bloodGroup: 'O−', town: 'Pishin', phone: '+92 301 5566778' },
    ],
  },
  {
    id: 'evt-2',
    name: 'University Campus Blood Awareness Drive',
    kind: 'Awareness',
    date: '28 September 2026',
    time: '10:00 AM - 3:00 PM',
    location: 'Main Auditorium, Quetta University',
    town: 'Quetta',
    attendeesCount: 92,
    maxCapacity: 200,
    image: IMG.portraitA,
    status: 'draft',
    description: 'Youth voluntary blood donation seminars and first-time donor registration drive.',
    registeredList: [
      { name: 'Zeeshan Khan', bloodGroup: 'A−', town: 'Quetta', phone: '+92 332 8899001' },
      { name: 'Fatima Zohra', bloodGroup: 'O+', town: 'Quetta', phone: '+92 313 7766554' },
    ],
  },
  {
    id: 'evt-3',
    name: 'Eid-ul-Adha Cattle Hide Collection Campaign',
    kind: 'Campaign',
    date: 'Seasonal Drive',
    time: '24 Hours Open',
    location: 'All 6 Office Branches & Mobile Fleet',
    town: 'Pashtoonkhwa Regional',
    attendeesCount: 156,
    maxCapacity: 300,
    image: IMG.partnership,
    status: 'live',
    description: 'Voluntary cattle hide collection campaign to fund regular thalassemia blood transfusion bags.',
    registeredList: [
      { name: 'Bilal Ahmad', bloodGroup: 'B+', town: 'Loralai', phone: '+92 302 9988776' },
      { name: 'Malik Rahim', bloodGroup: 'O+', town: 'Zhob', phone: '+92 335 4433221' },
    ],
  },
  {
    id: 'evt-4',
    name: 'Loralai District Emergency Response Workshop',
    kind: 'Workshop',
    date: '5 October 2026',
    time: '11:00 AM - 2:00 PM',
    location: 'Civil Hospital Seminar Hall',
    town: 'Loralai',
    attendeesCount: 34,
    maxCapacity: 60,
    image: IMG.screeningLab,
    status: 'live',
    description: 'Training local clinicians and emergency volunteers on cold-chain blood transport protocols.',
    registeredList: [
      { name: 'Noman Shah', bloodGroup: 'AB−', town: 'Loralai', phone: '+92 311 2233445' },
    ],
  },
];

import { getTownNamesList } from '../../../lib/towns';

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft' | 'completed'>('all');
  const [townList, setTownList] = useState<string[]>(['All Towns', ...getTownNamesList()]);
  const [selectedTown, setSelectedTown] = useState('All Towns');
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-1');

  useEffect(() => {
    setTownList(['All Towns', ...getTownNamesList()]);
    function handleUpdate() {
      setTownList(['All Towns', ...getTownNamesList()]);
    }
    window.addEventListener('pbb_towns_updated', handleUpdate);
    return () => window.removeEventListener('pbb_towns_updated', handleUpdate);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);

  // New Attendee Form State
  const [newAttName, setNewAttName] = useState('');
  const [newAttGroup, setNewAttGroup] = useState('O+');
  const [newAttTown, setNewAttTown] = useState('Pishin');
  const [newAttPhone, setNewAttPhone] = useState('');

  // Event Form State
  const [formName, setFormName] = useState('');
  const [formKind, setFormKind] = useState<'Blood Camp' | 'Awareness' | 'Campaign' | 'Workshop' | 'Fundraiser'>('Blood Camp');
  const [formTown, setFormTown] = useState('Pishin');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCapacity, setFormCapacity] = useState('100');
  const [formImage, setFormImage] = useState(IMG.community);
  const [formStatus, setFormStatus] = useState<'live' | 'draft' | 'completed'>('live');
  const [formDesc, setFormDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage or API on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_admin_events');
      if (saved) {
        setEvents(JSON.parse(saved));
      }
    } catch {}

    api
      .get<EventItem[]>('/cms/events')
      .then((res) => {
        if (res && Array.isArray(res) && res.length > 0) {
          setEvents(res);
        }
      })
      .catch(() => {});
  }, []);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  function toggleStatus(id: string) {
    setEvents((prev) => {
      const next = prev.map((evt) => {
        if (evt.id === id) {
          const nextStatus = evt.status === 'live' ? ('draft' as const) : ('live' as const);
          showToast(`Event "${evt.name}" status changed to ${nextStatus.toUpperCase()}.`);
          return { ...evt, status: nextStatus };
        }
        return evt;
      });
      try {
        localStorage.setItem('pbb_admin_events', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function confirmDelete() {
    if (!deletingEvent) return;

    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== deletingEvent.id);
      try {
        localStorage.setItem('pbb_admin_events', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (selectedEventId === deletingEvent.id) {
      const remaining = events.filter((e) => e.id !== deletingEvent.id);
      if (remaining.length > 0) setSelectedEventId(remaining[0].id);
    }

    showToast(`Event "${deletingEvent.name}" deleted.`);
    setDeletingEvent(null);
  }

  function openCreateModal() {
    setEditingId(null);
    setFormName('');
    setFormKind('Blood Camp');
    setFormTown('Pishin');
    setFormDate('12 September 2026');
    setFormTime('9:00 AM - 4:00 PM');
    setFormLocation('Central Branch Desk');
    setFormCapacity('100');
    setFormImage(IMG.community);
    setFormStatus('live');
    setFormDesc('');
    setIsModalOpen(true);
  }

  function openEditModal(evt: EventItem) {
    setEditingId(evt.id);
    setFormName(evt.name);
    setFormKind(evt.kind);
    setFormTown(evt.town);
    setFormDate(evt.date);
    setFormTime(evt.time);
    setFormLocation(evt.location);
    setFormCapacity(evt.maxCapacity.toString());
    setFormImage(evt.image || IMG.community);
    setFormStatus(evt.status);
    setFormDesc(evt.description);
    setIsModalOpen(true);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormImage(dataUrl);
        showToast(`Uploaded cover image: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter an event title.');
      return;
    }

    if (editingId) {
      setEvents((prev) => {
        const next = prev.map((evt) => {
          if (evt.id === editingId) {
            return {
              ...evt,
              name: formName.trim(),
              kind: formKind,
              town: formTown,
              date: formDate.trim() || 'Upcoming',
              time: formTime.trim() || '24 Hours',
              location: formLocation.trim() || 'Main Branch',
              maxCapacity: parseInt(formCapacity, 10) || 100,
              image: formImage,
              status: formStatus,
              description: formDesc.trim(),
            };
          }
          return evt;
        });
        try {
          localStorage.setItem('pbb_admin_events', JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast('Event details updated successfully!');
    } else {
      const newEvt: EventItem = {
        id: `evt-${Date.now()}`,
        name: formName.trim(),
        kind: formKind,
        town: formTown,
        date: formDate.trim() || 'Upcoming',
        time: formTime.trim() || '24 Hours',
        location: formLocation.trim() || 'Main Branch',
        attendeesCount: 0,
        maxCapacity: parseInt(formCapacity, 10) || 100,
        image: formImage,
        status: formStatus,
        description: formDesc.trim() || 'Voluntary blood camp & community drive.',
        registeredList: [],
      };

      setEvents((prev) => {
        const next = [newEvt, ...prev];
        try {
          localStorage.setItem('pbb_admin_events', JSON.stringify(next));
        } catch {}
        return next;
      });
      setSelectedEventId(newEvt.id);
      showToast(`Event "${newEvt.name}" published!`);
    }

    setIsModalOpen(false);
  }

  // Add new attendee to active event
  function handleAddAttendee(e: React.FormEvent) {
    e.preventDefault();
    if (!newAttName.trim()) {
      showToast('Please enter volunteer attendee name.');
      return;
    }
    if (!activeEvent) return;

    const newAttendee: Attendee = {
      name: newAttName.trim(),
      bloodGroup: newAttGroup,
      town: newAttTown.trim() || activeEvent.town,
      phone: newAttPhone.trim() || '+92 300 0000000',
    };

    setEvents((prev) => {
      const next = prev.map((evt) => {
        if (evt.id === activeEvent.id) {
          return {
            ...evt,
            attendeesCount: evt.attendeesCount + 1,
            registeredList: [newAttendee, ...evt.registeredList],
          };
        }
        return evt;
      });
      try {
        localStorage.setItem('pbb_admin_events', JSON.stringify(next));
      } catch {}
      return next;
    });

    setNewAttName('');
    setNewAttPhone('');
    showToast(`Added ${newAttendee.name} (${newAttendee.bloodGroup}) to ${activeEvent.name} attendee registry.`);
  }

  const filteredEvents = events.filter((evt) => {
    if (statusFilter === 'live' && evt.status !== 'live') return false;
    if (statusFilter === 'draft' && evt.status !== 'draft') return false;
    if (statusFilter === 'completed' && evt.status !== 'completed') return false;
    if (selectedTown !== 'All Towns' && evt.town !== selectedTown) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        evt.name.toLowerCase().includes(q) ||
        evt.town.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const liveCount = events.filter((e) => e.status === 'live').length;
  const draftCount = events.filter((e) => e.status === 'draft').length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendeesCount, 0);

  const kindOptions = [
    { value: 'Blood Camp', label: 'Blood Camp' },
    { value: 'Awareness', label: 'Awareness' },
    { value: 'Campaign', label: 'Campaign' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Fundraiser', label: 'Fundraiser' },
  ];

  const townOptions = townList.filter((t) => t !== 'All Towns').map((t) => ({ value: t, label: t }));

  const bloodGroupOptions = ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'];

  const topActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" className="btn btn-p btn-s" onClick={openCreateModal}>
        <Icon name="plus" size={14} />
        <span style={{ marginLeft: '4px' }}>+ New Event</span>
      </button>
    </div>
  );

  return (
    <AdminShell
      view="events"
      title="Events &amp; Campaigns"
      subtitle={`${liveCount} active live events · ${totalAttendees} registered donors`}
      actions={topActions}
    >
      {/* KPI Stats Row */}
      <div className="akpi" style={{ marginBottom: '20px' }}>
        <div className="c">
          <div className="l">Total Events</div>
          <div className="n" style={{ color: 'var(--p)' }}>
            {events.length}
          </div>
        </div>
        <div className="c">
          <div className="l">Live Published</div>
          <div className="n" style={{ color: '#22C55E' }}>
            {liveCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Registered Volunteers</div>
          <div className="n" style={{ color: '#3B82F6' }}>
            {totalAttendees}
          </div>
        </div>
        <div className="c">
          <div className="l">Drafts &amp; Planning</div>
          <div className="n" style={{ color: draftCount > 0 ? '#EAB308' : 'var(--txt2)' }}>
            {draftCount}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="afilters" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '520px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="fld"
              placeholder="Search by event title, venue, or town..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)' }}>
              <Icon name="search" size={15} />
            </span>
          </div>

          <div style={{ width: '150px' }}>
            <CustomSelect
              name="townFilter"
              options={townList.map((t) => ({ value: t, label: t }))}
              value={selectedTown}
              onChange={(val) => setSelectedTown(val)}
            />
          </div>
        </div>

        {/* Upgraded Status Filter Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: statusFilter === 'all' ? '1px solid var(--p)' : '1px solid var(--line)',
              background: statusFilter === 'all' ? 'rgba(217, 35, 35, 0.1)' : 'var(--surf)',
              color: statusFilter === 'all' ? 'var(--p)' : 'var(--txt2)',
            }}
          >
            All ({events.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('live')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: statusFilter === 'live' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(34, 197, 94, 0.25)',
              background: statusFilter === 'live' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.08)',
              color: '#22C55E',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            Live ({liveCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: statusFilter === 'draft' ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid rgba(234, 179, 8, 0.25)',
              background: statusFilter === 'draft' ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.08)',
              color: '#EAB308',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EAB308' }} />
            Drafts ({draftCount})
          </button>
        </div>
      </div>

      {/* Events Table (Zero Scroll Fixed Layout) */}
      <div className="atbl" style={{ marginBottom: '24px', overflowX: 'hidden' }}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '32%' }}>Event Name &amp; Venue</th>
              <th style={{ width: '18%' }}>Category &amp; Town</th>
              <th style={{ width: '14%' }}>Date &amp; Time</th>
              <th style={{ width: '12%' }}>Registered</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '14%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((e) => {
              const isSelected = e.id === selectedEventId;
              return (
                <tr
                  key={e.id}
                  onClick={() => setSelectedEventId(e.id)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(217, 35, 35, 0.04)' : undefined,
                  }}
                >
                  <td className="m2" style={{ paddingRight: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={e.image || IMG.community}
                        alt={e.name}
                        style={{
                          width: '54px',
                          height: '42px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid var(--line)',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div className="nm" style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--p)' : 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {e.name}
                        </div>
                        <div className="sm" style={{ fontSize: '11.5px', color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          📍 {e.location}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span
                        className="tag"
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          width: 'fit-content',
                          background:
                            e.kind === 'Blood Camp'
                              ? 'rgba(217,35,35,0.12)'
                              : e.kind === 'Awareness'
                              ? 'rgba(59,130,246,0.12)'
                              : 'rgba(234,179,8,0.12)',
                          color:
                            e.kind === 'Blood Camp'
                              ? 'var(--p)'
                              : e.kind === 'Awareness'
                              ? '#3B82F6'
                              : '#EAB308',
                        }}
                      >
                        {e.kind}
                      </span>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--txt2)' }}>
                        {e.town}
                      </span>
                    </div>
                  </td>

                  <td style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt1)' }}>
                    <div>{e.date}</div>
                    <span className="sm" style={{ fontSize: '11px', color: 'var(--txt3)' }}>{e.time}</span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <b style={{ fontSize: '13px', color: 'var(--p)' }}>{e.attendeesCount}</b>
                      <span style={{ fontSize: '11px', color: 'var(--txt3)' }}>/ {e.maxCapacity}</span>
                    </div>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        toggleStatus(e.id);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '99px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        border: e.status === 'live' ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(148, 163, 184, 0.3)',
                        background: e.status === 'live' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                        color: e.status === 'live' ? '#22C55E' : '#94A3B8',
                      }}
                      title="Click to toggle live visibility"
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: e.status === 'live' ? '#22C55E' : '#94A3B8',
                          boxShadow: e.status === 'live' ? '0 0 6px #22C55E' : 'none',
                        }}
                      />
                      {e.status === 'live' ? 'Live' : 'Draft'}
                    </button>
                  </td>

                  {/* Actions Column */}
                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px', flexShrink: 0 }}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          openEditModal(e);
                        }}
                        title="Edit Event Details"
                      >
                        <Icon name="gear" size={13} />
                      </button>

                      <Link
                        href="/contact"
                        target="_blank"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                        onClick={(evt) => evt.stopPropagation()}
                        title="Preview Public Registration Page"
                      >
                        <Icon name="search" size={13} />
                      </Link>

                      <button
                        type="button"
                        className="btn-cross-delete"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setDeletingEvent(e);
                        }}
                        title="Delete Event"
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '12px',
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--txt3)' }}>
                  No events found matching "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 2-COLUMN CONTAINER: WHO IS COMING & EVENT STATS */}
      {activeEvent && (
        <div className="g2" style={{ gap: '20px', alignItems: 'start' }}>
          {/* CONTAINER 1: ATTENDEES REGISTRY */}
          <div className="acard" style={{ borderRadius: '18px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--p)', fontWeight: 800 }}>
                  Registered Donors &amp; Attendees
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                  Who is coming — {activeEvent.name}
                </h3>
              </div>

              <span className="tag ok" style={{ fontSize: '11px' }}>
                {activeEvent.registeredList.length} Volunteers
              </span>
            </div>

            {/* Quick Add Attendee Form */}
            <form onSubmit={handleAddAttendee} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="fld"
                placeholder="Volunteer Name"
                value={newAttName}
                onChange={(e) => setNewAttName(e.target.value)}
                style={{ flex: 2, minWidth: '130px', fontSize: '12px', padding: '6px 10px' }}
                required
              />
              <div style={{ width: '90px' }}>
                <CustomSelect
                  name="newAttGroup"
                  options={bloodGroupOptions}
                  value={newAttGroup}
                  onChange={(val) => setNewAttGroup(val)}
                />
              </div>
              <input
                type="text"
                className="fld"
                placeholder="Phone No"
                value={newAttPhone}
                onChange={(e) => setNewAttPhone(e.target.value)}
                style={{ flex: 1, minWidth: '110px', fontSize: '12px', padding: '6px 10px' }}
              />
              <button type="submit" className="btn btn-p btn-s" style={{ borderRadius: '8px' }}>
                + Add Volunteer
              </button>
            </form>

            {/* Attendees List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeEvent.registeredList.map((att, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    background: 'var(--surf)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: att.bloodGroup.includes('−') ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                        color: att.bloodGroup.includes('−') ? '#EF4444' : '#22C55E',
                        border: att.bloodGroup.includes('−') ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.3)',
                      }}
                    >
                      {att.bloodGroup}
                    </span>
                    <div>
                      <b style={{ fontSize: '13.5px', color: 'var(--txt1)' }}>{att.name}</b>
                      <span style={{ fontSize: '11.5px', color: 'var(--txt2)', display: 'block' }}>
                        📍 {att.town} · 📞 {att.phone}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-o btn-s"
                    onClick={() => showToast(`Added ${att.name} (${att.bloodGroup}) to central donor register!`)}
                    style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '8px' }}
                  >
                    + Add to Donor Database
                  </button>
                </div>
              ))}

              {activeEvent.registeredList.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--txt3)', fontSize: '13px' }}>
                  No volunteers registered for this event yet. Add a volunteer above!
                </div>
              )}
            </div>
          </div>

          {/* CONTAINER 2: EVENT DETAILS & CAPACITIES */}
          <div className="acard" style={{ borderRadius: '18px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--p)', fontWeight: 800 }}>
                  Event Overview &amp; Targets
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                  Camp Logistics
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-o btn-s"
                onClick={() => openEditModal(activeEvent)}
                style={{ fontSize: '11px' }}
              >
                ⚙️ Edit Event
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <img
                src={activeEvent.image || IMG.community}
                alt={activeEvent.name}
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--line)' }}
              />

              <div>
                <b style={{ fontSize: '14px', color: 'var(--txt1)', display: 'block' }}>{activeEvent.name}</b>
                <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  {activeEvent.description}
                </p>
              </div>

              <div style={{ background: 'var(--surf)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Registration Target Capacity:</span>
                  <span style={{ color: 'var(--p)' }}>{activeEvent.attendeesCount} / {activeEvent.maxCapacity} Donors</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.round((activeEvent.attendeesCount / activeEvent.maxCapacity) * 100))}%`,
                      height: '100%',
                      background: 'var(--p)',
                      borderRadius: '99px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <>
          <div
            className="sheetov on"
            onClick={() => setIsModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />
          <div
            className="acard"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--txt1)' }}>
                {editingId ? 'Edit Event Details' : 'Create New Event'}
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Event Title *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Free Blood Donation Camp & Screening"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Category Kind</label>
                  <CustomSelect
                    name="formKind"
                    options={kindOptions}
                    value={formKind}
                    onChange={(val) => setFormKind(val as any)}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>District Town</label>
                  <CustomSelect
                    name="formTown"
                    options={townOptions}
                    value={formTown}
                    onChange={(val) => setFormTown(val)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Schedule Date</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder="e.g. 12 September 2026"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Operating Hours</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder="e.g. 9:00 AM - 4:00 PM"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Venue Location Address</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder="e.g. Band Road Branch Desk"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </div>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Target Capacity</label>
                  <input
                    type="number"
                    className="fld"
                    placeholder="100"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Description &amp; Objectives</label>
                <textarea
                  className="fld"
                  rows={2}
                  placeholder="Event goals and instructions for volunteers..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              {/* COVER IMAGE SELECTOR & SYSTEM FILE UPLOAD */}
              <div className="fgrp">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="lb" style={{ fontWeight: 700, margin: 0 }}>
                    Event Cover Image
                  </label>
                  <button
                    type="button"
                    className="btn btn-o btn-s"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ fontSize: '11.5px', padding: '4px 10px', borderRadius: '8px' }}
                  >
                    📁 Upload from Device
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Preset Thumbnails Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                  {IMAGE_PRESETS.map((preset) => {
                    const isSelected = formImage === preset.url;
                    return (
                      <div
                        key={preset.label}
                        onClick={() => setFormImage(preset.url)}
                        style={{
                          border: isSelected ? '2px solid var(--p)' : '1px solid var(--line)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          background: isSelected ? 'rgba(217, 35, 35, 0.08)' : 'var(--surf)',
                          padding: '3px',
                          textAlign: 'center',
                        }}
                        className="sec-tile"
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          style={{ width: '100%', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <span style={{ fontSize: '9.5px', display: 'block', fontWeight: 600, marginTop: '2px', color: isSelected ? 'var(--p)' : 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {preset.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Image URL Field */}
                <input
                  type="text"
                  className="fld"
                  placeholder="Custom image URL or uploaded Data URL"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />
              </div>

              {/* Status Toggle */}
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Event Visibility Status</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`tag ${formStatus === 'live' ? 'ok' : 'gy'}`}
                    onClick={() => setFormStatus('live')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    🟢 Live (Published)
                  </button>
                  <button
                    type="button"
                    className={`tag ${formStatus === 'draft' ? 'ok' : 'gy'}`}
                    onClick={() => setFormStatus('draft')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    ⚡ Draft (Planning)
                  </button>
                  <button
                    type="button"
                    className={`tag ${formStatus === 'completed' ? 'ok' : 'gy'}`}
                    onClick={() => setFormStatus('completed')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    ✓ Completed
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-p" style={{ flex: 1, borderRadius: '10px' }}>
                  {editingId ? 'Save & Publish Changes' : 'Create & Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      {deletingEvent && (
        <>
          <div
            className="sheetov on"
            onClick={() => setDeletingEvent(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />
          <div
            className="acard"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '440px',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>⚠️</span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--txt1)' }}>
                Delete Event?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--txt2)', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete <b>"{deletingEvent.name}"</b> ({deletingEvent.town})? This will remove all volunteer attendee records for this event.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-o"
                style={{ flex: 1, borderRadius: '10px' }}
                onClick={() => setDeletingEvent(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-p"
                style={{ flex: 1, borderRadius: '10px', background: '#DC2626', borderColor: '#DC2626' }}
                onClick={confirmDelete}
              >
                Delete Event
              </button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
