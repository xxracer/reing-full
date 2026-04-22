import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: April 9, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Reign Jiu Jitsu ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Reign Jiu Jitsu.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>
            We collect information from you when you visit our site, register on our site, place an order, subscribe to our newsletter, respond to a survey, or fill out a form. This includes:
          </p>
          <ul>
            <li>Name / Username</li>
            <li>Phone Numbers</li>
            <li>Email Addresses</li>
            <li>Mailing Addresses</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>
            Any of the information we collect from you may be used in one of the following ways:
          </p>
          <ul>
            <li>To personalize your experience</li>
            <li>To improve our website</li>
            <li>To improve customer service</li>
            <li>To process transactions</li>
            <li>To send periodic emails or SMS notifications</li>
          </ul>
        </section>

        <section className="highlight-section">
          <h2>4. SMS and Mobile Communication</h2>
          <p>
            Reign Jiu Jitsu is committed to protecting your privacy. <strong>Mobile information will not be shared with third parties/affiliates for marketing/promotional purposes. All other categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</strong>
          </p>
          <p>
            By providing your phone number and opting in, you consent to receive SMS notifications, alerts, and occasional marketing messages from Reign Jiu Jitsu. 
          </p>
          <ul>
            <li><strong>Message Frequency:</strong> Message frequency varies.</li>
            <li><strong>Rates:</strong> Message and data rates may apply.</li>
            <li><strong>Opt-Out:</strong> You can opt-out at any time by replying "STOP" to any message you receive from us.</li>
            <li><strong>Help:</strong> Reply "HELP" for more information or assistance.</li>
          </ul>
        </section>

        <section>
          <h2>5. Third-Party Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
          </p>
        </section>

        <section>
          <h2>6. Your Consent</h2>
          <p>
            By using our site, you consent to our website's privacy policy.
          </p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>
            If there are any questions regarding this privacy policy, you may contact us using the information on our contact page.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
