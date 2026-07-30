import { Link } from "react-router-dom"
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">

      {/* Navbar */}
      {/* Navbar */}
    <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-200 bg-white/70 backdrop-blur-md">

    {/* Left Section */}
    <div className="flex items-center gap-14">

        {/* Logo */}
        <div className="flex items-center gap-4">

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg">

            <span className="text-white text-2xl font-bold">
            V
            </span>

        </div>

        <h1 className="text-3xl font-bold text-slate-900">
            Vortura
        </h1>

        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-10 text-slate-700 font-semibold">

        <a
            href="#home"
            className="text-blue-600 border-b-2 border-blue-600 pb-1"
        >
            Home
        </a>

        <a
            href="#features"
            className="hover:text-blue-600 transition"
        >
            Features
        </a>

        <a
            href="#security"
            className="hover:text-blue-600 transition"
        >
            Security
        </a>

        <a
            href="#about"
            className="hover:text-blue-600 transition"
        >
            About
        </a>

        </div>

    </div>

    {/* Admin Panel Button */}

      <Link
        to="/admin-login"
        className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-7 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
      >

        Admin Panel

      </Link>

    </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="px-10 py-20 grid md:grid-cols-2 gap-10 items-center"
      >

       {/* Left Content */}
        <div className="relative">

          {/* Glow */}
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-cyan-400/20 blur-3xl rounded-full"></div>

          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-400/20 px-5 py-3 rounded-full mb-8 backdrop-blur-lg">

            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>

            <span className="text-blue-700 font-semibold">
              Blockchain Secured Voting
            </span>

          </div>

          {/* Heading */}
          <h1 className="text-7xl font-black leading-[1.05] tracking-tight text-slate-900">

            Secure,
            <br />

            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              Intelligent
            </span>

            <br />

            Digital Voting

          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 leading-9 mt-8 max-w-2xl">

            Vortura combines blockchain security, biometric authentication,
            AI-powered fraud detection, and transparent governance
            to modernize national digital elections.

          </p>

          {/* Buttons */}
          <div className="flex gap-5 mt-10">

            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:scale-105 transition duration-300 inline-block"
            >
              Get Started
            </Link>

            <a
              href="#detailed-features"
              className="border border-slate-300 bg-white/70 backdrop-blur-lg px-8 py-4 rounded-2xl font-semibold hover:bg-slate-100 transition inline-block"
            >
              Learn More
            </a>

          </div>

          {/* Trust Indicators */}
          <div className="flex gap-6 mt-10 text-slate-700 font-medium flex-wrap">

            <div>✓ Voter ID Verified</div>

            <div>✓ Blockchain Secured</div>

            <div>✓ AI Fraud Detection</div>

          </div>

        </div>

        {/* Right Illustration */}
        {/* Right Section */}
        <div className="relative">

          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[32px] shadow-2xl p-8">
            <div id="features">  
            {/* Features Card */}
            <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-3xl font-bold text-slate-900">
                  Features
                </h2>

                <a
                  href="#detailed-features"
                  className="text-blue-600 font-semibold"
                >
                  View All →
                </a>

           </div>
           </div>

      <div className="space-y-5">

        {/* Feature 1 */}
        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition">

          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">
            🗳️
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Secure Digital Voting
            </h3>

            <p className="text-slate-500">
              Vote securely using verified voter authentication.
            </p>
          </div>

        </div>

        {/* Feature 2 */}
        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition">

          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
            ⛓️
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Blockchain Security
            </h3>

            <p className="text-slate-500">
              Immutable blockchain ledger ensures transparency.
            </p>
          </div>

        </div>

        {/* Feature 3 */}
        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition">

          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
            🧠
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">
              AI Fraud Detection
            </h3>

            <p className="text-slate-500">
              AI identifies suspicious voting activities instantly.
            </p>
          </div>

        </div>

      </div>

    </div>
    <div id="security">
    {/* Security Card */}
    <div className="bg-white rounded-3xl p-6 shadow-lg">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-3xl font-bold text-slate-900">
          Security
        </h2>

        <a
          href="#security-architecture"
          className="text-blue-600 font-semibold"
        >
          View All →
        </a>

      </div>
      </div>

      <div className="grid grid-cols-3 gap-4">

        <div className="bg-slate-50 rounded-2xl p-5 text-center">

          <div className="text-3xl mb-3">
            🔒
          </div>

          <h3 className="font-bold text-slate-800 mb-2">
            Encryption
          </h3>

          <p className="text-sm text-slate-500">
            End-to-end vote protection
          </p>

        </div>

        <div className="bg-slate-50 rounded-2xl p-5 text-center">

          <div className="text-3xl mb-3">
            👆
          </div>

          <h3 className="font-bold text-slate-800 mb-2">
            Biometrics
          </h3>

          <p className="text-sm text-slate-500">
            Multi-factor authentication
          </p>

        </div>

        <div className="bg-slate-50 rounded-2xl p-5 text-center">

          <div className="text-3xl mb-3">
            📊
          </div>

          <h3 className="font-bold text-slate-800 mb-2">
            Transparency
          </h3>

          <p className="text-sm text-slate-500">
            Tamper-proof blockchain records
          </p>

        </div>

      </div>

    </div>

  </div>

</div>

      </section>
      
      {/* DETAILED FEATURES SECTION */}

<section
  id="detailed-features"
  className="px-10 py-24 bg-gradient-to-br from-[#020B2D] to-[#071133] text-white"
>

  <div className="text-center mb-16">

    <h2 className="text-6xl font-black mb-6">
      Advanced Platform Features
    </h2>

    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-9">

      Vortura combines blockchain infrastructure, AI-powered fraud
      prevention, biometric verification, and real-time election
      monitoring into one intelligent election ecosystem.

    </p>

  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

    {/* Card 1 */}
    <div className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-8 shadow-xl hover:-translate-y-3 transition duration-300">

      <div className="text-5xl mb-6">
        ⛓️
      </div>

      <h3 className="text-2xl font-bold text-white mb-4">
        Blockchain Voting
      </h3>

      <p className="text-slate-400 leading-8">

        Immutable decentralized blockchain ledger ensuring
        transparent and tamper-proof elections.

      </p>

    </div>

    {/* Card 2 */}
    <div className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-8 shadow-xl hover:-translate-y-3 transition duration-300">

      <div className="text-5xl mb-6">
        🧠
      </div>

      <h3 className="text-2xl font-bold text-white mb-4">
        AI Fraud Detection
      </h3>

      <p className="text-slate-400 leading-8">

        Intelligent AI continuously monitors spoof attacks,
        duplicate votes, and suspicious election activity.

      </p>

    </div>

    {/* Card 3 */}
    <div className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-8 shadow-xl hover:-translate-y-3 transition duration-300">

      <div className="text-5xl mb-6">
        👁️
      </div>

      <h3 className="text-2xl font-bold text-white mb-4">
        Biometric Security
      </h3>

      <p className="text-slate-400 leading-8">

        Multi-factor facial and fingerprint verification
        ensures secure voter identity authentication.

      </p>

    </div>

    {/* Card 4 */}
    <div className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-8 shadow-xl hover:-translate-y-3 transition duration-300">

      <div className="text-5xl mb-6">
        📊
      </div>

      <h3 className="text-2xl font-bold text-white mb-4">
        Real-time Monitoring
      </h3>

      <p className="text-slate-400 leading-8">

        Live election analytics, fraud alerts, blockchain syncing,
        and transparent vote counting dashboards.

      </p>

    </div>

  </div>

</section>

{/* SECURITY ARCHITECTURE */}

<section
  id="security-architecture"
  className="px-10 py-24 bg-gradient-to-br from-slate-50 to-blue-100 text-slate-900"
>

  <div className="text-center mb-16">

    <h2 className="text-6xl font-black mb-6">
      Security Architecture
    </h2>

    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-9">

      Enterprise-grade election protection powered by blockchain,
      biometric verification, encryption, and AI security monitoring.

    </p>

  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

    {/* Security Card 1 */}
    <div className="bg-white shadow-xl rounded-3xl p-8">

      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        AES-256 Encryption
      </h3>

      <p className="text-slate-600 leading-8">

        End-to-end vote encryption ensuring
        secure ballot transmission.

      </p>

    </div>

    {/* Security Card 2 */}
    <div className="bg-white shadow-xl rounded-3xl p-8">

      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        Immutable Ledger
      </h3>

      <p className="text-slate-600 leading-8">

        Blockchain records cannot be modified,
        deleted, or tampered with.

      </p>

    </div>

    {/* Security Card 3 */}
    <div className="bg-white shadow-xl rounded-3xl p-8">

      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        AI Threat Detection
      </h3>

      <p className="text-slate-600 leading-8">

        Machine learning detects fraudulent
        voting patterns instantly.

      </p>

    </div>

    {/* Security Card 4 */}
    <div className="bg-white shadow-xl rounded-3xl p-8">

      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        Multi-factor Authentication
      </h3>

      <p className="text-slate-600 leading-8">

        OTP, face verification, and fingerprint
        validation ensure voter integrity.

      </p>

    </div>

  </div>

</section>

{/* FOOTER / ABOUT */}

<footer
  id="about"
  className="bg-[#020B2D] text-white px-10 py-16"
>

  <div className="grid md:grid-cols-3 gap-10">

    {/* Brand */}
    <div>

      <h2 className="text-3xl font-bold mb-4">
        Vortura
      </h2>

      <p className="text-slate-400 leading-8">

        AI-powered blockchain voting platform ensuring
        secure, transparent, and fraud-resistant elections.

      </p>

    </div>

    {/* Features */}
    <div>

      <h3 className="text-xl font-bold mb-4">
        Features
      </h3>

      <ul className="space-y-3 text-slate-400">

        <li>Blockchain Security</li>
        <li>Biometric Verification</li>
        <li>AI Fraud Detection</li>
        <li>Election Transparency</li>

      </ul>

    </div>

    {/* Security */}
    <div>

      <h3 className="text-xl font-bold mb-4">
        Security
      </h3>

      <ul className="space-y-3 text-slate-400">

        <li>AES-256 Encryption</li>
        <li>Immutable Ledger</li>
        <li>Biometric Authentication</li>
        <li>Multi-Factor Verification</li>

      </ul>

    </div>

  </div>

  <div className="border-t border-slate-700 mt-10 pt-6 text-slate-500 text-center">

    © 2026 Vortura. Secure Digital Voting Platform.

  </div>

</footer>
    </div>
  )
}

export default LandingPage