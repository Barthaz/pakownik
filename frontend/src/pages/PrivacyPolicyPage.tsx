import { LegalPageLayout } from '@/views/legal/LegalPageLayout';
import { routes } from '@/models/constants';
import { pl } from '@/models/pl';

export function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title={pl.legal.privacy}
      description="Polityka prywatności serwisu Pakownik."
      path={routes.privacy}
    >
      <section>
        <h2 className="text-xl font-semibold text-navy">1. Administrator danych</h2>
        <p>
          Administratorem danych osobowych przetwarzanych w Serwisie Pakownik jest operator
          Serwisu. W sprawach związanych z ochroną danych można skontaktować się poprzez
          formularz kontaktowy dostępny w Serwisie.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">2. Zakres przetwarzanych danych</h2>
        <p>Przetwarzamy następujące dane:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>adres e-mail (rejestracja i logowanie),</li>
          <li>hasło (w formie zahashowanej),</li>
          <li>dane dotyczące list pakowania i członków rodziny,</li>
          <li>data akceptacji regulaminu.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">3. Cele przetwarzania</h2>
        <p>
          Dane przetwarzane są w celu świadczenia usług Serwisu, udostępniania list,
          zapewnienia bezpieczeństwa konta oraz wypełnienia obowiązków prawnych.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">4. Pliki cookies</h2>
        <p>
          Serwis wykorzystuje localStorage do przechowywania tokenu sesji użytkownika.
          Nie stosujemy plików cookies śledzących w celach marketingowych.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">5. Prawa użytkownika</h2>
        <p>
          Użytkownik ma prawo dostępu do swoich danych, ich sprostowania, usunięcia,
          ograniczenia przetwarzania, przenoszenia danych oraz wniesienia skargi do organu
          nadzorczego (Prezes UODO).
        </p>
      </section>
    </LegalPageLayout>
  );
}
