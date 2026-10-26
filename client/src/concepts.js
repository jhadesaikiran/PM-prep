// Cheatsheet content for the Concepts page. Each concept is a card on /concepts
// and a page at /concepts/:id. Sections render in order; a section has either
// `points` (a bullet list) or `rows` (a two-column label → detail table).
export const CONCEPTS = [
  {
    id: 'clarifying-questions',
    name: 'Clarifying questions',
    description: 'Scope the problem before solving it. 1–2 minutes, 3–5 questions.',
    sections: [
      {
        title: 'How to ask',
        points: [
          'Restate the prompt in one line to confirm you heard it right.',
          'Ask 3–5 questions, grouped, not a rapid-fire list.',
          'Say why each one matters: "Asking because it changes who we build for."',
          'If told "you decide", state an assumption and move on: "I\'ll assume X because Y."',
          'Close with a scope summary: "So: X users, Y goal, Z constraint. OK to proceed?"',
        ],
      },
      {
        title: '5W1H checklist',
        rows: [
          ['Who', 'Which user or segment? Buyer vs. user?'],
          ['What', 'Define the product, feature or metric exactly.'],
          ['Why', 'Business goal: growth, engagement, revenue, retention?'],
          ['Where', 'Market, geography, platform (web, iOS, Android)?'],
          ['When', 'Timeline or time frame of the change?'],
          ['How', 'Constraints (budget, team, tech) and how success is measured?'],
        ],
      },
      {
        title: 'By question type',
        rows: [
          ['Product design', 'User · goal · platform · constraints · new product or existing?'],
          ['Metric drop (RCA)', 'Metric definition · how much, since when · sudden or gradual · which segment, region, platform · any launch, bug, or seasonality?'],
          ['Metrics / success', 'Product goal · stage of product · which user action signals value?'],
          ['Strategy', 'Company goal · time horizon · build, buy, or partner allowed?'],
          ['Estimation', 'Unit definition · geography · time period · precision needed?'],
        ],
      },
      {
        title: 'Frameworks that start with it',
        rows: [
          ['CIRCLES', 'C = Comprehend the situation: what, who, why, how, constraints.'],
          ['RCA', 'Clarify metric → rule out data issues → internal vs. external → segment.'],
          ['CAT / GAME', 'Context/Goal first: pin the objective before users or solutions.'],
        ],
      },
      {
        title: 'Avoid',
        points: [
          'Asking what you could reasonably assume.',
          'More than ~5 questions, or yes/no questions that teach you nothing.',
          'Jumping to solutions inside the question.',
          'Forgetting to use the answers later in your response.',
        ],
      },
    ],
  },
  {
    id: 'segments-pains-metrics',
    name: 'Segments, pains and metrics by domain',
    description: 'Got a fintech (or any) question? Users, pains and metrics for 13 domains, one line each.',
    sections: [
      {
        title: 'Fintech / Payments',
        rows: [
          ['Users', 'Everyday payers · kirana and online merchants · borrowers with thin credit files · finance teams · banks and lenders (supply).'],
          ['Pains', 'Failed or pending payments, slow refunds · scams and fake screenshots · cluttered apps pushing loans · merchant settlement delays · hard-to-reach support.'],
          ['North Star', 'Successful transactions per active user per week (merchant side: payment volume per active merchant).'],
          ['Track', 'Payment success rate · weekly transacting users · merchant actives · cross-sell (credit, insurance) per user.'],
          ['Guardrails', 'Fraud loss rate · downtime · complaint resolution time · regulatory caps (e.g. NPCI 30%).'],
          ['Examples', 'PhonePe, Google Pay, Paytm, Razorpay, WhatsApp Pay.'],
        ],
      },
      {
        title: 'Investments',
        rows: [
          ['Users', 'First-time investors · active traders · long-term / affluent investors · algo developers · fund managers and brokers (supply).'],
          ['Pains', 'Jargon and fear of losing money · outages at market open · hidden fees and mis-selling · scattered holdings · slow dispute support.'],
          ['North Star', 'Monthly active investors who invest or trade and stay 12+ months.'],
          ['Track', 'Activation (first SIP or trade) · orders per active user · net inflows / assets held · SIP continuation.'],
          ['Guardrails', 'Retail F&O loss rate · order latency and outages · complaints per lakh clients · mis-selling.'],
          ['Examples', 'Groww, Zerodha, smallcase.'],
        ],
      },
      {
        title: 'Food delivery',
        rows: [
          ['Users', 'Urban regulars · budget eaters / Tier-2 · restaurants · delivery partners · advertisers.'],
          ['Pains', 'Fees stacked at checkout · app prices above menu · late or cold food · slow refunds for missing items · restaurants squeezed by commissions and forced discounts.'],
          ['North Star', 'Weekly orders delivered on time and as ordered.'],
          ['Track', 'Order frequency per user · on-time rate · checkout conversion · membership (Gold / One) adoption.'],
          ['Guardrails', 'Restaurant churn · rider earnings per hour · cancellations · contribution margin per order.'],
          ['Examples', 'Zomato, Swiggy, Dunzo (collapse case study).'],
        ],
      },
      {
        title: 'Grocery / quick commerce',
        rows: [
          ['Users', 'Urgent top-up shoppers · monthly stock-up families · impulse / gifting buyers · brands and advertisers · delivery partners.'],
          ['Pains', 'Stock-outs and substitutions · small-cart and surge fees · inconsistent fresh quality · delivery slips in rain and peaks · slow refunds.'],
          ['North Star', 'Weekly ordering households with contribution-positive baskets.'],
          ['Track', 'Orders per household · average order value · fill rate · delivery time vs. promise.'],
          ['Guardrails', 'Wastage · rider safety incidents · fee complaints · contribution margin.'],
          ['Examples', 'Swiggy Instamart, Zepto, BigBasket, Amazon Fresh / Now (rival: Blinkit).'],
        ],
      },
      {
        title: 'Ride sharing',
        rows: [
          ['Users', 'Daily commuters · budget riders · drivers and fleet owners · business travellers · regulators.'],
          ['Pains', 'Driver cancellations · unpredictable surge fares · AC / cash disputes · long pickup waits · drivers squeezed by commission and low volume.'],
          ['North Star', 'Completed trips per week.'],
          ['Track', 'Pickup ETA · rider cancellation and driver acceptance rates · active drivers at peak · repeat riders.'],
          ['Guardrails', 'Safety incidents · driver earnings per hour · fare complaints.'],
          ['Examples', 'Uber, Ola (rival: Rapido).'],
        ],
      },
      {
        title: 'E-commerce',
        rows: [
          ['Users', 'Value shoppers (incl. Bharat, cash on delivery) · metro power users · sellers and brands · advertisers · delivery workforce.'],
          ['Pains', 'Fake or poor-quality items · size and fit mismatch · slow returns and refunds · surprise fees · best price hard to find.'],
          ['North Star', 'Monthly buyers completing a delivered, kept (not returned) order.'],
          ['Track', 'Search-to-purchase conversion · repeat purchase rate · delivery promise met · membership (Prime / Plus) engagement.'],
          ['Guardrails', 'Return / RTO rate · counterfeit complaints · ad load in search · margin per order.'],
          ['Examples', 'Amazon, Flipkart, Myntra.'],
        ],
      },
      {
        title: 'Social media',
        rows: [
          ['Users', 'Gen Z / young adults · creators · advertisers and SMBs · community admins · teens and parents.'],
          ['Pains', 'Feed full of strangers, not friends · heavy ads · unpredictable reach for creators · spam, bots and scams · teen safety and screen-time worries.'],
          ['North Star', 'Daily users who post, reply or share with friends.'],
          ['Track', 'DAU/MAU · shares and DMs per user · creator posting rate · time on recommended content.'],
          ['Guardrails', 'Harmful content and teen safety reports · spam / bot share · notification opt-outs.'],
          ['Examples', 'Instagram, Threads, Facebook, X, Snapchat.'],
        ],
      },
      {
        title: 'Super app',
        rows: [
          ['Users', 'Consumers juggling many apps · merchants · mini-app developers / brands · advertisers.'],
          ['Pains', 'Bloated app, services buried in menus · trust when one app holds money and chats · low-quality mini-apps · notification overload.'],
          ['North Star', 'Weekly users using 2+ services (chat plus pay, or pay plus another service).'],
          ['Track', 'Services per user · payment transactions per user · mini-app opens · merchant actives.'],
          ['Guardrails', 'Core app speed and crash rate · privacy trust · ad / offer fatigue.'],
          ['Examples', 'WeChat, Paytm.'],
        ],
      },
      {
        title: 'Cloud computing',
        rows: [
          ['Users', 'Enterprises migrating legacy IT · startups / digital natives · AI labs and builders · regulated / public sector · partners and ISVs.'],
          ['Pains', 'Unpredictable bills · too many overlapping services · GPU / capacity waitlists · data residency rules · egress fees and lock-in.'],
          ['North Star', 'Consumed compute (or revenue) from active production workloads.'],
          ['Track', 'Time to first production workload · services per customer · committed spend / backlog · AI inference volume.'],
          ['Guardrails', 'Uptime vs. SLA · security incidents · bill-shock complaints · net revenue retention.'],
          ['Examples', 'AWS, Google Cloud, Microsoft Azure.'],
        ],
      },
      {
        title: 'OTT / streaming video',
        rows: [
          ['Users', 'Binge viewers · price-sensitive households · live sports fans · families on one account · advertisers.'],
          ['Pains', 'Choice paralysis on the home screen · repeated price hikes · content split across many apps · ads added to paid plans · device and sharing limits.'],
          ['North Star', 'Weekly hours watched per paying household.'],
          ['Track', 'Time to first play · titles started vs. finished · ad-tier reach · retention after a tentpole (e.g. IPL) ends.'],
          ['Guardrails', 'Churn after price changes · content cost per hour viewed · piracy share.'],
          ['Examples', 'Netflix, Prime Video, JioHotstar.'],
        ],
      },
      {
        title: 'Messaging / communication',
        rows: [
          ['Users', 'Everyday chatters · small businesses · enterprises sending alerts · channel creators · advertisers.'],
          ['Pains', 'Spam and marketing overload · scams and misinformation in groups · privacy (phone number, encryption) · cluttered inbox or updates tab.'],
          ['North Star', 'Daily users sending at least one message (business: conversations resolved or converted).'],
          ['Track', 'Messages and calls per user · group and channel engagement · business conversation volume.'],
          ['Guardrails', 'Spam / scam reports · delivery latency · encryption and privacy incidents.'],
          ['Examples', 'WhatsApp, Messenger, Telegram, Gmail.'],
        ],
      },
      {
        title: 'Ad-supported media (video, music, live)',
        rows: [
          ['Users', 'Free viewers / listeners · paid subscribers · creators and artists · advertisers · rights holders.'],
          ['Pains', 'Too many or unskippable ads · repetitive, low-quality feeds · creators struggle to be discovered and paid · premium price hikes.'],
          ['North Star', 'Daily engaged watch or listen time per user.'],
          ['Track', 'Free-to-paid conversion · sessions per user · creator uploads and earnings · ad revenue per user.'],
          ['Guardrails', 'Ad load vs. session length · policy violations · creator churn · royalty or content cost.'],
          ['Examples', 'YouTube, Spotify, Twitch, Moj.'],
        ],
      },
      {
        title: 'Gaming (real-money and casual)',
        rows: [
          ['Users', 'Casual players · sports fans playing fantasy · spenders (whales) · game developers · advertisers.'],
          ['Pains', 'Paywalled difficulty spikes · frequent ads in short sessions · fairness doubts (bots) · blocked withdrawals · India 2025 ban removed cash stakes.'],
          ['North Star', 'Daily active players completing a session (fantasy: fans engaged per match day).'],
          ['Track', 'D1 / D7 / D30 retention · sessions per day · payer conversion · social play with friends.'],
          ['Guardrails', 'Responsible-play limits and legal compliance · ad fatigue · refund and complaint rates.'],
          ['Examples', 'Dream11, WinZO, Zynga.'],
        ],
      },
      {
        title: 'Any other domain (fallback)',
        rows: [
          ['Users', '6 archetypes: Beginner · Busy · Budget · Elderly/low-tech · Power user · Groups. Marketplace: name every side.'],
          ['Pains', 'Confusion · Cost · Time · Access · Trust/risk · Emotional.'],
          ['Metrics', 'North Star = the goal as one number · 1–2 inputs (HEART) · 1 guardrail (cost, trust, reliability, other segment, support).'],
          ['Say it', '"Solving [pain] for [segment] with [solution], measured by [North Star], without hurting [guardrail]."'],
        ],
      },
    ],
  },
];
