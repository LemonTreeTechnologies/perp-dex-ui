<script lang="ts">
	// Public landing page, shown while APP_MODE is 'landing'. Every status shown here must be
	// true today: XPerp is in development, so nothing below claims live trading, deposits or yields.
	const X_URL = 'https://x.com/xperpfi';
	const GITHUB_URL = 'https://github.com/LemonTreeTechnologies/perp-dex-ui';
	const ENGINE_URL = 'https://postcryptum.io/trust';

	const stats = [
		{ value: '3–5s', label: 'Settlement on XRPL' },
		{ value: '20x', label: 'Max leverage' },
		{ value: '<$0.01', label: 'Fee per transaction' },
		{ value: '0', label: 'Bridges' }
	];

	const vaults = [
		{
			name: 'Market Making Vault',
			status: 'Demoed',
			risk: 'Lower risk',
			riskClass: 'risk-low',
			desc: 'Quotes both sides of the order book at a spread from mid price, earning the spread and fee rebates on filled orders.',
			features: [
				'Automated market making',
				'Dynamic spread management',
				'Fee rebates on filled orders',
				'Risk-controlled delta exposure'
			]
		},
		{
			name: 'Delta Neutral Vault',
			status: 'Planned',
			risk: 'Medium risk',
			riskClass: 'risk-medium',
			desc: 'Holds a delta-neutral position and earns from spreads and funding rates, with little exposure to the price of XRP.',
			features: [
				'Delta-neutral positioning',
				'Funding rate capture',
				'Automated rebalancing',
				'Spread optimization'
			]
		},
		{
			name: 'Delta One Vault',
			status: 'Planned',
			risk: 'Higher risk',
			riskClass: 'risk-high',
			desc: 'Captures the gap between RLUSD borrowing rates and perpetual funding: borrows RLUSD, buys spot XRP and shorts the perpetual.',
			features: [
				'Leveraged rate strategy',
				'Interest rate arbitrage',
				'Automated position management',
				'Delta-one exposure'
			]
		}
	];

	const flow = [
		{ icon: '👤', title: 'Your Wallet', sub: 'Crossmark / GemWallet', tone: '' },
		{ icon: '⚙️', title: 'XPerp Engine', sub: 'Order book + matching', tone: 'accent' },
		{ icon: '🔐', title: 'Hardware Enclaves', sub: 'Margin and keys in hardware', tone: 'green' },
		{ icon: '✕', title: 'XRP Ledger', sub: 'Native XRP settlement', tone: 'accent' }
	];
	const links = ['sign & trade', 'attested', '2-of-3 multisig'];

	const features = [
		{
			title: 'Non-Custodial',
			text: 'Funds stay in an XRP Ledger escrow controlled by a 2-of-3 multisig. No single operator can move them.',
			tag: ''
		},
		{
			title: 'Settled on the Ledger',
			text: 'Every trade settles on the XRP Ledger itself in 3–5 seconds, not on a sidechain or an IOU.',
			tag: ''
		},
		{
			title: 'Low Fees',
			text: 'Transaction costs under $0.01 make active trading on the ledger practical.',
			tag: ''
		},
		{
			title: '20x Leverage',
			text: 'Long or short XRP with up to 20x leverage, margined inside the enclaves.',
			tag: 'Planned'
		},
		{
			title: 'Liquidity Vaults',
			text: 'Built-in vaults are designed to supply the order book from the first trade.',
			tag: ''
		},
		{
			title: 'Verifiable Security',
			text: 'Remote attestation will let anyone check the exact code running inside the enclaves.',
			tag: ''
		}
	];
</script>

<svelte:head>
	<title>XPerp — Perpetual Futures on XRPL</title>
	<meta
		name="description"
		content="The first perpetual futures exchange on the XRP Ledger: native XRP settlement, margin engine in hardware enclaves, no bridges. In development."
	/>
</svelte:head>

<div class="xp">
	<header>
		<div class="header-inner container">
			<a class="brand" href="/">
				<img src="/xperp-logo.png" alt="" width="36" height="36" />
				<span class="brand-name"><em>X</em>Perp</span>
			</a>
			<nav>
				<a href="#vaults">Vaults</a>
				<a href="#how">How It Works</a>
				<a href={ENGINE_URL} target="_blank" rel="noopener">Engine</a>
				<a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>
			</nav>
			<a class="btn btn-ghost btn-sm" href={X_URL} target="_blank" rel="noopener">Follow on X</a>
		</div>
	</header>

	<div class="hero">
		<div class="hero-bg"></div>
		<div class="hero-overlay"></div>
		<div class="container">
			<div class="hero-content">
				<div class="status-pill">
					<span class="status-dot"></span> In development · Demoed live on XRPL mainnet, April 2026
				</div>
				<h1>Perpetual Futures on <span class="glow">XRPL</span></h1>
				<p>
					Up to 20x leverage on XRP, settled on the XRP Ledger itself. Margin engine in hardware
					enclaves, funds in a multisig escrow. No bridges. No CEX. No compromise.
				</p>
				<div class="hero-ctas">
					<a href="#how" class="btn btn-primary">See How It Works</a>
					<a href={X_URL} target="_blank" rel="noopener" class="btn btn-ghost">Follow the Build</a>
				</div>
			</div>
		</div>
	</div>

	<div class="stats">
		<div class="container">
			<div class="stats-grid">
				{#each stats as s (s.label)}
					<div class="stat">
						<div class="stat-value">{s.value}</div>
						<div class="stat-label">{s.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<section class="vaults" id="vaults">
		<div class="container">
			<div class="section-head">
				<div class="section-kicker">Liquidity Vaults</div>
				<h2>Liquidity Built Into the Exchange</h2>
				<p>
					Vaults place orders on the book and receive fee rebates on filled orders, so there is
					liquidity from the first trade. They settle through the same escrow as every position.
				</p>
			</div>

			<div class="vaults-grid">
				{#each vaults as v (v.name)}
					<div class="vault-card" class:demoed={v.status === 'Demoed'}>
						<span class="vault-badge" class:demoed={v.status === 'Demoed'}>{v.status}</span>
						<div class="vault-name">{v.name}</div>
						<span class="risk-tag {v.riskClass}">{v.risk}</span>
						<p class="vault-desc">{v.desc}</p>
						<ul class="vault-features">
							{#each v.features as f (f)}
								<li>{f}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section id="how">
		<div class="container">
			<div class="section-head">
				<div class="section-kicker">Architecture</div>
				<h2>How It Works</h2>
				<p>
					Non-custodial by design: funds stay in an XRP Ledger escrow signed by a 2-of-3 multisig of
					hardware enclaves, and the account's master key is disabled.
				</p>
			</div>

			<div class="flow">
				{#each flow as node, i (node.title)}
					<div class="flow-node {node.tone}">
						<div class="icon">{node.icon}</div>
						<div class="title">{node.title}</div>
						<div class="sub">{node.sub}</div>
					</div>
					{#if i < links.length}
						<div class="flow-link">
							<div class="line"></div>
							<div class="label">{links[i]}</div>
						</div>
					{/if}
				{/each}
			</div>

			<a class="engine" href={ENGINE_URL} target="_blank" rel="noopener">
				<span class="engine-kicker">Engine</span>
				<span class="engine-text">
					XPerp runs on <strong>TRUST</strong>, the settlement engine by PostCryptum Research: no
					admin key, and even a code upgrade needs consensus among the machines.
				</span>
				<span class="engine-link">About TRUST →</span>
			</a>
		</div>
	</section>

	<section class="features">
		<div class="container">
			<div class="section-head">
				<div class="section-kicker">Why XPerp</div>
				<h2>The First Perp DEX on the XRP Ledger</h2>
			</div>

			<div class="features-grid">
				{#each features as f (f.title)}
					<div class="feature-card">
						<div class="feature-head">
							<h3>{f.title}</h3>
							{#if f.tag}<span class="soon-tag">{f.tag}</span>{/if}
						</div>
						<p>{f.text}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="cta-banner">
		<div class="container">
			<h2>Built in the Open, Settled on the Ledger</h2>
			<p>XPerp is in development and relaunches on mainnet when it is ready. Stay tuned.</p>
			<div class="hero-ctas center">
				<a href={X_URL} target="_blank" rel="noopener" class="btn btn-primary">Follow on X</a>
				<a href={GITHUB_URL} target="_blank" rel="noopener" class="btn btn-ghost">View on GitHub</a>
			</div>
		</div>
	</section>

	<footer>
		<div class="footer-inner container">
			<div>
				© 2026 XPerp · Built on the XRP Ledger · Engine:
				<a class="footer-engine" href={ENGINE_URL} target="_blank" rel="noopener"
					>TRUST by PostCryptum Research</a
				>
			</div>
			<div class="footer-links">
				<a href={X_URL} target="_blank" rel="noopener">X</a>
				<a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>
				<a href="#how">About</a>
			</div>
		</div>
	</footer>
</div>

<style>
	.xp {
		--bg: #05070b;
		--bg-2: #0a0e14;
		--surface: #10151d;
		--border: #1e2836;
		--accent: #00aae4;
		--accent-soft: rgba(0, 170, 228, 0.12);
		--text: #f2f6fa;
		--text-2: #9aa7b5;
		--text-3: #6b7887;
		--green: #34d399;
		--yellow: #fbbf24;
		--red: #f87171;
		min-height: 100vh;
		background: var(--bg);
		color: var(--text);
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
	}
	:global(html) {
		scroll-behavior: smooth;
	}
	a {
		color: inherit;
		text-decoration: none;
	}
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	/* Header */
	header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: rgba(5, 7, 11, 0.8);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border-bottom: 1px solid var(--border);
	}
	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 68px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.brand img {
		height: 36px;
		width: 36px;
		border-radius: 8px;
	}
	.brand-name {
		font-size: 20px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.brand-name em {
		font-style: normal;
		color: var(--accent);
	}
	nav {
		display: flex;
		align-items: center;
		gap: 28px;
	}
	nav a {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-2);
		transition: color 0.2s;
	}
	nav a:hover {
		color: var(--text);
	}
	.soon-tag {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 2px 7px;
		line-height: 1.4;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
		border-radius: 10px;
		padding: 10px 22px;
		border: 1px solid transparent;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-primary {
		background: var(--accent);
		color: #03131b;
	}
	.btn-primary:hover {
		background: #1cbdf5;
		box-shadow: 0 0 24px rgba(0, 170, 228, 0.35);
	}
	.btn-ghost {
		background: transparent;
		color: var(--text);
		border-color: var(--border);
	}
	.btn-ghost:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.btn-sm {
		padding: 8px 16px;
		font-size: 13px;
	}

	/* Hero */
	.hero {
		position: relative;
		min-height: 560px;
		display: flex;
		align-items: center;
		overflow: hidden;
		border-bottom: 1px solid var(--border);
	}
	.hero-bg {
		position: absolute;
		inset: 0;
		background: url('/landing-hero.jpg') right center / cover no-repeat;
	}
	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			var(--bg) 8%,
			rgba(5, 7, 11, 0.88) 38%,
			rgba(5, 7, 11, 0.35) 70%,
			rgba(5, 7, 11, 0.55) 100%
		);
	}
	.hero .container {
		width: 100%;
	}
	.hero-content {
		position: relative;
		z-index: 1;
		padding: 96px 0;
		max-width: 640px;
	}
	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		border: 1px solid rgba(0, 170, 228, 0.4);
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 13px;
		font-weight: 600;
		border-radius: 999px;
		padding: 7px 16px;
		margin-bottom: 28px;
		max-width: 100%;
	}
	.status-dot {
		flex: none;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--accent);
		animation: pulse 2s infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}
	.hero h1 {
		font-size: clamp(40px, 6vw, 64px);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
		margin-bottom: 20px;
	}
	.hero h1 .glow {
		color: var(--accent);
		text-shadow: 0 0 32px rgba(0, 170, 228, 0.5);
	}
	.hero p {
		font-size: 19px;
		color: var(--text-2);
		max-width: 540px;
		margin-bottom: 36px;
	}
	.hero-ctas {
		display: flex;
		gap: 14px;
		flex-wrap: wrap;
	}
	.hero-ctas.center {
		justify-content: center;
	}
	.hero-ctas .btn {
		padding: 14px 28px;
		font-size: 15px;
	}

	/* Stats */
	.stats {
		border-bottom: 1px solid var(--border);
		background: var(--bg-2);
	}
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		padding: 40px 0;
	}
	.stat {
		text-align: center;
	}
	.stat + .stat {
		border-left: 1px solid var(--border);
	}
	.stat-value {
		font-size: 34px;
		font-weight: 800;
		color: var(--accent);
		letter-spacing: -0.02em;
	}
	.stat-label {
		font-size: 13px;
		color: var(--text-2);
		margin-top: 4px;
	}

	/* Sections */
	section {
		padding: 96px 0;
	}
	.section-head {
		text-align: center;
		max-width: 680px;
		margin: 0 auto 56px;
	}
	.section-kicker {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
		margin-bottom: 14px;
	}
	.section-head h2 {
		font-size: clamp(30px, 4vw, 42px);
		font-weight: 800;
		letter-spacing: -0.02em;
		margin-bottom: 14px;
	}
	.section-head p {
		font-size: 17px;
		color: var(--text-2);
	}

	/* Vaults */
	.vaults {
		background: var(--bg-2);
		border-bottom: 1px solid var(--border);
	}
	.vaults-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		align-items: stretch;
	}
	.vault-card {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 28px;
		display: flex;
		flex-direction: column;
		transition:
			transform 0.25s,
			border-color 0.25s,
			box-shadow 0.25s;
	}
	.vault-card:hover {
		transform: translateY(-4px);
		border-color: rgba(0, 170, 228, 0.45);
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
	}
	.vault-card.demoed {
		border-color: rgba(52, 211, 153, 0.35);
	}
	.vault-badge {
		position: absolute;
		top: 20px;
		right: 20px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		border-radius: 999px;
		padding: 5px 12px;
		color: var(--accent);
		background: var(--accent-soft);
		border: 1px solid rgba(0, 170, 228, 0.3);
	}
	.vault-badge.demoed {
		color: var(--green);
		background: rgba(52, 211, 153, 0.12);
		border-color: rgba(52, 211, 153, 0.35);
	}
	.vault-name {
		font-size: 21px;
		font-weight: 700;
		letter-spacing: -0.01em;
		margin-bottom: 10px;
		padding-right: 90px;
	}
	.risk-tag {
		align-self: flex-start;
		font-size: 11px;
		font-weight: 600;
		border-radius: 6px;
		padding: 3px 10px;
		margin-bottom: 16px;
	}
	.risk-low {
		color: var(--green);
		background: rgba(52, 211, 153, 0.1);
		border: 1px solid rgba(52, 211, 153, 0.25);
	}
	.risk-medium {
		color: var(--yellow);
		background: rgba(251, 191, 36, 0.1);
		border: 1px solid rgba(251, 191, 36, 0.25);
	}
	.risk-high {
		color: var(--red);
		background: rgba(248, 113, 113, 0.1);
		border: 1px solid rgba(248, 113, 113, 0.25);
	}
	.vault-desc {
		font-size: 14px;
		color: var(--text-2);
		margin-bottom: 22px;
	}
	.vault-features {
		flex: 1;
		border-top: 1px solid var(--border);
		padding-top: 16px;
	}
	.vault-features li {
		list-style: none;
		font-size: 13px;
		color: var(--text-2);
		padding: 4px 0 4px 24px;
		position: relative;
	}
	.vault-features li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: var(--accent);
		font-weight: 700;
	}

	/* How it works */
	.flow {
		display: flex;
		align-items: stretch;
		justify-content: center;
		flex-wrap: wrap;
	}
	.flow-node {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 22px 26px;
		text-align: center;
		min-width: 170px;
		flex: 1;
		max-width: 220px;
	}
	.flow-node .icon {
		font-size: 26px;
		margin-bottom: 8px;
	}
	.flow-node .title {
		font-size: 15px;
		font-weight: 700;
	}
	.flow-node .sub {
		font-size: 12px;
		color: var(--text-3);
		margin-top: 4px;
	}
	.flow-node.accent {
		border-color: rgba(0, 170, 228, 0.35);
	}
	.flow-node.accent .title {
		color: var(--accent);
	}
	.flow-node.green {
		border-color: rgba(52, 211, 153, 0.3);
	}
	.flow-node.green .title {
		color: var(--green);
	}
	.flow-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 10px;
		min-width: 70px;
	}
	.flow-link .line {
		width: 100%;
		height: 2px;
		background: var(--accent);
		opacity: 0.6;
	}
	.flow-link .label {
		font-size: 11px;
		color: var(--text-3);
		margin-top: 6px;
		white-space: nowrap;
	}
	.engine {
		display: flex;
		align-items: center;
		gap: 20px;
		max-width: 920px;
		margin: 48px auto 0;
		padding: 20px 26px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		transition: border-color 0.2s;
	}
	.engine:hover {
		border-color: rgba(0, 170, 228, 0.45);
	}
	.engine-kicker {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.engine-text {
		flex: 1;
		font-size: 14px;
		color: var(--text-2);
	}
	.engine-text strong {
		color: var(--text);
	}
	.engine-link {
		font-size: 14px;
		font-weight: 600;
		color: var(--accent);
		white-space: nowrap;
	}

	/* Features */
	.features {
		background: var(--bg-2);
		border-top: 1px solid var(--border);
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
	.feature-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 26px;
		transition: border-color 0.2s;
	}
	.feature-card:hover {
		border-color: rgba(0, 170, 228, 0.4);
	}
	.feature-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}
	.feature-card h3 {
		font-size: 17px;
		font-weight: 700;
	}
	.feature-card p {
		font-size: 14px;
		color: var(--text-2);
	}

	/* CTA */
	.cta-banner {
		border-top: 1px solid var(--border);
		background:
			radial-gradient(600px 240px at 50% 0%, rgba(0, 170, 228, 0.14), transparent 70%), var(--bg);
		text-align: center;
	}
	.cta-banner h2 {
		font-size: clamp(28px, 4vw, 38px);
		font-weight: 800;
		letter-spacing: -0.02em;
		margin-bottom: 14px;
	}
	.cta-banner p {
		color: var(--text-2);
		font-size: 17px;
		margin-bottom: 32px;
	}

	/* Footer */
	footer {
		border-top: 1px solid var(--border);
		padding: 40px 0;
	}
	.footer-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		font-size: 13px;
		color: var(--text-3);
	}
	.footer-engine {
		color: var(--text-2);
	}
	.footer-engine:hover,
	.footer-links a:hover {
		color: var(--accent);
	}
	.footer-links {
		display: flex;
		gap: 24px;
	}
	.footer-links a {
		color: var(--text-2);
		transition: color 0.2s;
	}

	/* Responsive */
	@media (max-width: 960px) {
		nav {
			display: none;
		}
		.vaults-grid {
			grid-template-columns: 1fr;
		}
		.features-grid {
			grid-template-columns: 1fr 1fr;
		}
		.stats-grid {
			grid-template-columns: 1fr 1fr;
			row-gap: 28px;
		}
		.stat:nth-child(3) {
			border-left: none;
		}
		.flow {
			flex-direction: column;
			align-items: center;
		}
		/* On narrow screens the chain runs top to bottom: a short vertical line with its label beside it. */
		.flow-link {
			flex-direction: row;
			gap: 10px;
			padding: 8px 0;
			min-width: 0;
		}
		.flow-link .line {
			width: 2px;
			height: 26px;
		}
		.flow-link .label {
			margin-top: 0;
		}
		.flow-node {
			max-width: 320px;
			width: 100%;
		}
		.engine {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}
	}
	@media (max-width: 560px) {
		.features-grid {
			grid-template-columns: 1fr;
		}
		.status-pill {
			border-radius: 14px;
		}
		.hero-content {
			padding: 72px 0;
		}
	}
</style>
