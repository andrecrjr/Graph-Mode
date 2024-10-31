import React from "react";

export default function TermPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Privacy Policy and Terms of Service
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            1. Information Collected
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We collect personal information, such as details from your connected
            Notion pages, ONLY to provide enhanced visualization services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            2. Data Usage
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Your data is used exclusively for the purpose of visualizing and
            managing connections within your Notion content. We do not sell your
            information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            3. Payment and Subscriptions
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We use Stripe as our payment provider to securely process payments.
            By subscribing, you authorize us to charge your payment method
            through Stripe according to your selected subscription plan. All
            subscriptions automatically renew at the end of the billing period
            unless canceled. You may cancel your subscription at any time, but
            you will continue to have access until the end of your current
            billing cycle.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            4. Refund Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>
              All payments are final, and we do not offer refunds for any
              subscription payments or lifetime payments
            </strong>
            , including partial refunds for unused time. Please review our
            services and ensure they meet your needs before subscribing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            5. Security
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We implement reasonable security measures to protect your
            information. However, please note that usage of the service is at
            your own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            6. Contact
          </h2>
          <p className="text-gray-700 leading-relaxed">
            For any questions, please reach us via{" "}
            <a
              href="https://acjr.notion.site/12db5e58148c80c19144ce5f22f3f392?pvs=105"
              className="font-bold underline"
            >
              support form
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
