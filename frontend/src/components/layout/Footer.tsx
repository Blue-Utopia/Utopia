import Link from 'next/link';
import { FaGithub, FaTwitter, FaDiscord, FaTelegram } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">About</h3>
            <p className="text-gray-400 text-sm">
              A decentralized freelance marketplace powered by blockchain technology.
              Work freely, get paid instantly.
            </p>
          </div>

          {/* For Freelancers */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Freelancers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-gray-400 hover:text-white">
                  Find Work
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/skills" className="text-gray-400 hover:text-white">
                  Skill Tests
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-gray-400 hover:text-white">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Clients</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/post-job" className="text-gray-400 hover:text-white">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/browse-talent" className="text-gray-400 hover:text-white">
                  Browse Talent
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="text-gray-400 hover:text-white">
                  Enterprise
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <FaGithub className="text-2xl" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <FaTwitter className="text-2xl" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <FaDiscord className="text-2xl" />
            </a>
            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <FaTelegram className="text-2xl" />
            </a>
          </div>
          <div className="text-gray-400 text-sm">
            © 2024 Decentralized Freelance Marketplace. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

