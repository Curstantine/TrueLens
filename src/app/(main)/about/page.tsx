export default function Page() {
    const team = [
        { name: "Rachala Ovin", role: "Lead Developer", img: "https://via.placeholder.com/150" },
        { name: "Stephani", role: "Backend Assistant", img: "https://via.placeholder.com/150" },
        { name: "Kirushnabalan Vijaybalan ", role: "Backend Specialist", img: "https://via.placeholder.com/150" },
        { name: "Lihini Nayanathara", role: "Frontend Assistant", img: "https://via.placeholder.com/150" },
        { name: "Fathima Fayaza", role: "Backend Assistant", img: "https://via.placeholder.com/150" },
        { name: "Sheruka Fernando", role: "Marketing Lead", img: "https://via.placeholder.com/150" }
    ];

    return (
        <div className="bg-background text-foreground p-6 min-h-screen text-sm">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-primary">About TrueLens</h1>
                <p className="text-lg text-secondary mt-1">Understanding the problem, our solution, and why we stand out.</p>
            </header>

            {/* Problem, Solution, Why Us - Three-column Layout */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 text-center">
                <div className="bg-card p-6 shadow-md rounded-lg h-64 flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold text-primary mb-2">The Problem</h2>
                    <p className="text-muted-foreground">Misinformation and bias in news reporting make it difficult for readers to get an objective view of current events.</p>
                </div>
                <div className="bg-card p-6 shadow-md rounded-lg h-64 flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold text-primary mb-2">Our Solution</h2>
                    <p className="text-muted-foreground">TrueLens uses AI to analyze and highlight biases in news articles, providing readers with a more balanced perspective.</p>
                </div>
                <div className="bg-card p-6 shadow-md rounded-lg h-64 flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold text-primary mb-2">Why Choose TrueLens?</h2>
                    <ul className="text-muted-foreground text-left list-disc list-inside">
                        <li>AI-driven bias detection</li>
                        <li>Comprehensive news analysis</li>
                        <li>Transparency and credibility</li>
                        <li>User-friendly experience</li>
                    </ul>
                </div>
            </section>

            {/* Team Section */}
            <section className="mb-12 text-center">
                <h2 className="text-2xl font-semibold text-primary mb-4">Meet Our Team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {team.map((member, index) => (
                        <div key={index} className="bg-card p-4 h-80 shadow-lg rounded-lg text-base">
                            <img src={member.img} alt={member.name} className="w-20 h-20 mx-auto rounded-full mb-3 border-4 border-border" />
                            <h3 className="text-lg font-bold text-card-foreground">{member.name}</h3>
                            <p className="text-secondary-foreground text-sm">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

