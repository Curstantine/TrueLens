import { EMAIL } from "~/constants";

export default function Page() {
	return (
		<div className="container max-w-prose bg-background p-6 text-foreground">
			<h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
			<ul className="text-sm text-muted-foreground">
				<li>Effective Date: March 10, 2025</li>
				<li>Last Updated: March 10, 2025</li>
			</ul>

			<section className="mt-6">
				<h2 className="text-xl font-semibold">TL;DR Summary</h2>

				<ul className="[&_strong]:font-medium">
					<li>
						<strong>What we collect:</strong> Username, email, and Stripe ID (for paid
						users only).
					</li>
					<li>
						<strong>How we use it:</strong> To provide and manage our TrueLens service.
					</li>

					<li>
						<strong>Sharing:</strong> We do not sell or share your data with anyone.
					</li>

					<li>
						<strong>Other uses:</strong> We do not use your data in other services or
						for unrelated purposes.
					</li>
				</ul>
			</section>

			<section className="mt-6 [&_h3]:font-medium">
				<h2 className="text-xl font-semibold">Full Privacy Policy</h2>
				<p>
					At TrueLens, we are committed to protecting your privacy. This Privacy Policy
					outlines how we collect, use, and safeguard your personal information when you
					use our service.
				</p>

				<div role="presentation" className="mt-4">
					<h3>1. Information We Collect</h3>
					<p>
						We collect only the following information: Your username and email address,
						provided when you sign up. Your Stripe ID, if you subscribe to our paid
						service.
					</p>
				</div>

				<div role="presentation" className="mt-4">
					<h3>2. How We Use Your Information</h3>
					<p>
						We use your information solely to: Create and manage your TrueLens account.
						Process payments for paid subscriptions via Stripe. Communicate with you
						about your account or our service.
					</p>
				</div>

				<div role="presentation" className="mt-4">
					<h3>3. Data Sharing and Disclosure</h3>
					<p>
						We do not sell, trade, or share your personal information with any third
						parties, except as required to process payments through Stripe. Your data is
						not used in any other services or for any purposes beyond operating
						TrueLens.
					</p>
				</div>

				<div role="presentation" className="mt-4">
					<h3>4. Data Security</h3>
					<p>
						We implement reasonable technical and organizational measures to protect
						your information from unauthorized access, loss, or misuse. However, no
						system is entirely secure, and we cannot guarantee absolute security.
					</p>
				</div>

				<div role="presentation" className="mt-4">
					<h3>5. Your Rights</h3>
					<p>
						You may request access to, correction of, or deletion of your personal
						information by contacting us at{" "}
						<a href={EMAIL} className="underline">
							{EMAIL}
						</a>
						. We will respond promptly in accordance with applicable laws.
					</p>
				</div>

				<div role="presentation" className="mt-4">
					<h3>6. Changes to This Policy</h3>
					<p>
						We may update this Privacy Policy from time to time. Any changes will be
						posted here with an updated effective date. Your continued use of TrueLens
						after such changes constitutes acceptance of the revised policy.
					</p>
				</div>

				<div role="presentation" className="mt-4">
					<h3>7. Contact Us</h3>
					<p>
						If you have questions about this Privacy Policy, please contact us at{" "}
						<a href={EMAIL} className="underline">
							{EMAIL}
						</a>
						.
					</p>
				</div>
			</section>
		</div>
	);
}
