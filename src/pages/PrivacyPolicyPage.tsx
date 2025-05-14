
import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PrivacyPolicyPage = () => {
  useDocumentTitle('Privacy Policy | Usora');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
            <p>
              At Usora, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our relationship management application.
              Please read this privacy policy carefully. By accessing or using Usora, you agree to the terms 
              of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <p className="mb-3">We may collect personal information that you voluntarily provide to us when registering for Usora, including but not limited to:</p>
            <ul className="list-disc pl-6 mb-3 space-y-2">
              <li>Personal details such as name and email</li>
              <li>Relationship information you choose to share</li>
              <li>Communication preferences</li>
              <li>Content you create within the app such as goals, notes, and mood entries</li>
              <li>Technical information about your device and usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve Usora</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Understand how you use our application to improve functionality</li>
              <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Sharing Your Information</h2>
            <p className="mb-3">
              We will not share your personal information with third parties except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With your consent or at your direction</li>
              <li>With your partner when you explicitly choose to share information</li>
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations</li>
              <li>To protect the rights and safety of our users and third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information.
              However, no method of transmission over the Internet or electronic storage is 100% secure, so we 
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in 
              this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
            <p className="mb-3">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your personal information</li>
              <li>Restriction or objection to processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at privacy@usora.com.
            </p>
          </section>
          
          <div className="border-t border-border pt-6 mt-10">
            <p className="text-sm">Last Updated: May 14, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
