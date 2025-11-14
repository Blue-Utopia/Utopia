'use client';

import Link from 'next/link';
import { FaRocket, FaShieldAlt, FaCoins, FaBolt } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Decentralized Freelance Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Work freely. Get paid instantly. No middlemen. Pure crypto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/jobs"
                className="btn btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Find Work
              </Link>
              <Link
                href="/post-job"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg"
              >
                Hire Talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-100 p-4 rounded-full">
                  <FaShieldAlt className="text-4xl text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Trustless Escrow</h3>
              <p className="text-gray-600">
                Smart contract escrow ensures secure payments. No disputes, no delays.
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-secondary-100 p-4 rounded-full">
                  <FaCoins className="text-4xl text-secondary-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Crypto Payments</h3>
              <p className="text-gray-600">
                Get paid in USDC, USDT, or ETH. Instant withdrawals, global reach.
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <FaRocket className="text-4xl text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">No KYC Required</h3>
              <p className="text-gray-600">
                Start working immediately. Skills matter, not documents.
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 p-4 rounded-full">
                  <FaBolt className="text-4xl text-yellow-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">On-Chain Reputation</h3>
              <p className="text-gray-600">
                Build immutable reputation. Your work history follows you forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="max-w-4xl mx-auto">
            {/* For Developers */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-primary-600">For Developers</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Connect Your Wallet</h4>
                    <p className="text-gray-600">No email, no password. Just your Web3 wallet.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Build Your Profile</h4>
                    <p className="text-gray-600">Showcase skills, portfolio, and pass coding tests.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Apply to Jobs</h4>
                    <p className="text-gray-600">Submit proposals and get hired based on merit.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Deliver & Get Paid</h4>
                    <p className="text-gray-600">Complete work, client approves, instant crypto payment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Clients */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-secondary-600">For Clients</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Verify Phone & Connect Wallet</h4>
                    <p className="text-gray-600">Quick SMS verification and wallet connection.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Post Your Job</h4>
                    <p className="text-gray-600">Describe your project, budget, and timeline.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Review Proposals</h4>
                    <p className="text-gray-600">Choose the best developer based on skills and reputation.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Deposit 50% & Get Work Done</h4>
                    <p className="text-gray-600">Escrow protects both parties. Pay remaining 50% on completion.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join the future of freelancing today.</p>
          <Link
            href="/jobs"
            className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg inline-block"
          >
            Explore Jobs
          </Link>
        </div>
      </section>
    </div>
  );
}

