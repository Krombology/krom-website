#!/usr/bin/env python3
"""Generate the Krom site: index.html plus one page per industry.

Edit the SECTORS data or the templates below, then run:  python3 build.py
Output is plain static HTML, committed alongside this script.
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).parent
CAL = "https://calendly.com/dane-krom/30min"
MAIL = '<a class="js-mail" data-u="dane" data-d="krom.systems" href="#contact">dane [at] krom.systems</a>'

# Line-art motifs, drawn with pathLength=1 so CSS can animate the stroke.
MOTIF = {
    "medical": "M0 34 H34 L42 14 L52 52 L60 24 L67 34 H120",
    "law": "M18 54 H102 M24 48 H96 M30 48 V24 M48 48 V24 M72 48 V24 M90 48 V24 M22 24 H98 L60 6 Z",
    "engineering": "M10 52 H110 M10 52 V8 M10 42 L38 30 L62 36 L90 14 L110 20 M30 52 V47 M50 52 V47 M70 52 V47 M90 52 V47",
    "finance": "M10 52 H110 M20 52 V38 M38 52 V28 M56 52 V32 M74 52 V20 M92 52 V10 M14 30 L40 22 L58 26 L80 12 L100 6",
    "startups": "M10 52 H32 V40 H54 V28 H76 V16 H108 M100 8 L108 16 L100 24",
    "small-business": "M14 24 H106 L98 8 H22 Z M14 24 Q24 34 34 24 Q44 34 54 24 Q64 34 74 24 Q84 34 94 24 Q100 32 106 24 M22 30 V54 H98 V30 M50 54 V38 H70 V54",
    "enterprise": "M60 6 L104 22 L60 38 L16 22 Z M16 32 L60 48 L104 32 M16 42 L60 58 L104 42",
}

SECTORS = [
    dict(slug="medical", name="Medical & Dental", wide=True,
         hook="Patient data locked down, front desk still flying.",
         title="Patient data locked down.<br>Your front desk still flying.",
         intro="HIPAA expects encryption, access controls, audit trails, and backups you can prove. I set them up on the Microsoft 365 or Google account you already have, so your staff keep working the way they do now.",
         outcomes=[("PHI stays where it belongs", "Rules catch patient records before they leave by email, file share, or chat."),
                   ("Encrypted email, no extra steps", "Sensitive messages encrypt themselves. Nobody has to remember a button."),
                   ("Backups you have actually restored", "Charts, imaging, and email backed up offsite and tested on a calendar."),
                   ("Paperwork that survives an audit", "Every safeguard written down in plain English, ready for your insurer.")],
         stat="HiTrust", proof="Took a healthcare company through HiTrust certification as the infrastructure owner."),
    dict(slug="law", name="Law Firms",
         hook="Confidentiality built into the systems.",
         title="Client confidentiality,<br>built into the systems.",
         intro="Your clients trust you with their worst days. Your email, files, and devices should be as careful as you are, without slowing anyone down on a filing deadline.",
         outcomes=[("Legal hold in minutes", "Preserve a mailbox or a matter the moment you need to, with nothing lost."),
                   ("Matter files for the matter team", "Only the people on a case can open its folder. Everyone else never sees it."),
                   ("Sign in from trusted devices only", "A stolen password alone gets nobody into your firm."),
                   ("Email nobody can fake", "Your domain locked down so scammers cannot send wire instructions as you.")],
         stat="0 findings", proof="Moved regulated law and healthcare firms to Microsoft 365 without a single audit finding."),
    dict(slug="engineering", name="Engineering Firms",
         hook="One office or a hundred, it just works.",
         title="One office or a hundred.<br>The network just works.",
         intro="Big drawings, many sites, and acquisitions that arrive with their own server closet. I turn that into one estate that is fast everywhere and easy to run.",
         outcomes=[("Servers out of the closet", "Physical servers moved to Azure, the old hardware retired, the rack bill gone."),
                   ("Big files, fast at every site", "Networks and file shares built so a drawing opens as fast in the field as at HQ."),
                   ("Acquisitions working on day one", "New teams on your email and logins the day the deal closes."),
                   ("Every laptop managed", "Windows and Mac set up out of the box, patched, and encrypted.")],
         stat="100+ offices", proof="Re-networked over 100 offices for a national engineering firm, 30 percent faster afterwards."),
    dict(slug="finance", name="Publishing & Finance",
         hook="Deadlines and audits do not wait for IT.",
         title="Deadlines and audits<br>do not wait for IT.",
         intro="Press dates, quarter ends, and auditors with questions. I keep the systems underneath steady and the evidence ready, so IT is never the reason something slips.",
         outcomes=[("Files people can actually find", "Shared drives organised once, with permissions that match the org chart."),
                   ("Access reviews auditors accept", "Who can see what, written down and checked on a schedule."),
                   ("Problems caught before Monday", "Servers, backups, and certificates watched around the clock."),
                   ("Licences that match headcount", "Seats nobody uses get cancelled before renewal locks them in.")],
         stat="9 years", proof="Served as the IT department for publishers, financial firms, and public-sector clients."),
    dict(slug="startups", name="Startups",
         hook="Set up right on day one, never redone.",
         title="Set up right on day one,<br>so you never redo it.",
         intro="Most startups rebuild their IT at fifty people because nobody set it up properly at five. A few days now saves a painful migration later.",
         outcomes=[("Email and domain done properly", "Google or Microsoft set up with the security settings switched on."),
                   ("Laptops ready out of the box", "New hires open the lid, sign in, and everything installs itself."),
                   ("Answers for security questionnaires", "The controls enterprise customers ask about, already in place."),
                   ("Costs that grow with you", "Pay for the seats you have, with room to scale without a rebuild.")],
         stat="Day one", proof="The same standards I use for thousand-person estates, sized for a team of five."),
    dict(slug="small-business", name="Family & Main Street",
         hook="Big-company protection, small-business bill.",
         title="Big-company protection.<br>Small-business bill.",
         intro="You should not need an IT department to be safe from scams, ransomware, and lost files. You need one person who knows your shop and picks up the phone.",
         outcomes=[("One person to call", "Not a ticket queue. Someone who knows your setup by name."),
                   ("Backups for what you cannot lose", "Books, customer records, and email copied offsite every night."),
                   ("Scam emails stopped", "Fake invoices and phishing caught before they reach your inbox."),
                   ("Only pay for what you use", "Subscriptions sized to the people who actually work there.")],
         stat="Right-sized", proof="Cleaned up a 32-person company after a plan change had doubled its monthly bill."),
    dict(slug="enterprise", name="Enterprise",
         hook="Multi-tier estates, verified end to end.",
         title="Multi-tier estates,<br>verified end to end.",
         intro="Migrations, identity, Azure, and the licence clean-up nobody finishes. Run by someone who has been on call for the environment, not just consulted on it.",
         outcomes=[("Migrations checked file by file", "Source and destination compared independently, gaps fixed before anything is switched off."),
                   ("Zero Trust identity", "Single sign-on, Conditional Access, and access that follows the org chart."),
                   ("Licence spend cut", "Usage measured from the vendor's own logs, seats removed in waves with notice."),
                   ("Runbooks your team keeps", "Everything documented so it runs without me.")],
         stat="$100k+", proof="Cut a year of licence spend by over $100,000 for one client in 2026."),
]

PILLARS = [
    ("Data protection", "Built-in rules for patient, card, and ID numbers, plus encrypted email.",
     "Protection across email, files, and chat, with retention and legal hold.",
     "HIPAA, HiTrust, and SOC 2 controls mapped to real settings, evidence per audit."),
    ("Backup & recovery", "Cloud email and files backed up offsite, restore tested quarterly.",
     "Daily, ransomware-proof backups for servers and cloud, tested twice a year.",
     "Recovery targets per system, cross-region copies, signed DR exercises."),
    ("Identity & access", "MFA on every account and a password manager for the office.",
     "Trusted-device sign-in, managed laptops, leavers locked out same day.",
     "Zero Trust design, privileged access, single sign-on across every app."),
    ("Support", "A few hours a month and one person who knows you by name.",
     "Monitoring, patching, onboarding, and offboarding on a retainer.",
     "Projects per workstream and a fractional IT lead in between."),
]


# List price per user per month, USD, annual commitment. Monthly/flexible billing
# is roughly 20% more on both Google and Microsoft, handled by the billing toggle.
# Visitors can overwrite any price, so these are starting points, not quotes.
PLANS = [
    ("Google Workspace", [("gws-starter", "Business Starter", 7), ("gws-standard", "Business Standard", 14),
                          ("gws-plus", "Business Plus", 22), ("gws-ent", "Enterprise (enter your price)", 0)]),
    ("Microsoft 365", [("m365-basic", "Business Basic", 7), ("m365-standard", "Business Standard", 14),
                       ("m365-premium", "Business Premium", 22), ("o365-e3", "Office 365 E3", 26),
                       ("m365-e3", "Microsoft 365 E3", 39), ("m365-e5", "Microsoft 365 E5", 60)]),
    ("Add-ons", [("copilot", "Microsoft 365 Copilot", 30), ("pbi-pro", "Power BI Pro", 14),
                 ("pbi-ppu", "Power BI Premium Per User", 24)]),
    ("Other", [("other", "Something else (enter your price)", 0)]),
]


def plan_options(selected="m365-standard"):
    out = []
    for group, items in PLANS:
        pre = group + " " if group in ("Google Workspace", "Microsoft 365") else ""
        opts = "".join(f'<option value="{k}" data-price="{p}"{" selected" if k == selected else ""}>{"" if n.startswith(("Microsoft", "Office")) else pre}{n}</option>' for k, n, p in items)
        out.append(f'<optgroup label="{group}">{opts}</optgroup>')
    return "".join(out)


def calc_row(selected="m365-standard", seats=50, price=14):
    return f"""<div class="calc-row">
            <label class="cr-plan"><span>Licence</span><select name="plan">{plan_options(selected)}</select></label>
            <label class="cr-seats"><span>Seats</span><input type="number" name="seats" inputmode="numeric" min="1" max="100000" step="1" value="{seats}"></label>
            <label class="cr-price"><span>$ / seat / mo</span><input type="number" name="price" inputmode="decimal" min="0" max="1000" step="0.01" value="{price}"></label>
            <button type="button" class="cr-del" aria-label="Remove this licence"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          </div>"""


# Hero status cards. Each card cycles through these faces.
METRICS = [  # (label, status, status class, big number, caption, ring colour)
    ("Nightly backup", "Verified", "ok", "100%", "Restore tested this week", "ok"),
    ("Laptops patched", "Done", "ok", "48/48", "Updated overnight, not during clinic hours", "ok"),
    ("MFA coverage", "Enforced", "ok", "100%", "Every account, the owner's too", "ok"),
    ("Licence review", "Saved", "bad", "$4,320", "A year in idle seats cancelled", "coral"),
]
FEED = [  # (tag, message, blocked?)
    ("DLP", "Patient chart held from personal Gmail", True),
    ("Phishing", "Fake invoice quarantined before the inbox", True),
    ("Device", "Lost laptop wiped remotely", False),
    ("Access", "Leaver locked out at 5:01 pm", False),
    ("Email", "Spoofed mail from your domain rejected", True),
    ("Backup", "Ransomware-hit folder restored in 4 min", False),
    ("DLP", "Card number stopped in a Teams chat", True),
]
LISTS = [  # (title, count, rows of (item, status, ok?))
    ("Sign-ins today", "3", [("Front desk", "MFA", True), ("Partner laptop", "Managed", True), ("Unknown country", "Blocked", False)]),
    ("Devices", "24", [("Reception PC", "Encrypted", True), ("Exam room iPad", "Managed", True), ("Old file server", "Retired", True)]),
    ("Expiring soon", "3", [("Website certificate", "Renewed", True), ("Domain name", "Auto-renew", True), ("Firewall licence", "30 days", False)]),
    ("People changes", "3", [("New hire, Monday", "Ready", True), ("Leaver, today", "Removed", True), ("Shared inbox", "Owner set", True)]),
]
PILLS = ["Patches up to date", "Certificate valid, 364 days", "Backups offsite", "Spam filter tuned"]


def stage_cards():
    def faces(items):
        return "".join(f'<div class="face{" is-on" if i == 0 else ""}">{x}</div>' for i, x in enumerate(items))
    m = faces(f"""<div class="hc-head"><span>{a}</span><span class="{c}">{b}</span></div>
          <div class="ring-row"><svg class="ring ring-{col}" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="ring-bg"/><circle cx="32" cy="32" r="26" class="ring-fg" pathLength="100"/></svg>
          <div><b class="ring-n">{n}</b><span>{cap}</span></div></div>""" for a, b, c, n, cap, col in METRICS)
    f = "".join(f'<li class="{"blk" if b else "fix"}"><span><small class="tag">{t}</small>{msg}</span></li>' for t, msg, b in FEED)
    l = faces(f"""<div class="hc-head"><span>{t}</span><span>{n}</span></div>
          <ul class="sign-list">{"".join(f'<li><span>{a}</span><em class="{"ok" if ok else "bad"}">{b}</em></li>' for a, b, ok in rows)}</ul>""" for t, n, rows in LISTS)
    p = faces(f'<span class="pill"><i></i>{x}</span>' for x in PILLS)
    return f"""      <div class="layer" style="--z:1.2"><div class="hcard hc-backup" data-cycle>{m}</div></div>

      <div class="layer" style="--z:2"><div class="hcard hc-dlp">
        <div class="hc-head"><span>Security feed</span><span class="live"><i></i>Live</span></div>
        <ul class="dlp-feed" aria-live="off">{f}</ul>
      </div></div>

      <div class="layer" style="--z:.8"><div class="hcard hc-sign" data-cycle>{l}</div></div>

      <div class="layer" style="--z:2.4"><div class="pill-stack" data-cycle>{p}</div></div>"""


def motif(slug, cls="motif"):
    return (f'<svg class="{cls}" viewBox="0 0 120 60" aria-hidden="true">'
            f'<path d="{MOTIF[slug]}" pathLength="1"/></svg>')


def head(title, desc, depth=""):
    return f"""<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
<meta name="theme-color" content="#F7F5F0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src https://formspree.io; form-action https://formspree.io; base-uri 'self'; object-src 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="progress" aria-hidden="true"></div>
<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <div class="wrap nav-row">
    <a class="brand" href="index.html" aria-label="Krom Technology Systems, home">
      <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 4h6v10.5L21 4h8L17.5 15.5 30 28h-8L10 16v12H4z"/></svg>
      <span class="brand-name">Krom<span class="brand-sub">Technology Systems</span></span>
    </a>
    <nav class="nav-links" aria-label="Main">
      <a href="index.html#industries">Industries</a>
      <a href="index.html#coverage">Coverage</a>
      <a href="index.html#savings">Savings</a>
      <a href="index.html#contact">Contact</a>
      <a class="btn btn-primary btn-small" href="{CAL}" target="_blank" rel="noopener">Book a call</a>
    </nav>
  </div>
</header>
<main id="main">
"""


FOOT = f"""</main>
<footer class="footer">
  <div class="wrap footer-row">
    <span class="brand-name">Krom<span class="brand-sub">Technology Systems</span></span>
    <p>Morristown, New Jersey. Remote everywhere, on site across NY and NJ.</p>
    <p>{MAIL} &nbsp;&copy; <span data-year>2026</span> Krom Technology Systems LLC</p>
  </div>
</footer>
<script src="main.js"></script>
</body>
</html>
"""


def tiles():
    out = []
    for i, s in enumerate(SECTORS):
        wide = " tile-wide" if s.get("wide") else ""
        out.append(f"""      <a class="tile{wide}" href="{s['slug']}.html" style="view-transition-name: sector-{s['slug']}" data-reveal>
        {motif(s['slug'])}
        <span class="tile-text">
          <span class="tile-name">{s['name']}</span>
          <span class="tile-hook">{s['hook']}</span>
        </span>
        <span class="tile-go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>""")
    return "\n".join(out)


def pillars():
    out = []
    for i, (name, *tiers) in enumerate(PILLARS, 1):
        ps = "".join(f'<p data-t="{t}">{txt}</p>' for t, txt in zip(("small", "growing", "enterprise"), tiers))
        out.append(f"""        <article class="pillar" style="--d:{(i-1)*80}ms">
          <span class="pillar-n">0{i}</span>
          <h3>{name}</h3>
          <span class="meter" aria-hidden="true"><i></i><i></i><i></i></span>
          {ps}
        </article>""")
    return "\n".join(out)


def options():
    return "".join(f'<option value="{s["slug"]}">{s["name"]}</option>' for s in SECTORS)


def index():
    return head("Krom Technology Systems | Enterprise-grade IT, sized to your budget",
                "Infrastructure, backups, security, and data loss prevention on Microsoft 365 and Google Workspace for medical and dental practices, law firms, engineering firms, startups, and growing businesses.") + f"""
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow"><span class="dot"></span>Infrastructure, backups, security, DLP</p>
      <h1><span class="sr">Enterprise-grade IT, sized to your budget.</span><span aria-hidden="true">Enterprise&#8209;grade IT, <span class="accent">sized to your <span class="rotator">budget.</span><svg class="squiggle" viewBox="0 0 340 14" preserveAspectRatio="none" aria-hidden="true"><path d="M2 10 C 60 2, 120 14, 180 7 S 290 3, 338 9" pathLength="1"/></svg></span></span></h1>
      <p class="lede">One senior engineer for practices, firms, startups, and the shop on Main Street. Microsoft 365 or Google, set up properly, backed up for real, and locked down.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="{CAL}" target="_blank" rel="noopener">Book a free 30 minute call</a>
        <a class="btn btn-ghost" href="#industries">Find your industry</a>
      </div>
      <p class="trust-label">Recent results for real clients</p>
      <ul class="trust">
        <li><b data-count="95" data-prefix="$" data-suffix="k">$95k</b> a year back in one client's budget</li>
        <li><b data-count="77" data-suffix="%">77%</b> fewer paid seats, zero files lost</li>
        <li><b>Zero</b> downtime moving 150 people to Microsoft 365</li>
      </ul>
    </div>

    <div class="stage" aria-label="Example of what Krom watches for a client">
      <svg class="wires" viewBox="0 0 560 470" preserveAspectRatio="none" aria-hidden="true">
        <path d="M150 140 C 220 200, 300 170, 400 230"/>
        <path d="M420 300 C 380 360, 330 360, 250 400"/>
        <path d="M260 90 C 330 60, 380 70, 450 70"/>
        <path d="M120 150 C 60 260, 80 330, 150 380"/>
      </svg>
{stage_cards()}
    </div>
  </div>
</section>

<section class="section-tight" id="savings">
  <div class="wrap">
    <div class="calc" data-reveal>
      <div class="calc-copy">
        <p class="eyebrow"><span class="dot"></span>Quick check</p>
        <h2>What are you paying for that <span class="accent">nobody uses?</span></h2>
        <p>Pick your licences, type your seat counts, and see what idle seats cost you. In two licence audits I ran in 2026, 55% and 77% of paid seats turned out to be unused.</p>
      </div>
      <form class="calc-ui" novalidate>
        <div class="calc-rows">
          {calc_row()}
        </div>
        <template id="calc-row-tpl">{calc_row("gws-standard", 25, 14)}</template>
        <button type="button" class="calc-add"><span aria-hidden="true">+</span> Add another licence</button>
        <div class="calc-opts">
          <div class="seg" role="group" aria-label="Billing">
            <button type="button" aria-pressed="true" data-bill="1">Annual</button>
            <button type="button" aria-pressed="false" data-bill="1.2">Monthly / flexible</button>
          </div>
          <label class="calc-unused"><span>Seats nobody really uses</span>
            <span class="unused-ctl"><input type="range" name="unused" min="0" max="90" step="1" value="20" aria-label="Unused percent, slider"><input type="number" name="unused-n" min="0" max="90" step="1" value="20" aria-label="Unused percent"><b>%</b></span>
          </label>
        </div>
        <div class="calc-out" aria-live="polite">
          <span class="calc-n">$1,680</span>
          <span class="calc-l">a year on seats nobody uses, out of <b class="calc-total">$8,400</b> a year in total.</span>
        </div>
        <a class="btn btn-primary" href="#contact">Find my real number</a>
        <p class="calc-fine">Prices are US list prices with annual commitment. Change any number to match your invoice.</p>
      </form>
    </div>
  </div>
</section>

<section class="section" id="industries">
  <div class="wrap">
    <div class="section-head split" data-reveal>
      <h2>Pick your <span class="accent">world.</span></h2>
      <p>Same engineer, same standards. What changes is what matters most to your kind of business.</p>
    </div>
    <div class="bento">
{tiles()}
    </div>
  </div>
</section>

<section class="section band" id="coverage">
  <div class="wrap coverage">
    <div class="coverage-head" data-reveal>
      <h2>Same standards.<br><span class="accent">Different price tag.</span></h2>
      <p>Every business needs the same four things. Size decides how far each one goes. Pick yours.</p>
      <div class="sizer" role="group" aria-label="Business size">
        <button type="button" aria-pressed="true" data-tier="small">Small<span>1 to 25</span></button>
        <button type="button" aria-pressed="false" data-tier="growing">Growing<span>25 to 250</span></button>
        <button type="button" aria-pressed="false" data-tier="enterprise">Enterprise<span>250+</span></button>
      </div>
    </div>
    <div class="pillars" data-show="small" data-reveal>
{pillars()}
    </div>
  </div>
</section>

<section class="section band-soft" id="contact">
  <div class="wrap contact">
    <div class="about" data-reveal>
      <span class="mono">DB</span>
      <h2>Hi, I'm Dane.</h2>
      <p>Thirteen years running IT for clinics, law firms, publishers, an engineering firm with over 100 offices, and a healthcare company I took through HiTrust. I have been the person who gets the call on Monday morning, so everything I build is meant to stay working after I leave.</p>
      <ul class="facts">
        <li>Morristown, NJ</li><li>Microsoft 365 &amp; Google</li><li>No licence resale, ever</li>
      </ul>
    </div>
    <form class="form" action="https://formspree.io/f/mkjrryqa" method="POST" novalidate data-reveal>
      <h3>Tell me what you need</h3>
      <div class="field-row">
        <label>Name<input type="text" name="name" autocomplete="name" maxlength="100" required></label>
        <label>Email<input type="email" name="email" autocomplete="email" maxlength="254" required></label>
      </div>
      <div class="field-row">
        <label>Industry
          <select name="industry" required><option value="" selected disabled>Choose one</option>{options()}<option value="other">Something else</option></select>
        </label>
        <label>Team size
          <select name="size" required><option value="" selected disabled>Choose one</option><option>1 to 10</option><option>10 to 50</option><option>50 to 250</option><option>250 to 1,000</option><option>1,000+</option></select>
        </label>
      </div>
      <label>What is going on<textarea name="message" rows="4" maxlength="2000" placeholder="What you run now, what worries you, any dates that matter."></textarea></label>
      <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Send</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </div>
      <p class="form-alt">Or email {MAIL}</p>
    </form>
  </div>
</section>
""" + FOOT


def sector_page(s):
    others = "".join(f'<a class="chip" href="{o["slug"]}.html">{o["name"]}</a>' for o in SECTORS if o is not s)
    outs = "".join(f"""
      <li data-reveal><span class="out-n">0{i}</span><h3>{t}</h3><p>{d}</p></li>""" for i, (t, d) in enumerate(s["outcomes"], 1))
    return head(f"{s['name'].replace('&', 'and')} IT | Krom Technology Systems",
                f"{s['hook']} IT, security, and backups for {s['name'].lower().replace('&', 'and')}.") + f"""
<section class="sector-top">
  <div class="wrap">
    <a class="back" href="index.html#industries"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>All industries</a>
    <div class="sector-card" style="view-transition-name: sector-{s['slug']}">
      {motif(s['slug'], 'motif motif-big')}
      <p class="eyebrow"><span class="dot"></span>{s['name']}</p>
      <h1>{s['title']}</h1>
      <p class="lede">{s['intro']}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="{CAL}" target="_blank" rel="noopener">Book a free 30 minute call</a>
        <a class="btn btn-ghost" href="index.html?industry={s['slug']}#contact">Send a message</a>
      </div>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2 class="small-h" data-reveal>What you get</h2>
    <ol class="outcomes">{outs}
    </ol>
    <div class="proof" data-reveal>
      <span class="proof-stat">{s['stat']}</span>
      <p>{s['proof']}</p>
      <a class="link" href="index.html#coverage">See what it looks like at your size <span aria-hidden="true">&rarr;</span></a>
    </div>
    <nav class="others" aria-label="Other industries" data-reveal>
      <span>Other industries</span>{others}
    </nav>
  </div>
</section>
""" + FOOT


if __name__ == "__main__":
    (ROOT / "index.html").write_text(index())
    for s in SECTORS:
        (ROOT / f"{s['slug']}.html").write_text(sector_page(s))
    print("built index.html +", len(SECTORS), "sector pages")
