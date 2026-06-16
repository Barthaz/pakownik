import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListCheck,
  faUsers,
  faShareNodes,
  faClock,
  faShieldHeart,
  faFaceSmile,
  faCircleCheck,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { pl } from '@/models/pl';
import { Button } from '@/views/ui/Button';
import { LogoShowcase } from '@/views/ui/LogoShowcase';
import { Header } from '@/views/layout/Header';
import { PublicLayout } from '@/views/layout/PublicLayout';
import { useAuth } from '@/contexts/AuthContext';

export function LandingPage() {
  const { landing } = pl;
  const { user } = useAuth();

  return (
    <PublicLayout header={<Header />}>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-coral font-medium mb-3">{pl.tagline}</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-navy leading-tight mb-5">
              {landing.heroTitle}
            </h1>
            <p className="text-muted text-lg mb-4 leading-relaxed">
              {landing.heroSubtitle}
            </p>
            <p className="text-sm text-muted/80 mb-8">{landing.heroNote}</p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <Link to="/app">
                  <Button size="lg">{pl.lists.title}</Button>
                </Link>
              ) : (
                <>
                  <Link to="/guest">
                    <Button size="lg">{landing.ctaGuest}</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="secondary" size="lg">
                      {landing.ctaRegister}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <LogoShowcase />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-navy text-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{landing.problem.title}</h2>
          <p className="text-white/75 text-lg leading-relaxed max-w-3xl mb-8">
            {landing.problem.intro}
          </p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {landing.problem.points.map((point) => (
              <li
                key={point}
                className="flex gap-3 rounded-2xl bg-white/10 border border-white/10 px-4 py-4 text-sm leading-relaxed text-white/90"
              >
                <span className="text-coral shrink-0 mt-0.5">✕</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution / How it works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
              {landing.solution.title}
            </h2>
            <p className="text-muted text-lg leading-relaxed">{landing.solution.intro}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {landing.solution.steps.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-border bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-coral/15 text-coral font-bold text-sm mb-4">
                  {i + 1}
                </span>
                <h3 className="font-heading font-semibold text-navy mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-y border-border py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy text-center mb-12 max-w-2xl mx-auto">
            {landing.benefits.title}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { icon: faClock, ...landing.benefits.items[0] },
              { icon: faCircleCheck, ...landing.benefits.items[1] },
              { icon: faShieldHeart, ...landing.benefits.items[2] },
              { icon: faFaceSmile, ...landing.benefits.items[3] },
            ].map((b) => (
              <div
                key={b.title}
                className="flex gap-4 rounded-2xl border border-border bg-cream/50 p-5 sm:p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
                  <FontAwesomeIcon icon={b.icon} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-navy mb-1.5">{b.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl font-bold text-navy mb-4">
              {landing.features.title}
            </h2>
            <p className="text-muted leading-relaxed">{landing.features.intro}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: faListCheck, title: landing.features.categories, desc: landing.features.categoriesDesc },
              { icon: faUsers, title: landing.features.family, desc: landing.features.familyDesc },
              { icon: faShareNodes, title: landing.features.share, desc: landing.features.shareDesc },
            ].map((f) => (
              <div key={f.title} className="text-center sm:text-left">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/15 text-coral mb-4">
                  <FontAwesomeIcon icon={f.icon} className="text-xl" />
                </div>
                <h3 className="font-heading font-semibold text-navy mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs account */}
      <section className="bg-white border-y border-border py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
              {landing.tiers.title}
            </h2>
            <p className="text-muted text-lg leading-relaxed">{landing.tiers.intro}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-cream/50 p-6 sm:p-8">
              <h3 className="font-heading font-semibold text-navy text-lg mb-4">
                {landing.tiers.guest.title}
              </h3>
              <ul className="space-y-3">
                {landing.tiers.guest.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-muted leading-relaxed">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-coral shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-coral/30 bg-coral/5 p-6 sm:p-8">
              <h3 className="font-heading font-semibold text-navy text-lg mb-4">
                {landing.tiers.account.title}
              </h3>
              <ul className="space-y-3">
                {landing.tiers.account.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-muted leading-relaxed">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-coral shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-navy to-navy-light px-6 py-10 sm:px-10 sm:py-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{landing.cta.title}</h2>
            <p className="text-white/75 leading-relaxed mb-8 max-w-xl mx-auto">
              {landing.cta.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {user ? (
                <Link to="/app">
                  <Button size="lg">
                    {pl.lists.title}
                    <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/guest">
                    <Button size="lg">
                      {landing.ctaGuest}
                      <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="ghost" size="lg" className="!border-white/30 !text-white hover:!bg-white/10">
                      {landing.ctaRegister}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
