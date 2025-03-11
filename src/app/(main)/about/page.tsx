export default function Page() {
	const team = [
		{ name: "Rachala Ovin", role: "Lead Developer", img: "https://via.placeholder.com/150" },
		{ name: "Stephani", role: "Backend Assistant", img: "https://via.placeholder.com/150" },
		{
			name: "Kirushnabalan Vijaybalan ",
			role: "Backend Specialist",
			img: "https://via.placeholder.com/150",
		},
		{
			name: "Lihini Nayanathara",
			role: "Frontend Assistant",
			img: "https://via.placeholder.com/150",
		},
		{
			name: "Fathima Fayaza",
			role: "Backend Assistant",
			img: "https://via.placeholder.com/150",
		},
		{
			name: "Sheruka Fernando",
			role: "Marketing Lead",
			img: "https://via.placeholder.com/150",
		},
	];

	return (
		<div className="min-h-screen bg-background p-6 text-sm text-foreground">
			<header className="mb-8 text-center">
				<h1 className="text-4xl font-bold text-primary">About TrueLens</h1>
				<p className="mt-1 text-lg text-secondary">
					Understanding the problem, our solution, and why we stand out.
				</p>
			</header>

			{/* Problem, Solution, Why Us - Three-column Layout */}
			<section className="mx-auto mb-12 grid max-w-6xl grid-cols-1 gap-6 text-center md:grid-cols-3">
				<div className="bg-card flex h-64 flex-col justify-center rounded-lg p-6 shadow-md">
					<h2 className="mb-2 text-2xl font-semibold text-primary">The Problem</h2>
					<p className="text-muted-foreground">
						Misinformation and bias in news reporting make it difficult for readers to
						get an objective view of current events.
					</p>
				</div>
				<div className="bg-card flex h-64 flex-col justify-center rounded-lg p-6 shadow-md">
					<h2 className="mb-2 text-2xl font-semibold text-primary">Our Solution</h2>
					<p className="text-muted-foreground">
						TrueLens uses AI to analyze and highlight biases in news articles, providing
						readers with a more balanced perspective.
					</p>
				</div>
				<div className="bg-card flex h-64 flex-col justify-center rounded-lg p-6 shadow-md">
					<h2 className="mb-2 text-2xl font-semibold text-primary">
						Why Choose TrueLens?
					</h2>
					<ul className="list-inside list-disc text-left text-muted-foreground">
						<li>AI-driven bias detection</li>
						<li>Comprehensive news analysis</li>
						<li>Transparency and credibility</li>
						<li>User-friendly experience</li>
					</ul>
				</div>
			</section>

			{/* Team Section */}
			<section className="mb-12 text-center">
				<h2 className="mb-4 text-2xl font-semibold text-primary">Meet Our Team</h2>
				<div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					{team.map((member, index) => (
						<div
							key={index}
							className="bg-card h-80 rounded-lg p-4 text-base shadow-lg"
						>
							<img
								src={member.img}
								alt={member.name}
								className="mx-auto mb-3 h-20 w-20 rounded-full border-4 border-border"
							/>
							<h3 className="text-card-foreground text-lg font-bold">
								{member.name}
							</h3>
							<p className="text-sm text-secondary-foreground">{member.role}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
