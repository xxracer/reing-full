import React from 'react';
import './PrivacyPolicy.css'; // Reusing the same styling for consistency

const TermsAndConditions = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>Terms and Conditions</h1>
        <p className="last-updated">Last Updated: April 9, 2026</p>

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the Reign Jiu Jitsu website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Reign Jiu Jitsu provides martial arts instruction, fitness classes, and related services. We reserve the right to modify or discontinue any service at any time.
          </p>
        </section>

        <section className="highlight-section">
          <h2>3. SMS and Mobile Communication</h2>
          <p>
            By opting in to receive SMS notifications, you agree to the following:
          </p>
          <ul>
            <li><strong>Message Frequency:</strong> The number of messages you receive varies based on your interaction with our services (e.g., appointment reminders, academy updates).</li>
            <li><strong>Customer Support:</strong> Reply "HELP" to any message for assistance.</li>
            <li><strong>Opt-Out:</strong> You can cancel the SMS service at any time. Just text "STOP" to the phone number. After you send the SMS message "STOP" to us, we will send you an SMS message to confirm that you have been unsubscribed.</li>
            <li><strong>Carriers:</strong> Carriers are not liable for delayed or undelivered messages.</li>
            <li><strong>Rates:</strong> As always, message and data rates may apply for any messages sent to you from us and to us from you.</li>
          </ul>
        </section>

        <section>
          <h2>4. Use of Website</h2>
          <p>
            You agree to use the website for lawful purposes only and in a way that does not infringe the rights of others or restrict their use and enjoyment of the website.
          </p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            Reign Jiu Jitsu shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services or website.
          </p>
        </section>

        <section>
          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms and Conditions at any time. Your continued use of the website following changes constitutes acceptance of those changes.
          </p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us via our website’s contact form.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
