import React from 'react';
import { openCookieSettings } from '../components/CookieBanner';

// English version of the legal pages (courtesy translation). The Spanish text is the legally binding version.
const EMAIL = 'info@freshpickfruits.com';
const link = 'text-[#7B4382] underline';

interface Section { title: string; body: React.ReactNode }
export interface LegalPageContent { title: string; description: string; intro: string; sections: Section[] }

export const LEGAL_UPDATED_EN = 'October 29, 2026';

export const LEGAL_NOTE_EN =
  'This English version is a courtesy translation. If there is any difference between it and the Spanish version, the Spanish version prevails.';

export const PAGES_EN: Record<'privacidad' | 'terminos' | 'cookies', LegalPageContent> = {
  privacidad: {
    title: 'Privacy Policy',
    description: 'How Fresh Pick collects, uses and protects your personal data when you buy high-mountain blueberries or sign in to our site.',
    intro: 'At Fresh Pick (High-Mountain Blueberries, Guasca, Cundinamarca, Colombia) we respect your privacy. This policy explains what data we collect, what we use it for and how you can exercise your rights, in accordance with Colombian Law 1581 of 2012 on personal data protection.',
    sections: [
      { title: 'Who is responsible', body: <p>Fresh Pick (ANDEAN FRUIT COMPANY SAS, NIT 901.040.161-7), a producer of high-mountain blueberries with crops in the Santa Bárbara hamlet, Guasca, Cundinamarca, Colombia, is the controller of the personal data collected on freshpickfruits.com. Contact: <a className={link} href={`mailto:${EMAIL}`}>{EMAIL}</a> · WhatsApp +57 317 893 1026.</p> },
      { title: 'Data we collect', body: <p>We collect only the data needed to sell and deliver our blueberries: name, email address, profile photo of your account (if you sign in with Google), phone number, delivery addresses, billing data (name or company name and identification number) and the history of your orders and subscriptions. If you write to us on WhatsApp or by email, we keep that conversation to handle your order.</p> },
      { title: 'Your Google account data', body: (
        <>
          <p>If you choose “Sign in with Google”, Google shares with us only your <strong>name, email address and profile photo</strong> (basic identity permissions: profile and email). We do not ask for access to your Gmail, contacts, calendar, Drive or any other data in your Google account, and we never receive your password.</p>
          <p className="mt-2">We use this data only to: (a) create and recognize your Fresh Pick account, (b) show you your orders, addresses and subscriptions, and (c) contact you about your orders. We do not use it for advertising, we do not sell it or transfer it to third parties for other purposes, and we do not use it to train artificial intelligence models. Our use of information received from Google complies with the <a className={link} href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including its Limited Use requirements.</p>
        </>
      ) },
      { title: 'What we use your data for', body: <p>To manage and deliver your orders, administer your account and your monthly subscriptions, coordinate deliveries (Tuesdays and Wednesdays) by WhatsApp or email, process payments, issue invoices and meet legal and accounting obligations. We do not sell your data or use it for advertising profiles.</p> },
      { title: 'Authorization and purposes', body: <p>By placing an order you give us your prior, express and informed authorization to process your data to manage the order, collect payment, deliver, invoice and contact you about the service. We will only send you commercial information if you authorize it separately. You can revoke this authorization at any time through our contact channels.</p> },
      { title: 'Who we share it with', body: <p>Only with the providers needed to run the service, which process the data solely to provide it: Google Firebase (authentication and database), Vercel (site hosting), Bold or Wompi (online payments), Resend (order confirmation emails) and the delivery companies that carry out the delivery. We may also share data when a competent authority requires it by law.</p> },
      { title: 'Where and for how long we keep it', body: <p>Data is stored on Google Firebase servers. We keep your information while you maintain an active account and, afterwards, only as long as Colombian legal, tax and accounting obligations require (for example, keeping invoices). After that time it is deleted or anonymized.</p> },
      { title: 'Security', body: <p>We use encrypted connections (HTTPS), access rules so that each customer sees only their own information, and restricted access for the Fresh Pick team. No system is completely infallible, but we apply reasonable measures to protect your data.</p> },
      { title: 'Your rights and how to delete your data', body: <p>Under Law 1581 of 2012 you can know, update, rectify and delete your data, and revoke your authorization, by writing to <a className={link} href={`mailto:${EMAIL}`}>{EMAIL}</a> or on WhatsApp at +57 317 893 1026. To delete your account and associated data, request it through those channels; queries are answered within 10 business days at most (extendable by 5 more, with notice) and claims within 15 business days. You may also file complaints with the Superintendence of Industry and Commerce (SIC). You can also remove Fresh Pick’s access to your Google account at <a className={link} href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.</p> },
      { title: 'Cookies and local storage', body: <p>We use browser storage to keep you signed in, to keep your shopping cart and to remember your cookie preferences. Analytics and marketing cookies are only activated if you accept them. See the <a className={link} href="/cookies">Cookie Policy</a>. You can delete the data from your browser settings; if you do, you will have to sign in again.</p> },
      { title: 'Minors', body: <p>Our site is not aimed at people under 18 and we do not knowingly collect their data. If you believe a minor has given us information, write to us so we can delete it.</p> },
      { title: 'Changes and contact', body: <p>We may update this policy and will publish the current version on this page with its update date. For any question, write to us at <a className={link} href={`mailto:${EMAIL}`}>{EMAIL}</a> or on WhatsApp at +57 317 893 1026.</p> }
    ]
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'Which cookies freshpickfruits.com uses, what they are for and how to manage them.',
    intro: 'Cookies are small files that a site saves in your browser. This is how we use them at Fresh Pick.',
    sections: [
      { title: 'Necessary', body: <p>They keep your session, your cart and your cookie preferences. Without them the site does not work, and they do not require consent.</p> },
      { title: 'Analytics', body: <p>They tell us which pages are visited and how fast the site loads so we can improve it. They are only activated if you accept them.</p> },
      { title: 'Marketing', body: <p>They allow us to measure Google and Meta campaigns. They are only activated if you accept them.</p> },
      { title: 'How to change your decision', body: <p><button type="button" onClick={openCookieSettings} className="font-semibold text-[#7B4382] underline cursor-pointer">Open cookie settings</button>, or delete cookies from your browser. More information in the <a className={link} href="/privacidad">Privacy Policy</a>.</p> }
    ]
  },
  terminos: {
    title: 'Terms & Conditions',
    description: 'Conditions of use, orders, payments, deliveries and returns at Fresh Pick, fresh high-mountain blueberries from Guasca, Colombia.',
    intro: 'By using this site and placing orders with Fresh Pick you accept these conditions. If you do not agree, please do not use the service.',
    sections: [
      { title: 'Who we are', body: <p>Fresh Pick (ANDEAN FRUIT COMPANY SAS) produces and sells fresh high-mountain blueberries grown in the Santa Bárbara hamlet, Guasca, Cundinamarca, Colombia. Contact: <a className={link} href={`mailto:${EMAIL}`}>{EMAIL}</a> · WhatsApp +57 317 893 1026.</p> },
      { title: 'Orders and availability', body: <p>Products are fresh and depend on the harvest. An order is confirmed when Fresh Pick accepts it; if an item is unavailable we will let you know and propose an alternative or a refund.</p> },
      { title: 'Prices and payments', body: <p>Prices are shown in Colombian pesos (COP). You can pay by bank transfer, Bre-B or online with Bold, depending on availability when you place the order. Delivery is always COP $7,000, with no free shipping. Online payment also carries a payment gateway fee (6% with Bold, 5% with Wompi), shown before you pay. We do not start preparing an order without confirmed payment.</p> },
      { title: 'Minimum and maximum order', body: <p>The minimum order is 500 g in total; 125 g and 250 g boxes are ordered in multiples of 2 units. Maximum per order: 80 boxes of 125 g, 40 of 250 g and 20 of 500 g. For larger volumes, message us on WhatsApp or see our wholesale section.</p> },
      { title: 'Deliveries', body: <p>We deliver in Bogotá on Tuesdays and Wednesdays between 8:00 a.m. and 3:00 p.m., at least 8 days after the order date. The customer is responsible for providing a correct address and contact.</p> },
      { title: 'Changes and returns', body: <p>Because this is a perishable product, if you receive fruit in poor condition tell us on WhatsApp or by email on the day of delivery, with a photo, and we will replace it. For distance purchases, the right of withdrawal under Law 1480 of 2011 also applies, except for perishable goods.</p> },
      { title: 'Subscriptions', body: <p>Monthly plans renew according to the plan you chose. You can pause or cancel them by letting us know before the next delivery.</p> },
      { title: 'Your account', body: <p>You are responsible for your account information and for the activity carried out with it. We may suspend accounts or cancel orders for misuse of the service or your account.</p> },
      { title: 'Site content', body: <p>The texts, images and brand of Fresh Pick are ours or used with permission; they may not be reproduced without permission. Recipe and news information is for information only and does not replace medical advice.</p> },
      { title: 'Personal data and changes', body: <p>The processing of your data is governed by our <a className={link} href="/privacidad">Privacy Policy</a>. We may update these terms and will publish the current version on this page. They are governed by the laws of Colombia.</p> }
    ]
  }
};
