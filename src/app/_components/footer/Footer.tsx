import { Mail, Instagram, X } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-100 border-t border-gray-300 px-10 py-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start">
                {/* Logo */}
                <div className="text-2xl font-semibold">
                    True<span className="underline decoration-red-600">Lens</span>
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-10 text-sm text-gray-700">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Quick Links</h3>
                        <ul className="space-y-1">
                            <li><a href="#" className="hover:underline">About</a></li>
                            <li><a href="#" className="hover:underline">Mission</a></li>
                            <li><a href="#" className="hover:underline">Pricing</a></li>
                            <li><a href="#" className="hover:underline">FAQs</a></li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h3 className="invisible">Placeholder</h3> {/* Invisible header for alignment */}
                        <ul className="space-y-1">
                            <li><a href="#" className="hover:underline">Methodology</a></li>
                        </ul>
                    </div>
                </div>

                {/* Contact Us */}
                <div className="space-y-2 text-sm text-gray-700">
                    <h3 className="font-semibold">Contact Us</h3>
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a href="mailto:truelens@gmail.com" className="hover:underline">
                            truelens@gmail.com
                        </a>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="#" className="hover:text-gray-900">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="#" className="hover:text-gray-900">
                            <X className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
