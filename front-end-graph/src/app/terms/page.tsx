import React from "react";

export default function page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Privacy Policy
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            1. Information Collected
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We collect personal information such as details from your connected
            Notion pages ONLY to provide enhanced visualization services.
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
            3. Security
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We implement reasonable security measures to protect your
            information, but please note that usage of the service is at your
            own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            4. Contact
          </h2>
          <p className="text-gray-700 leading-relaxed">
            For any questions, please reach us via our support email:{" "}
            <a
              href="mailto:andreandreuchiha@gmail.com"
              className="text-blue-600 hover:underline"
            >
              andreandreuchiha@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
