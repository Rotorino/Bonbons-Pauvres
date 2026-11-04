import type { Metadata } from 'next'; import { ContactForm } from '@/components/contact-form';
export const metadata: Metadata = { title: 'Контакты' };
export default function ContactsPage() { return <section className="contact-page"><div className="page-intro"><p className="kicker">Связь с лавкой</p><p>Соберите коробку или оставьте вопрос. Реальные контакты и условия доставки будут опубликованы после подтверждения владельцем.</p></div><ContactForm /></section>; }
