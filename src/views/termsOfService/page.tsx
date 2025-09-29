export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-gray-700">
        Welcome to Prime Help! By using our platform to book or provide services
        such as washing, cleaning, electrician work, and more, you agree to the
        following terms:
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Service Use</h2>
      <p className="mb-4 text-gray-700">
        Prime Help connects service seekers and service providers. We are a
        platform facilitator and do not provide services directly. Users must
        communicate and agree on service details responsibly.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. User Responsibilities
      </h2>
      <p className="mb-4 text-gray-700">
        Both service seekers and providers must provide accurate information,
        respect others, and comply with all applicable laws when using Prime
        Help.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Payments</h2>
      <p className="mb-4 text-gray-700">
        Payments are agreed between users. Prime Help may support payment
        facilitation but is not responsible for disputes or payment issues.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Liability</h2>
      <p className="mb-4 text-gray-700">
        Prime Help is not liable for any damages or losses arising from the use
        of services provided by service providers through our platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Terms</h2>
      <p className="mb-4 text-gray-700">
        We may update these terms occasionally. Continued use of Prime Help
        means acceptance of updated terms.
      </p>

      <p className="mt-8 text-gray-600 text-sm">
        © {new Date().getFullYear()} Prime Help. All rights reserved.
      </p>
    </div>
  );
}
