import React from "react";

const Page = () => {
    return (
        <div className="bg-background text-foreground p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
            <p className="mb-4">
                Welcome to TrueLens. Your privacy is important to us. This Privacy Policy
                explains how we collect, use, and protect your information when you use
                our services.
            </p>
            <h2 className="text-1xl font-semibold mt-4 mb-2">Information We Collect</h2>
            <p className="mb-4">
                We may collect personal information, such as your name, email address,
                and usage data, to improve our services.
            </p>
            <h2 className="text-1xl font-semibold mt-4 mb-2">How We Use Your Information</h2>
            <p className="mb-4">
                The information we collect is used to provide, maintain, and improve our
                services. We do not share your personal data with third parties except
                as required by law.
            </p>
            <h2 className="text-1xl font-semibold mt-4 mb-2">Security</h2>
            <p className="mb-4">
                We take appropriate measures to protect your data from unauthorized
                access, alteration, or destruction.
            </p>
            <h2 className="text-1xl font-semibold mt-4 mb-2">Changes to This Policy</h2>
            <p className="mb-4">
                We may update this Privacy Policy from time to time. Please review it
                periodically for changes.
            </p>
            <h2 className="text-1xl font-semibold mt-4 mb-2">Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us
                at support@truelens.com.
            </p>
        </div>
    );
};

export default Page;
