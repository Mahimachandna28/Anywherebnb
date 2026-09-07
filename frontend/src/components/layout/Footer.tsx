import { Globe, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-airbnb-lightGray border-t border-airbnb-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          {/* Support */}
          <div>
            <h3 className="font-semibold text-airbnb-dark mb-3">Support</h3>
            <ul className="space-y-2.5 text-airbnb-gray">
              <li><span className="hover:underline cursor-pointer">Help Center</span></li>
              <li><span className="hover:underline cursor-pointer">AirCover</span></li>
              <li><span className="hover:underline cursor-pointer">Anti-discrimination</span></li>
              <li><span className="hover:underline cursor-pointer">Disability support</span></li>
              <li><span className="hover:underline cursor-pointer">Cancellation options</span></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold text-airbnb-dark mb-3">Hosting</h3>
            <ul className="space-y-2.5 text-airbnb-gray">
              <li><span className="hover:underline cursor-pointer">Airbnb your home</span></li>
              <li><span className="hover:underline cursor-pointer">AirCover for Hosts</span></li>
              <li><span className="hover:underline cursor-pointer">Hosting resources</span></li>
              <li><span className="hover:underline cursor-pointer">Community forum</span></li>
              <li><span className="hover:underline cursor-pointer">Hosting responsibly</span></li>
            </ul>
          </div>

          {/* Airbnb */}
          <div>
            <h3 className="font-semibold text-airbnb-dark mb-3">Anywherebnb</h3>
            <ul className="space-y-2.5 text-airbnb-gray">
              <li><span className="hover:underline cursor-pointer">Newsroom</span></li>
              <li><span className="hover:underline cursor-pointer">New features</span></li>
              <li><span className="hover:underline cursor-pointer">Careers</span></li>
              <li><span className="hover:underline cursor-pointer">Investors</span></li>
              <li><span className="hover:underline cursor-pointer">Gift cards</span></li>
            </ul>
          </div>

          {/* SDE Assignment Info */}
          <div>
            <h3 className="font-semibold text-airbnb-dark mb-3">About Clone</h3>
            <p className="text-xs text-airbnb-gray leading-relaxed mb-3">
              Fullstack Airbnb marketplace clone built for SDE Fullstack Assignment evaluation.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-airbnb-dark font-medium">
              <span>Next.js 14</span>
              <span>·</span>
              <span>FastAPI</span>
              <span>·</span>
              <span>SQLite</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-airbnb-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-airbnb-gray">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© 2026 Anywherebnb, Inc.</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-airbnb-dark">
            <button className="flex items-center gap-2 hover:underline">
              <Globe className="h-4 w-4" />
              <span>English (IN)</span>
            </button>
            <button className="hover:underline">
              <span>₹ INR</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
