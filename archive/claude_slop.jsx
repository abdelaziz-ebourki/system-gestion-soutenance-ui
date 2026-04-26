import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:       #0D1B2E;
    --navy-mid:   #152236;
    --navy-light: #1E3250;
    --slate:      #2C4066;
    --gold:       #C9A84C;
    --gold-light: #E0C06B;
    --gold-pale:  #F5E9C5;
    --cream:      #FAF7F0;
    --white:      #FFFFFF;
    --muted:      #8A9BB5;
    --danger:     #C0392B;
    --success:    #1E7A5F;
    --info:       #2874A6;
    --font-serif: 'Playfair Display', Georgia, serif;
    --font-sans:  'DM Sans', system-ui, sans-serif;
    --font-mono:  'DM Mono', monospace;
    --radius:     10px;
    --radius-lg:  16px;
    --shadow:     0 4px 24px rgba(13,27,46,0.18);
    --shadow-sm:  0 2px 8px rgba(13,27,46,0.10);
    --border:     1px solid rgba(201,168,76,0.18);
    --transition: 0.22s cubic-bezier(.4,0,.2,1);
  }

  body {
    font-family: var(--font-sans);
    background: var(--navy);
    color: var(--white);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--navy-mid); }
  ::-webkit-scrollbar-thumb { background: var(--slate); border-radius: 4px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes slideIn {
    from { opacity:0; transform:translateX(-12px); }
    to   { opacity:1; transform:translateX(0); }
  }

  .fade-up { animation: fadeUp 0.45s ease both; }
  .fade-up-1 { animation: fadeUp 0.45s 0.08s ease both; }
  .fade-up-2 { animation: fadeUp 0.45s 0.16s ease both; }
  .fade-up-3 { animation: fadeUp 0.45s 0.24s ease both; }
  .fade-up-4 { animation: fadeUp 0.45s 0.32s ease both; }

  /* ── SHARED COMPONENTS ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 22px; border-radius: var(--radius);
    font-family: var(--font-sans); font-size: 14px; font-weight: 500;
    cursor: pointer; border: none; transition: var(--transition);
    text-decoration: none; white-space: nowrap;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--gold) 0%, #B8952F 100%);
    color: var(--navy); box-shadow: 0 2px 12px rgba(201,168,76,0.3);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(201,168,76,0.45); }
  .btn-ghost {
    background: rgba(255,255,255,0.06); color: var(--muted); border: var(--border);
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.10); color: var(--white); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-sm { padding: 6px 14px; font-size: 13px; }

  .card {
    background: var(--navy-mid); border: var(--border);
    border-radius: var(--radius-lg); padding: 24px;
    transition: var(--transition);
  }
  .card:hover { border-color: rgba(201,168,76,0.35); }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase;
  }
  .badge-gold { background: rgba(201,168,76,0.15); color: var(--gold); border: 1px solid rgba(201,168,76,0.3); }
  .badge-green { background: rgba(30,122,95,0.18); color: #3CC99A; border: 1px solid rgba(60,201,154,0.25); }
  .badge-blue  { background: rgba(40,116,166,0.18); color: #60B4E8; border: 1px solid rgba(96,180,232,0.25); }
  .badge-red   { background: rgba(192,57,43,0.18); color: #F08080; border: 1px solid rgba(240,128,128,0.25); }
  .badge-gray  { background: rgba(138,155,181,0.12); color: var(--muted); border: 1px solid rgba(138,155,181,0.2); }

  .divider { height:1px; background: rgba(201,168,76,0.12); margin: 20px 0; }

  /* ── GRID BACKGROUND ── */
  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .glow {
    position: fixed; pointer-events: none; z-index: 0; border-radius: 50%;
    filter: blur(80px); opacity: 0.12;
  }

  /* ── LOGIN ── */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1; padding: 24px;
  }
  .login-card {
    width: 100%; max-width: 440px;
    background: rgba(21,34,54,0.92); backdrop-filter: blur(20px);
    border: 1px solid rgba(201,168,76,0.22); border-radius: 20px;
    padding: 48px 40px; box-shadow: 0 32px 80px rgba(0,0,0,0.4);
  }
  .input-group { margin-bottom: 18px; }
  .input-label { display: block; font-size: 12px; font-weight: 600;
    letter-spacing: .8px; text-transform: uppercase; color: var(--muted); margin-bottom: 7px; }
  .input-field {
    width: 100%; padding: 11px 16px; border-radius: var(--radius);
    background: rgba(13,27,46,0.6); border: 1px solid rgba(138,155,181,0.2);
    color: var(--white); font-family: var(--font-sans); font-size: 14px;
    outline: none; transition: var(--transition);
  }
  .input-field:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
  .input-field::placeholder { color: rgba(138,155,181,0.5); }
  select.input-field { cursor: pointer; }
  select.input-field option { background: var(--navy-mid); }

  /* ── LAYOUT ── */
  .app-layout { display: flex; min-height: 100vh; position: relative; z-index: 1; }
  .sidebar {
    width: 260px; flex-shrink: 0;
    background: rgba(13,27,46,0.95); backdrop-filter: blur(16px);
    border-right: 1px solid rgba(201,168,76,0.12);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
    transition: transform var(--transition);
  }
  .sidebar-logo { padding: 28px 24px 20px; border-bottom: 1px solid rgba(201,168,76,0.10); }
  .sidebar-nav { flex: 1; overflow-y: auto; padding: 16px 12px; }
  .nav-section { margin-bottom: 24px; }
  .nav-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
    color: rgba(138,155,181,0.5); padding: 0 12px; margin-bottom: 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; cursor: pointer;
    font-size: 14px; color: var(--muted); transition: var(--transition);
    border: 1px solid transparent; margin-bottom: 2px;
  }
  .nav-item:hover { background: rgba(201,168,76,0.06); color: var(--white); }
  .nav-item.active {
    background: rgba(201,168,76,0.10); color: var(--gold);
    border-color: rgba(201,168,76,0.18);
  }
  .nav-item .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(201,168,76,0.10); }

  .main-area { margin-left: 260px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
  .topbar {
    height: 64px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; border-bottom: 1px solid rgba(201,168,76,0.10);
    background: rgba(21,34,54,0.7); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 50;
  }
  .page-content { padding: 32px; flex: 1; }
  .page-title {
    font-family: var(--font-serif); font-size: 26px; font-weight: 700;
    color: var(--white); margin-bottom: 4px;
  }
  .page-subtitle { font-size: 14px; color: var(--muted); margin-bottom: 28px; }

  /* ── STAT CARDS ── */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: var(--navy-mid); border: var(--border); border-radius: var(--radius-lg);
    padding: 20px 22px; position: relative; overflow: hidden; transition: var(--transition);
  }
  .stat-card:hover { transform: translateY(-2px); border-color: rgba(201,168,76,0.35); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0; transition: var(--transition);
  }
  .stat-card:hover::before { opacity: 1; }
  .stat-value { font-size: 32px; font-weight: 700; font-family: var(--font-mono); color: var(--white); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; font-weight: 500; letter-spacing: .3px; }
  .stat-icon { font-size: 28px; margin-bottom: 10px; }
  .stat-trend { font-size: 11px; margin-top: 8px; }

  /* ── TABLE ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700;
    letter-spacing: .8px; text-transform: uppercase; color: var(--muted);
    border-bottom: 1px solid rgba(201,168,76,0.12); background: rgba(13,27,46,0.4); }
  td { padding: 13px 16px; border-bottom: 1px solid rgba(201,168,76,0.07); color: rgba(255,255,255,0.85); }
  tr:hover td { background: rgba(201,168,76,0.04); }
  tr:last-child td { border-bottom: none; }

  /* ── TIMELINE ── */
  .timeline { position: relative; padding-left: 28px; }
  .timeline::before { content:''; position:absolute; left:8px; top:0; bottom:0;
    width:1px; background: rgba(201,168,76,0.2); }
  .timeline-item { position: relative; margin-bottom: 20px; animation: slideIn .4s ease both; }
  .timeline-dot { position:absolute; left:-24px; top:4px; width:12px; height:12px;
    border-radius:50%; background: var(--gold); border:2px solid var(--navy); }
  .timeline-time { font-size:11px; color: var(--muted); font-family: var(--font-mono); margin-bottom:3px; }
  .timeline-text { font-size:13px; color: var(--white); }

  /* ── CALENDAR STRIP ── */
  .cal-strip { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; }
  .cal-day { flex-shrink:0; width:60px; padding:10px 0; border-radius:10px;
    text-align:center; cursor:pointer; border:var(--border); transition:var(--transition); }
  .cal-day:hover { border-color: rgba(201,168,76,0.4); }
  .cal-day.active { background: linear-gradient(135deg, var(--gold), #B8952F); color: var(--navy); border-color:transparent; }
  .cal-day-name { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; opacity:.7; }
  .cal-day-num { font-size:20px; font-weight:700; font-family:var(--font-mono); margin-top:2px; }

  /* ── PROGRESS ── */
  .progress-bar { height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; margin-top:8px; }
  .progress-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,var(--gold),var(--gold-light)); transition:width .6s ease; }

  /* ── AVATAR ── */
  .avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:700; flex-shrink:0; }

  /* ── NOTIFICATION DOT ── */
  .notif-dot { width:8px; height:8px; background:var(--gold); border-radius:50%;
    position:absolute; top:-2px; right:-2px; animation: pulse 2s infinite; }

  /* ── MODAL ── */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px);
    z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
  .modal { background:var(--navy-mid); border:var(--border); border-radius:20px;
    padding:32px; width:100%; max-width:480px; animation:fadeUp .3s ease; box-shadow: var(--shadow); }
  .modal-title { font-family:var(--font-serif); font-size:20px; font-weight:700; margin-bottom:20px; }

  /* ── CONFLICT ALERT ── */
  .conflict-card { background:rgba(192,57,43,0.10); border:1px solid rgba(192,57,43,0.3);
    border-radius:var(--radius); padding:14px 18px; margin-bottom:12px; }
  .conflict-title { font-size:13px; font-weight:600; color:#F08080; margin-bottom:4px; }
  .conflict-desc { font-size:12px; color:rgba(240,128,128,0.75); }

  /* ── TOPBAR SEARCH ── */
  .search-bar {
    display:flex; align-items:center; gap:8px;
    background:rgba(13,27,46,0.5); border:1px solid rgba(138,155,181,0.15);
    border-radius:8px; padding:7px 14px; min-width:220px;
  }
  .search-bar input { background:transparent; border:none; outline:none;
    color:var(--white); font-family:var(--font-sans); font-size:13px; flex:1; }
  .search-bar input::placeholder { color:rgba(138,155,181,0.4); }

  /* ── SECTION HEADER ── */
  .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .section-title { font-size:16px; font-weight:600; color:var(--white); }

  /* ── SOUTENANCE CARD ── */
  .sout-card {
    display:flex; align-items:center; gap:16px;
    padding:16px; border-radius:var(--radius); border:var(--border);
    background:rgba(13,27,46,0.4); transition:var(--transition); margin-bottom:10px;
  }
  .sout-card:hover { border-color:rgba(201,168,76,0.3); background:rgba(13,27,46,0.6); }
  .sout-time { font-family:var(--font-mono); font-size:13px; color:var(--gold); min-width:80px; }
  .sout-info { flex:1; }
  .sout-student { font-size:14px; font-weight:500; color:var(--white); }
  .sout-project { font-size:12px; color:var(--muted); margin-top:2px; }
  .sout-meta { font-size:11px; color:rgba(138,155,181,0.6); margin-top:1px; }
`;

// ─── SVG LOGO ────────────────────────────────────────────────────────────────
const Logo = ({ size = 36 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 48 48"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		{/* Shield base */}
		<path
			d="M24 4L8 11V24C8 33.4 15.2 42.1 24 44C32.8 42.1 40 33.4 40 24V11L24 4Z"
			fill="url(#shieldGrad)"
			stroke="rgba(201,168,76,0.5)"
			strokeWidth="0.5"
		/>
		{/* Inner shield highlight */}
		<path
			d="M24 9L12 14.5V24C12 31.2 17.4 37.8 24 39.4C30.6 37.8 36 31.2 36 24V14.5L24 9Z"
			fill="rgba(13,27,46,0.5)"
		/>
		{/* Book icon inside */}
		<rect
			x="17"
			y="19"
			width="14"
			height="10"
			rx="1.5"
			fill="rgba(201,168,76,0.2)"
			stroke="rgba(201,168,76,0.6)"
			strokeWidth="0.8"
		/>
		<line
			x1="24"
			y1="19"
			x2="24"
			y2="29"
			stroke="rgba(201,168,76,0.5)"
			strokeWidth="0.8"
		/>
		<line
			x1="19"
			y1="22"
			x2="22.5"
			y2="22"
			stroke="rgba(201,168,76,0.5)"
			strokeWidth="0.7"
		/>
		<line
			x1="19"
			y1="24.5"
			x2="22.5"
			y2="24.5"
			stroke="rgba(201,168,76,0.5)"
			strokeWidth="0.7"
		/>
		<line
			x1="19"
			y1="27"
			x2="22.5"
			y2="27"
			stroke="rgba(201,168,76,0.5)"
			strokeWidth="0.7"
		/>
		<line
			x1="25.5"
			y1="22"
			x2="29"
			y2="22"
			stroke="rgba(201,168,76,0.5)"
			strokeWidth="0.7"
		/>
		<line
			x1="25.5"
			y1="24.5"
			x2="29"
			y2="24.5"
			stroke="rgba(201,168,76,0.5)"
			strokeWidth="0.7"
		/>
		<line
			x1="25.5"
			y1="27"
			x2="29"
			y2="27"
			stroke="rgba(201,168,76,0.5)"
			strokeWidth="0.7"
		/>
		{/* Crown dots */}
		<circle cx="24" cy="15" r="1.5" fill="var(--gold)" />
		<circle cx="19.5" cy="16.5" r="1" fill="rgba(201,168,76,0.6)" />
		<circle cx="28.5" cy="16.5" r="1" fill="rgba(201,168,76,0.6)" />
		<defs>
			<linearGradient
				id="shieldGrad"
				x1="24"
				y1="4"
				x2="24"
				y2="44"
				gradientUnits="userSpaceOnUse"
			>
				<stop offset="0%" stopColor="#1E3250" />
				<stop offset="100%" stopColor="#0D1B2E" />
			</linearGradient>
		</defs>
	</svg>
);

// ─── ICONS (simple emoji/text icons for brevity) ──────────────────────────────
const icons = {
	dashboard: "⊞",
	students: "👤",
	teachers: "🎓",
	rooms: "🚪",
	schedule: "📅",
	jury: "⚖️",
	docs: "📄",
	eval: "✏️",
	settings: "⚙️",
	logout: "→",
	notif: "🔔",
	search: "🔍",
	conflict: "⚠️",
	check: "✓",
	clock: "⏱",
	location: "📍",
	user: "👤",
	chart: "📊",
	plus: "＋",
	arrow: "›",
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const SOUTENANCES = [
	{
		id: 1,
		time: "08:30",
		student: "Amina Benali",
		project: "Système de recommandation ML",
		room: "Salle A1",
		jury: ["Pr. Hamid", "Dr. Laarbi", "Pr. Fassi"],
		status: "confirmed",
		filiere: "Master IA",
	},
	{
		id: 2,
		time: "09:30",
		student: "Youssef El Khatib",
		project: "Application IoT pour Smart Campus",
		room: "Salle B2",
		jury: ["Dr. Nadia", "Pr. Hamid", "Dr. Zine"],
		status: "confirmed",
		filiere: "Master IoT",
	},
	{
		id: 3,
		time: "10:30",
		student: "Sara Ouahabi",
		project: "Blockchain pour traçabilité docs",
		room: "Salle A1",
		jury: ["Pr. Fassi", "Dr. Laarbi", "Dr. Zine"],
		status: "pending",
		filiere: "Master SD",
	},
	{
		id: 4,
		time: "14:00",
		student: "Mehdi Tazi",
		project: "Détection d'anomalies réseau",
		room: "Salle C3",
		jury: ["Dr. Nadia", "Pr. Hamid", "Pr. Fassi"],
		status: "confirmed",
		filiere: "Master SSI",
	},
	{
		id: 5,
		time: "15:00",
		student: "Hajar Cherkaoui",
		project: "Analyse sentiments réseaux sociaux",
		room: "Salle B2",
		jury: ["Dr. Laarbi", "Dr. Zine", "Pr. Hamid"],
		status: "conflict",
		filiere: "Master IA",
	},
];

const TEACHERS = [
	{
		id: 1,
		name: "Pr. Mohammed Hamid",
		dept: "Informatique",
		role: "Président",
		soutenances: 8,
		available: true,
	},
	{
		id: 2,
		name: "Dr. Fatima Laarbi",
		dept: "Mathématiques",
		role: "Rapporteur",
		soutenances: 6,
		available: true,
	},
	{
		id: 3,
		name: "Pr. Karim Fassi",
		dept: "Informatique",
		role: "Examinateur",
		soutenances: 7,
		available: false,
	},
	{
		id: 4,
		name: "Dr. Nadia Zine",
		dept: "SI",
		role: "Rapporteur",
		soutenances: 5,
		available: true,
	},
];

const STUDENTS = [
	{
		id: 1,
		name: "Amina Benali",
		cne: "G123456",
		filiere: "Master IA",
		project: "Système de recommandation ML",
		encadrant: "Pr. Hamid",
		status: "scheduled",
	},
	{
		id: 2,
		name: "Youssef El Khatib",
		cne: "G234567",
		filiere: "Master IoT",
		project: "IoT Smart Campus",
		encadrant: "Dr. Nadia",
		status: "scheduled",
	},
	{
		id: 3,
		name: "Sara Ouahabi",
		cne: "G345678",
		filiere: "Master SD",
		project: "Blockchain traçabilité",
		encadrant: "Dr. Laarbi",
		status: "pending",
	},
	{
		id: 4,
		name: "Mehdi Tazi",
		cne: "G456789",
		filiere: "Master SSI",
		project: "Détection anomalies",
		encadrant: "Pr. Fassi",
		status: "scheduled",
	},
	{
		id: 5,
		name: "Hajar Cherkaoui",
		cne: "G567890",
		filiere: "Master IA",
		project: "Analyse sentiments",
		encadrant: "Dr. Zine",
		status: "conflict",
	},
];

const CONFLICTS = [
	{
		id: 1,
		type: "Conflit d'horaire",
		desc: "Dr. Nadia Zine affectée à 2 soutenances simultanées (15h00)",
		severity: "high",
	},
	{
		id: 2,
		type: "Salle occupée",
		desc: "Salle B2 réservée pour 2 séances à 15h00",
		severity: "high",
	},
];

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DATES = [14, 15, 16, 17, 18, 19];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const AvatarEl = ({ name, size = 36, color = "#1E3250" }) => {
	const initials = name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
	const colors = ["#1E3250", "#2C4066", "#1E7A5F", "#2874A6", "#7D3C98"];
	const idx = name.charCodeAt(0) % colors.length;
	return (
		<div
			className="avatar"
			style={{
				width: size,
				height: size,
				background: colors[idx],
				border: "2px solid rgba(201,168,76,0.3)",
				fontSize: size * 0.38,
			}}
		>
			{initials}
		</div>
	);
};

const StatusBadge = ({ status }) => {
	const map = {
		confirmed: ["badge-green", "Confirmé"],
		pending: ["badge-gold", "En attente"],
		conflict: ["badge-red", "Conflit"],
		scheduled: ["badge-blue", "Planifié"],
	};
	const [cls, label] = map[status] || ["badge-gray", status];
	return <span className={`badge ${cls}`}>{label}</span>;
};

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
	const [role, setRole] = useState("coordinator");
	const [email, setEmail] = useState("");
	const [pass, setPass] = useState("");
	const [loading, setLoading] = useState(false);

	const credentials = {
		admin: { email: "admin@fsbm.ma", label: "Administrateur" },
		coordinator: { email: "coord@fsbm.ma", label: "Coordinateur" },
		teacher: { email: "prof@fsbm.ma", label: "Enseignant" },
		student: { email: "student@fsbm.ma", label: "Étudiant" },
	};

	const handleSubmit = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			onLogin(role);
		}, 900);
	};

	const autofill = (r) => {
		setRole(r);
		setEmail(credentials[r].email);
		setPass("••••••••");
	};

	return (
		<div className="login-wrap">
			<div className="grid-bg" />
			<div
				className="glow"
				style={{
					width: 500,
					height: 500,
					background: "var(--gold)",
					top: -100,
					left: -100,
				}}
			/>
			<div
				className="glow"
				style={{
					width: 400,
					height: 400,
					background: "var(--slate)",
					bottom: -80,
					right: -80,
				}}
			/>

			<div className="login-card fade-up">
				{/* Logo + Title */}
				<div style={{ textAlign: "center", marginBottom: 32 }}>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							marginBottom: 16,
						}}
					>
						<Logo size={56} />
					</div>
					<div
						style={{
							fontFamily: "var(--font-serif)",
							fontSize: 22,
							fontWeight: 700,
							color: "var(--white)",
							letterSpacing: "-0.3px",
						}}
					>
						SoutenanceHub
					</div>
					<div
						style={{
							fontSize: 12,
							color: "var(--muted)",
							marginTop: 4,
							letterSpacing: ".5px",
						}}
					>
						FSBM · Université Hassan II de Casablanca
					</div>
					<div
						style={{
							width: 40,
							height: 2,
							background:
								"linear-gradient(90deg,transparent,var(--gold),transparent)",
							margin: "14px auto 0",
						}}
					/>
				</div>

				{/* Quick role selector */}
				<div style={{ marginBottom: 20 }}>
					<div
						style={{
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: ".8px",
							textTransform: "uppercase",
							color: "var(--muted)",
							marginBottom: 8,
						}}
					>
						Connexion rapide
					</div>
					<div
						style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
					>
						{Object.entries(credentials).map(([r, { label }]) => (
							<button
								key={r}
								className={`btn btn-sm ${role === r ? "btn-primary" : "btn-ghost"}`}
								style={{ justifyContent: "center" }}
								onClick={() => autofill(r)}
							>
								{label}
							</button>
						))}
					</div>
				</div>

				<div className="divider" />

				<div className="input-group fade-up-1">
					<label className="input-label">Adresse e-mail</label>
					<input
						className="input-field"
						type="email"
						placeholder="votre@fsbm.ma"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div className="input-group fade-up-2">
					<label className="input-label">Mot de passe</label>
					<input
						className="input-field"
						type="password"
						placeholder="••••••••"
						value={pass}
						onChange={(e) => setPass(e.target.value)}
					/>
				</div>
				<div style={{ textAlign: "right", marginBottom: 22 }}>
					<a
						href="#"
						style={{
							fontSize: 12,
							color: "var(--gold)",
							textDecoration: "none",
						}}
					>
						Mot de passe oublié ?
					</a>
				</div>
				<button
					className="btn btn-primary fade-up-3"
					style={{
						width: "100%",
						justifyContent: "center",
						padding: "13px",
						fontSize: 15,
					}}
					onClick={handleSubmit}
					disabled={loading}
				>
					{loading ? (
						<span
							style={{
								animation: "spin 1s linear infinite",
								display: "inline-block",
							}}
						>
							◌
						</span>
					) : (
						"Se connecter"
					)}
				</button>
				<div
					style={{
						marginTop: 20,
						textAlign: "center",
						fontSize: 11,
						color: "rgba(138,155,181,0.5)",
					}}
				>
					Année universitaire 2025–2026
				</div>
			</div>
		</div>
	);
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const navConfigs = {
	admin: [
		{
			section: "Général",
			items: [
				{ key: "dashboard", icon: "⊞", label: "Tableau de bord" },
				{ key: "users", icon: "👥", label: "Utilisateurs" },
			],
		},
		{
			section: "Académique",
			items: [
				{ key: "students", icon: "🎓", label: "Étudiants" },
				{ key: "teachers", icon: "👨‍🏫", label: "Enseignants" },
				{ key: "rooms", icon: "🚪", label: "Salles" },
			],
		},
		{
			section: "Système",
			items: [{ key: "settings", icon: "⚙️", label: "Paramètres" }],
		},
	],
	coordinator: [
		{
			section: "Général",
			items: [
				{ key: "dashboard", icon: "⊞", label: "Tableau de bord" },
				{ key: "conflicts", icon: "⚠️", label: "Conflits", badge: 2 },
			],
		},
		{
			section: "Planification",
			items: [
				{ key: "schedule", icon: "📅", label: "Planning" },
				{ key: "jury", icon: "⚖️", label: "Jurys" },
				{ key: "rooms", icon: "🚪", label: "Salles" },
			],
		},
		{
			section: "Données",
			items: [
				{ key: "students", icon: "🎓", label: "Étudiants" },
				{ key: "teachers", icon: "👨‍🏫", label: "Enseignants" },
				{ key: "docs", icon: "📄", label: "Documents" },
			],
		},
	],
	teacher: [
		{
			section: "Général",
			items: [
				{ key: "dashboard", icon: "⊞", label: "Mon espace" },
				{ key: "schedule", icon: "📅", label: "Mon planning" },
			],
		},
		{
			section: "Jurys",
			items: [
				{ key: "jury", icon: "⚖️", label: "Mes jurys" },
				{ key: "eval", icon: "✏️", label: "Évaluations" },
			],
		},
	],
	student: [
		{
			section: "Général",
			items: [
				{ key: "dashboard", icon: "⊞", label: "Mon espace" },
				{ key: "schedule", icon: "📅", label: "Ma soutenance" },
				{ key: "docs", icon: "📄", label: "Documents" },
			],
		},
	],
};

const roleLabels = {
	admin: "Administrateur",
	coordinator: "Coordinateur",
	teacher: "Enseignant",
	student: "Étudiant",
};
const roleUsers = {
	admin: "Mohammed Ait Daoud",
	coordinator: "Salma Sammah",
	teacher: "Pr. Karim Fassi",
	student: "Amina Benali",
};

const Sidebar = ({ role, active, setActive, onLogout }) => {
	const nav = navConfigs[role] || navConfigs.coordinator;
	return (
		<aside className="sidebar">
			<div className="sidebar-logo">
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<Logo size={38} />
					<div>
						<div
							style={{
								fontFamily: "var(--font-serif)",
								fontSize: 15,
								fontWeight: 700,
								color: "var(--white)",
								lineHeight: 1.2,
							}}
						>
							SoutenanceHub
						</div>
						<div
							style={{
								fontSize: 10,
								color: "var(--gold)",
								letterSpacing: ".5px",
								marginTop: 2,
							}}
						>
							FSBM · Hassan II
						</div>
					</div>
				</div>
			</div>

			<nav className="sidebar-nav">
				{nav.map(({ section, items }) => (
					<div key={section} className="nav-section">
						<div className="nav-section-label">{section}</div>
						{items.map(({ key, icon, label, badge }) => (
							<div
								key={key}
								className={`nav-item ${active === key ? "active" : ""}`}
								onClick={() => setActive(key)}
							>
								<span className="nav-icon">{icon}</span>
								<span style={{ flex: 1 }}>{label}</span>
								{badge && (
									<span
										style={{
											background: "var(--danger)",
											color: "white",
											borderRadius: 10,
											fontSize: 10,
											padding: "1px 6px",
											fontWeight: 700,
										}}
									>
										{badge}
									</span>
								)}
							</div>
						))}
					</div>
				))}
			</nav>

			<div className="sidebar-footer">
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						padding: "8px 12px",
						borderRadius: 8,
						background: "rgba(255,255,255,0.03)",
					}}
				>
					<AvatarEl name={roleUsers[role]} size={32} />
					<div style={{ flex: 1, minWidth: 0 }}>
						<div
							style={{
								fontSize: 13,
								fontWeight: 500,
								color: "var(--white)",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{roleUsers[role]}
						</div>
						<div style={{ fontSize: 11, color: "var(--gold)" }}>
							{roleLabels[role]}
						</div>
					</div>
				</div>
				<button
					className="btn btn-ghost btn-sm"
					style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
					onClick={onLogout}
				>
					Déconnexion
				</button>
			</div>
		</aside>
	);
};

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
const Topbar = ({ title, role }) => (
	<div className="topbar">
		<div
			style={{
				fontFamily: "var(--font-serif)",
				fontSize: 17,
				fontWeight: 600,
				color: "var(--white)",
			}}
		>
			{title}
		</div>
		<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
			<div className="search-bar">
				<span style={{ fontSize: 13, color: "var(--muted)" }}>🔍</span>
				<input placeholder="Rechercher..." />
			</div>
			<div style={{ position: "relative", cursor: "pointer" }}>
				<div style={{ fontSize: 18, lineHeight: 1 }}>🔔</div>
				<div className="notif-dot" />
			</div>
			<AvatarEl name={roleUsers[role]} size={34} />
		</div>
	</div>
);

// ─── DASHBOARD: COORDINATOR ───────────────────────────────────────────────────
const CoordDashboard = ({ setActive }) => {
	const [activeDay, setActiveDay] = useState(2);

	return (
		<div>
			<div className="page-title fade-up">Tableau de bord</div>
			<div className="page-subtitle fade-up-1">
				Session de soutenances — Juin 2025
			</div>

			{/* Stats */}
			<div className="stats-grid">
				{[
					{
						icon: "🎓",
						value: "47",
						label: "Soutenances totales",
						trend: "+3 cette semaine",
						color: "var(--gold)",
					},
					{
						icon: "⚖️",
						value: "12",
						label: "Jurys mobilisés",
						trend: "8 disponibles",
						color: "#3CC99A",
					},
					{
						icon: "🚪",
						value: "6",
						label: "Salles utilisées",
						trend: "2 libres aujourd'hui",
						color: "#60B4E8",
					},
					{
						icon: "✏️",
						value: "31",
						label: "Évaluées",
						trend: "16 restantes",
						color: "#B07FE0",
					},
				].map((s, i) => (
					<div
						key={i}
						className={`stat-card fade-up-${i}`}
						style={{ "--i": i }}
					>
						<div className="stat-icon">{s.icon}</div>
						<div className="stat-value" style={{ color: s.color }}>
							{s.value}
						</div>
						<div className="stat-label">{s.label}</div>
						<div
							className="stat-trend"
							style={{ color: s.color, opacity: 0.7 }}
						>
							{s.trend}
						</div>
					</div>
				))}
			</div>

			{/* Progress */}
			<div className="card fade-up-2" style={{ marginBottom: 20 }}>
				<div className="section-header">
					<div className="section-title">Avancement de la session</div>
					<span className="badge badge-gold">66%</span>
				</div>
				<div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
					31 soutenances évaluées sur 47
				</div>
				<div className="progress-bar">
					<div className="progress-fill" style={{ width: "66%" }} />
				</div>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
				{/* Calendar + today's schedule */}
				<div className="card fade-up-2">
					<div className="section-header">
						<div className="section-title">📅 Planning du jour</div>
						<button
							className="btn btn-ghost btn-sm"
							onClick={() => setActive("schedule")}
						>
							Tout voir
						</button>
					</div>
					<div className="cal-strip" style={{ marginBottom: 16 }}>
						{DAYS.map((d, i) => (
							<div
								key={i}
								className={`cal-day ${activeDay === i ? "active" : ""}`}
								onClick={() => setActiveDay(i)}
							>
								<div className="cal-day-name">{d}</div>
								<div className="cal-day-num">{DATES[i]}</div>
							</div>
						))}
					</div>
					{SOUTENANCES.slice(0, 3).map((s) => (
						<div key={s.id} className="sout-card">
							<div className="sout-time">{s.time}</div>
							<div className="sout-info">
								<div className="sout-student">{s.student}</div>
								<div className="sout-project">{s.project}</div>
								<div className="sout-meta">
									📍 {s.room} · {s.filiere}
								</div>
							</div>
							<StatusBadge status={s.status} />
						</div>
					))}
				</div>

				{/* Conflicts */}
				<div className="card fade-up-3">
					<div className="section-header">
						<div className="section-title">⚠️ Conflits détectés</div>
						<span className="badge badge-red">{CONFLICTS.length}</span>
					</div>
					{CONFLICTS.map((c) => (
						<div key={c.id} className="conflict-card">
							<div className="conflict-title">⚠ {c.type}</div>
							<div className="conflict-desc">{c.desc}</div>
							<button
								className="btn btn-danger btn-sm"
								style={{ marginTop: 10 }}
							>
								Résoudre
							</button>
						</div>
					))}
					<div className="divider" />
					<div className="section-title" style={{ marginBottom: 12 }}>
						Activité récente
					</div>
					<div className="timeline">
						{[
							{ time: "09:15", text: "Soutenance Benali confirmée — Salle A1" },
							{ time: "08:50", text: "Jury affecté pour El Khatib" },
							{ time: "08:30", text: "Convocation envoyée à Pr. Hamid" },
							{ time: "Hier", text: "Import de 47 étudiants effectué" },
						].map((t, i) => (
							<div
								key={i}
								className="timeline-item"
								style={{ animationDelay: `${i * 0.1}s` }}
							>
								<div className="timeline-dot" />
								<div className="timeline-time">{t.time}</div>
								<div className="timeline-text">{t.text}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

// ─── DASHBOARD: STUDENT ───────────────────────────────────────────────────────
const StudentDashboard = () => (
	<div>
		<div className="page-title fade-up">Mon espace soutenance</div>
		<div className="page-subtitle fade-up-1">
			Bienvenue, Amina Benali — Filière Master IA
		</div>

		{/* Main info card */}
		<div
			className="card fade-up"
			style={{
				marginBottom: 20,
				background:
					"linear-gradient(135deg,rgba(201,168,76,0.08),rgba(30,50,80,0.8))",
				borderColor: "rgba(201,168,76,0.3)",
			}}
		>
			<div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
				<AvatarEl name="Amina Benali" size={56} />
				<div style={{ flex: 1 }}>
					<div
						style={{
							fontFamily: "var(--font-serif)",
							fontSize: 20,
							fontWeight: 700,
							marginBottom: 4,
						}}
					>
						Ma Soutenance
					</div>
					<div
						style={{
							fontSize: 15,
							color: "var(--gold)",
							fontWeight: 500,
							marginBottom: 12,
						}}
					>
						Système de recommandation basé sur le Machine Learning
					</div>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3,1fr)",
							gap: 12,
						}}
					>
						{[
							{ icon: "📅", label: "Date", value: "Lundi 16 Juin 2025" },
							{ icon: "⏱", label: "Heure", value: "08h30 — 09h30" },
							{ icon: "📍", label: "Salle", value: "Salle A1 · Bât. C" },
						].map((i, idx) => (
							<div
								key={idx}
								style={{
									background: "rgba(13,27,46,0.4)",
									padding: "12px",
									borderRadius: 8,
									border: "var(--border)",
								}}
							>
								<div style={{ fontSize: 18, marginBottom: 4 }}>{i.icon}</div>
								<div
									style={{
										fontSize: 11,
										color: "var(--muted)",
										textTransform: "uppercase",
										letterSpacing: ".5px",
									}}
								>
									{i.label}
								</div>
								<div
									style={{
										fontSize: 13,
										fontWeight: 500,
										color: "var(--white)",
										marginTop: 2,
									}}
								>
									{i.value}
								</div>
							</div>
						))}
					</div>
				</div>
				<StatusBadge status="scheduled" />
			</div>
		</div>

		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
			{/* Jury */}
			<div className="card fade-up-1">
				<div className="section-title" style={{ marginBottom: 14 }}>
					⚖️ Composition du jury
				</div>
				{[
					{
						name: "Pr. Mohammed Hamid",
						role: "Président",
						dept: "Informatique",
					},
					{
						name: "Dr. Fatima Laarbi",
						role: "Rapporteur",
						dept: "Mathématiques",
					},
					{ name: "Dr. Nadia Zine", role: "Encadrante", dept: "SI" },
					{
						name: "Pr. Karim Fassi",
						role: "Examinateur",
						dept: "Informatique",
					},
				].map((m, i) => (
					<div
						key={i}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 12,
							padding: "10px 0",
							borderBottom: "1px solid rgba(201,168,76,0.07)",
						}}
					>
						<AvatarEl name={m.name} size={34} />
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
							<div style={{ fontSize: 11, color: "var(--muted)" }}>
								{m.dept}
							</div>
						</div>
						<span className="badge badge-gold">{m.role}</span>
					</div>
				))}
			</div>

			{/* Checklist + Docs */}
			<div>
				<div className="card fade-up-2" style={{ marginBottom: 16 }}>
					<div className="section-title" style={{ marginBottom: 12 }}>
						📋 Checklist pré-soutenance
					</div>
					{[
						{ done: true, text: "Rapport final déposé" },
						{ done: true, text: "Résumé soumis au coordinateur" },
						{ done: false, text: "Présentation PowerPoint finalisée" },
						{ done: false, text: "Convocation téléchargée" },
					].map((item, i) => (
						<div
							key={i}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: "8px 0",
								borderBottom: "1px solid rgba(201,168,76,0.06)",
							}}
						>
							<div
								style={{
									width: 20,
									height: 20,
									borderRadius: 4,
									border: `1.5px solid ${item.done ? "var(--gold)" : "rgba(138,155,181,0.3)"}`,
									background: item.done ? "var(--gold)" : "transparent",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								{item.done && (
									<span
										style={{
											color: "var(--navy)",
											fontSize: 12,
											fontWeight: 700,
										}}
									>
										✓
									</span>
								)}
							</div>
							<span
								style={{
									fontSize: 13,
									color: item.done ? "var(--white)" : "var(--muted)",
									textDecoration: item.done ? "line-through" : "",
								}}
							>
								{item.text}
							</span>
						</div>
					))}
				</div>
				<div className="card fade-up-3">
					<div className="section-title" style={{ marginBottom: 12 }}>
						📄 Mes documents
					</div>
					{["Convocation officielle.pdf", "Fiche d'évaluation.pdf"].map(
						(doc, i) => (
							<div
								key={i}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 10,
									padding: "10px 12px",
									borderRadius: 8,
									background: "rgba(13,27,46,0.4)",
									marginBottom: 8,
									cursor: "pointer",
									transition: "var(--transition)",
								}}
							>
								<span style={{ fontSize: 20 }}>📄</span>
								<span style={{ flex: 1, fontSize: 13 }}>{doc}</span>
								<button className="btn btn-ghost btn-sm">↓</button>
							</div>
						),
					)}
				</div>
			</div>
		</div>
	</div>
);

// ─── DASHBOARD: TEACHER ───────────────────────────────────────────────────────
const TeacherDashboard = () => (
	<div>
		<div className="page-title fade-up">Mon espace jury</div>
		<div className="page-subtitle fade-up-1">
			Pr. Karim Fassi — Département Informatique
		</div>

		<div className="stats-grid">
			{[
				{
					icon: "⚖️",
					value: "7",
					label: "Jurys assignés",
					color: "var(--gold)",
				},
				{ icon: "✏️", value: "3", label: "À évaluer", color: "#F08080" },
				{ icon: "✓", value: "4", label: "Évalués", color: "#3CC99A" },
			].map((s, i) => (
				<div key={i} className={`stat-card fade-up-${i}`}>
					<div className="stat-icon">{s.icon}</div>
					<div className="stat-value" style={{ color: s.color }}>
						{s.value}
					</div>
					<div className="stat-label">{s.label}</div>
				</div>
			))}
		</div>

		<div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
			<div className="card fade-up-1">
				<div className="section-title" style={{ marginBottom: 14 }}>
					📅 Mes prochaines séances
				</div>
				{SOUTENANCES.filter((_, i) => i < 4).map((s) => (
					<div key={s.id} className="sout-card">
						<div style={{ textAlign: "center", minWidth: 50 }}>
							<div
								style={{
									fontSize: 10,
									color: "var(--muted)",
									textTransform: "uppercase",
								}}
							>
								Juin
							</div>
							<div
								style={{
									fontFamily: "var(--font-mono)",
									fontSize: 22,
									fontWeight: 700,
									color: "var(--gold)",
								}}
							>
								16
							</div>
							<div
								style={{
									fontFamily: "var(--font-mono)",
									fontSize: 12,
									color: "var(--muted)",
								}}
							>
								{s.time}
							</div>
						</div>
						<div className="sout-info">
							<div className="sout-student">{s.student}</div>
							<div className="sout-project">{s.project}</div>
							<div className="sout-meta">📍 {s.room}</div>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 6,
								alignItems: "flex-end",
							}}
						>
							<span className="badge badge-gold">
								{s.jury[0] === TEACHERS[2].name ? "Président" : "Examinateur"}
							</span>
							{s.status === "confirmed" ? (
								<button className="btn btn-ghost btn-sm">Évaluer</button>
							) : (
								<StatusBadge status={s.status} />
							)}
						</div>
					</div>
				))}
			</div>

			<div>
				<div className="card fade-up-2" style={{ marginBottom: 16 }}>
					<div className="section-title" style={{ marginBottom: 12 }}>
						🕐 Mes indisponibilités
					</div>
					<div
						style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}
					>
						Déclarez vos créneaux indisponibles
					</div>
					{["Lundi 16 — 14h à 16h", "Mercredi 18 — matin"].map((d, i) => (
						<div
							key={i}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
								padding: "8px 12px",
								borderRadius: 8,
								background: "rgba(192,57,43,0.08)",
								border: "1px solid rgba(192,57,43,0.2)",
								marginBottom: 8,
							}}
						>
							<span style={{ color: "#F08080", fontSize: 14 }}>✕</span>
							<span style={{ fontSize: 13, flex: 1 }}>{d}</span>
						</div>
					))}
					<button
						className="btn btn-ghost btn-sm"
						style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
					>
						+ Ajouter
					</button>
				</div>
				<div className="card fade-up-3">
					<div className="section-title" style={{ marginBottom: 12 }}>
						📊 Répartition rôles
					</div>
					{[
						["Président", 3, "var(--gold)"],
						["Rapporteur", 2, "#3CC99A"],
						["Examinateur", 2, "#60B4E8"],
					].map(([r, n, c]) => (
						<div key={r} style={{ marginBottom: 12 }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									fontSize: 12,
									marginBottom: 4,
								}}
							>
								<span style={{ color: "var(--muted)" }}>{r}</span>
								<span style={{ color: c }}>{n}</span>
							</div>
							<div className="progress-bar">
								<div
									className="progress-fill"
									style={{ width: `${(n / 7) * 100}%`, background: c }}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	</div>
);

// ─── DASHBOARD: ADMIN ─────────────────────────────────────────────────────────
const AdminDashboard = () => (
	<div>
		<div className="page-title fade-up">Administration système</div>
		<div className="page-subtitle fade-up-1">
			Vue d'ensemble · FSBM 2025–2026
		</div>

		<div className="stats-grid">
			{[
				{
					icon: "👥",
					value: "312",
					label: "Utilisateurs actifs",
					color: "var(--gold)",
				},
				{
					icon: "🎓",
					value: "248",
					label: "Étudiants inscrits",
					color: "#3CC99A",
				},
				{ icon: "👨‍🏫", value: "42", label: "Enseignants", color: "#60B4E8" },
				{
					icon: "📊",
					value: "99.7%",
					label: "Disponibilité système",
					color: "#3CC99A",
				},
			].map((s, i) => (
				<div key={i} className={`stat-card fade-up-${i}`}>
					<div className="stat-icon">{s.icon}</div>
					<div
						className="stat-value"
						style={{ color: s.color, fontSize: s.value.length > 4 ? 24 : 32 }}
					>
						{s.value}
					</div>
					<div className="stat-label">{s.label}</div>
				</div>
			))}
		</div>

		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
			{/* Users table */}
			<div className="card fade-up-2">
				<div className="section-header">
					<div className="section-title">👥 Utilisateurs récents</div>
					<button className="btn btn-primary btn-sm">＋ Ajouter</button>
				</div>
				<div className="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Nom</th>
								<th>Rôle</th>
								<th>Statut</th>
							</tr>
						</thead>
						<tbody>
							{[
								{ name: "Salma Sammah", role: "Coordinateur", active: true },
								{ name: "Pr. Hamid", role: "Enseignant", active: true },
								{ name: "Amina Benali", role: "Étudiant", active: true },
								{ name: "Dr. Laarbi", role: "Enseignant", active: false },
							].map((u, i) => (
								<tr key={i}>
									<td>
										<div
											style={{ display: "flex", alignItems: "center", gap: 8 }}
										>
											<AvatarEl name={u.name} size={28} />
											{u.name}
										</div>
									</td>
									<td>
										<span className="badge badge-blue">{u.role}</span>
									</td>
									<td>
										<span
											className={`badge ${u.active ? "badge-green" : "badge-gray"}`}
										>
											{u.active ? "Actif" : "Inactif"}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* System health */}
			<div>
				<div className="card fade-up-2" style={{ marginBottom: 16 }}>
					<div className="section-title" style={{ marginBottom: 14 }}>
						🖥 Santé du système
					</div>
					{[
						{ label: "Base de données", value: 99.9, color: "#3CC99A" },
						{ label: "Serveur API", value: 97.2, color: "#3CC99A" },
						{ label: "Stockage docs", value: 68, color: "var(--gold)" },
					].map((s, i) => (
						<div key={i} style={{ marginBottom: 14 }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									fontSize: 13,
									marginBottom: 4,
								}}
							>
								<span style={{ color: "var(--muted)" }}>{s.label}</span>
								<span
									style={{ color: s.color, fontFamily: "var(--font-mono)" }}
								>
									{s.value}%
								</span>
							</div>
							<div className="progress-bar">
								<div
									className="progress-fill"
									style={{ width: `${s.value}%`, background: s.color }}
								/>
							</div>
						</div>
					))}
				</div>
				<div className="card fade-up-3">
					<div className="section-title" style={{ marginBottom: 12 }}>
						📋 Log d'activité
					</div>
					<div className="timeline">
						{[
							{ time: "09:42", text: "Nouvel utilisateur créé: M. Tazi" },
							{ time: "09:15", text: "Export CSV — 47 étudiants" },
							{ time: "08:50", text: "Mise à jour paramètres session" },
							{ time: "08:00", text: "Backup automatique réalisé" },
						].map((t, i) => (
							<div
								key={i}
								className="timeline-item"
								style={{ animationDelay: `${i * 0.1}s` }}
							>
								<div
									className="timeline-dot"
									style={{ background: i === 0 ? "#3CC99A" : "var(--gold)" }}
								/>
								<div className="timeline-time">{t.time}</div>
								<div className="timeline-text">{t.text}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	</div>
);

// ─── PLANNING PAGE ────────────────────────────────────────────────────────────
const SchedulePage = () => {
	const [showModal, setShowModal] = useState(false);
	return (
		<div>
			<div className="page-title fade-up">Planning des soutenances</div>
			<div className="page-subtitle fade-up-1">
				Lundi 16 Juin 2025 · 5 séances planifiées
			</div>

			<div className="section-header fade-up">
				<div style={{ display: "flex", gap: 8 }}>
					{["Jour", "Semaine", "Liste"].map((v) => (
						<button
							key={v}
							className={`btn btn-sm ${v === "Liste" ? "btn-primary" : "btn-ghost"}`}
						>
							{v}
						</button>
					))}
				</div>
				<button className="btn btn-primary" onClick={() => setShowModal(true)}>
					＋ Nouvelle soutenance
				</button>
			</div>

			<div className="card fade-up-1">
				<div className="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Heure</th>
								<th>Étudiant</th>
								<th>Projet</th>
								<th>Salle</th>
								<th>Jury</th>
								<th>Filière</th>
								<th>Statut</th>
							</tr>
						</thead>
						<tbody>
							{SOUTENANCES.map((s) => (
								<tr key={s.id}>
									<td>
										<span
											style={{
												fontFamily: "var(--font-mono)",
												color: "var(--gold)",
											}}
										>
											{s.time}
										</span>
									</td>
									<td>
										<div
											style={{ display: "flex", alignItems: "center", gap: 8 }}
										>
											<AvatarEl name={s.student} size={28} />
											{s.student}
										</div>
									</td>
									<td
										style={{
											maxWidth: 180,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{s.project}
									</td>
									<td>
										<span className="badge badge-blue">📍 {s.room}</span>
									</td>
									<td style={{ fontSize: 12, color: "var(--muted)" }}>
										{s.jury.join(", ")}
									</td>
									<td>
										<span className="badge badge-gray">{s.filiere}</span>
									</td>
									<td>
										<StatusBadge status={s.status} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{showModal && (
				<div className="modal-overlay" onClick={() => setShowModal(false)}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-title">Nouvelle soutenance</div>
						{[
							["Étudiant", "text", "Nom de l'étudiant"],
							["Projet", "text", "Titre du projet"],
							["Salle", "text", "Ex: Salle A1"],
							["Date", "date", ""],
							["Heure", "time", ""],
						].map(([l, t, p]) => (
							<div key={l} className="input-group">
								<label className="input-label">{l}</label>
								<input className="input-field" type={t} placeholder={p} />
							</div>
						))}
						<div style={{ display: "flex", gap: 10, marginTop: 8 }}>
							<button
								className="btn btn-primary"
								style={{ flex: 1, justifyContent: "center" }}
								onClick={() => setShowModal(false)}
							>
								Créer
							</button>
							<button
								className="btn btn-ghost"
								style={{ flex: 1, justifyContent: "center" }}
								onClick={() => setShowModal(false)}
							>
								Annuler
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// ─── STUDENTS PAGE ────────────────────────────────────────────────────────────
const StudentsPage = () => (
	<div>
		<div className="page-title fade-up">Gestion des étudiants</div>
		<div className="page-subtitle fade-up-1">
			{STUDENTS.length} étudiants enregistrés
		</div>
		<div className="section-header fade-up">
			<div className="search-bar" style={{ minWidth: 280 }}>
				<span style={{ fontSize: 13, color: "var(--muted)" }}>🔍</span>
				<input placeholder="Rechercher un étudiant..." />
			</div>
			<div style={{ display: "flex", gap: 8 }}>
				<button className="btn btn-ghost btn-sm">↑ Importer CSV</button>
				<button className="btn btn-primary btn-sm">＋ Ajouter</button>
			</div>
		</div>
		<div className="card fade-up-1">
			<div className="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Étudiant</th>
							<th>CNE</th>
							<th>Filière</th>
							<th>Projet</th>
							<th>Encadrant</th>
							<th>Statut</th>
						</tr>
					</thead>
					<tbody>
						{STUDENTS.map((s) => (
							<tr key={s.id}>
								<td>
									<div
										style={{ display: "flex", alignItems: "center", gap: 10 }}
									>
										<AvatarEl name={s.name} size={30} />
										<span style={{ fontWeight: 500 }}>{s.name}</span>
									</div>
								</td>
								<td>
									<span
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: 12,
											color: "var(--muted)",
										}}
									>
										{s.cne}
									</span>
								</td>
								<td>
									<span className="badge badge-blue">{s.filiere}</span>
								</td>
								<td
									style={{
										maxWidth: 180,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										fontSize: 13,
										color: "rgba(255,255,255,0.7)",
									}}
								>
									{s.project}
								</td>
								<td style={{ fontSize: 13, color: "var(--muted)" }}>
									{s.encadrant}
								</td>
								<td>
									<StatusBadge status={s.status} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	</div>
);

// ─── CONFLICTS PAGE ───────────────────────────────────────────────────────────
const ConflictsPage = () => (
	<div>
		<div className="page-title fade-up">⚠️ Gestion des conflits</div>
		<div className="page-subtitle fade-up-1">
			{CONFLICTS.length} conflits détectés — action requise
		</div>
		{CONFLICTS.map((c, i) => (
			<div
				key={c.id}
				className="card fade-up"
				style={{ marginBottom: 16, borderColor: "rgba(192,57,43,0.3)" }}
			>
				<div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
					<div style={{ fontSize: 28 }}>⚠️</div>
					<div style={{ flex: 1 }}>
						<div
							style={{
								fontFamily: "var(--font-serif)",
								fontSize: 17,
								fontWeight: 700,
								color: "#F08080",
								marginBottom: 6,
							}}
						>
							{c.type}
						</div>
						<div
							style={{
								fontSize: 14,
								color: "rgba(255,255,255,0.8)",
								marginBottom: 12,
							}}
						>
							{c.desc}
						</div>
						<div style={{ display: "flex", gap: 8 }}>
							<button className="btn btn-danger btn-sm">
								Résoudre maintenant
							</button>
							<button className="btn btn-ghost btn-sm">Ignorer</button>
						</div>
					</div>
					<span className="badge badge-red">Critique</span>
				</div>
			</div>
		))}
		<div
			className="card fade-up-2"
			style={{ borderColor: "rgba(30,122,95,0.3)" }}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<span style={{ fontSize: 28 }}>✅</span>
				<div>
					<div style={{ fontWeight: 600, color: "#3CC99A", marginBottom: 2 }}>
						Aucun autre conflit détecté
					</div>
					<div style={{ fontSize: 13, color: "var(--muted)" }}>
						Les 45 autres soutenances sont correctement planifiées
					</div>
				</div>
			</div>
		</div>
	</div>
);

// ─── DOCS PAGE ────────────────────────────────────────────────────────────────
const DocsPage = () => (
	<div>
		<div className="page-title fade-up">Génération de documents</div>
		<div className="page-subtitle fade-up-1">
			Convocations, plannings et procès-verbaux
		</div>
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
				gap: 16,
			}}
		>
			{[
				{
					icon: "📋",
					title: "Convocations étudiants",
					desc: "Générer pour toute la session",
					badge: "47 étudiants",
				},
				{
					icon: "⚖️",
					title: "Convocations jurys",
					desc: "Envoyer aux membres du jury",
					badge: "12 jurys",
				},
				{
					icon: "📅",
					title: "Planning général",
					desc: "Export PDF & impression",
					badge: "PDF / Excel",
				},
				{
					icon: "✏️",
					title: "Fiches d'évaluation",
					desc: "Grilles de notation par jury",
					badge: "47 fiches",
				},
				{
					icon: "📝",
					title: "Procès-verbaux",
					desc: "PV simplifiés de session",
					badge: "Par séance",
				},
				{
					icon: "📊",
					title: "Rapport de synthèse",
					desc: "Résultats et statistiques",
					badge: "Global",
				},
			].map((d, i) => (
				<div
					key={i}
					className={`card fade-up-${i % 4}`}
					style={{ cursor: "pointer", textAlign: "center" }}
				>
					<div style={{ fontSize: 36, marginBottom: 12 }}>{d.icon}</div>
					<div
						style={{
							fontFamily: "var(--font-serif)",
							fontSize: 15,
							fontWeight: 700,
							marginBottom: 6,
						}}
					>
						{d.title}
					</div>
					<div
						style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}
					>
						{d.desc}
					</div>
					<span className="badge badge-gold" style={{ display: "inline-flex" }}>
						{d.badge}
					</span>
					<div className="divider" />
					<button
						className="btn btn-primary btn-sm"
						style={{ width: "100%", justifyContent: "center" }}
					>
						Générer ↓
					</button>
				</div>
			))}
		</div>
	</div>
);

// ─── PAGE ROUTER ─────────────────────────────────────────────────────────────
const pageMap = {
	dashboard: {
		admin: AdminDashboard,
		coordinator: CoordDashboard,
		teacher: TeacherDashboard,
		student: StudentDashboard,
	},
	schedule: SchedulePage,
	students: StudentsPage,
	conflicts: ConflictsPage,
	docs: DocsPage,
};

const pageTitles = {
	dashboard: "Tableau de bord",
	schedule: "Planning",
	students: "Étudiants",
	teachers: "Enseignants",
	rooms: "Salles",
	jury: "Jurys",
	conflicts: "Conflits",
	docs: "Documents",
	eval: "Évaluations",
	users: "Utilisateurs",
	settings: "Paramètres",
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
	const [loggedIn, setLoggedIn] = useState(false);
	const [role, setRole] = useState("coordinator");
	const [activePage, setActivePage] = useState("dashboard");

	const handleLogin = (r) => {
		setRole(r);
		setLoggedIn(true);
		setActivePage("dashboard");
	};
	const handleLogout = () => {
		setLoggedIn(false);
		setActivePage("dashboard");
	};

	const getPage = () => {
		if (activePage === "dashboard") {
			const C = pageMap.dashboard[role] || CoordDashboard;
			return <C setActive={setActivePage} />;
		}
		const C = pageMap[activePage];
		if (C) return <C />;
		return (
			<div style={{ textAlign: "center", padding: "60px 20px" }}>
				<div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
				<div
					style={{
						fontFamily: "var(--font-serif)",
						fontSize: 22,
						marginBottom: 8,
					}}
				>
					Module en développement
				</div>
				<div style={{ color: "var(--muted)" }}>
					Cette section sera disponible prochainement.
				</div>
			</div>
		);
	};

	return (
		<>
			<style>{CSS}</style>
			<div className="grid-bg" />
			<div
				className="glow"
				style={{
					width: 600,
					height: 600,
					background: "var(--slate)",
					top: "-10%",
					right: "-5%",
				}}
			/>
			<div
				className="glow"
				style={{
					width: 400,
					height: 400,
					background: "var(--gold)",
					bottom: "10%",
					left: "-5%",
				}}
			/>

			{!loggedIn ? (
				<LoginPage onLogin={handleLogin} />
			) : (
				<div className="app-layout">
					<Sidebar
						role={role}
						active={activePage}
						setActive={setActivePage}
						onLogout={handleLogout}
					/>
					<div className="main-area">
						<Topbar
							title={pageTitles[activePage] || "SoutenanceHub"}
							role={role}
						/>
						<div className="page-content">{getPage()}</div>
					</div>
				</div>
			)}
		</>
	);
}
