import { LegalPageLayout } from '@/views/legal/LegalPageLayout';
import { routes } from '@/models/constants';
import { pl } from '@/models/pl';

export function TermsPage() {
  return (
    <LegalPageLayout
      title={pl.legal.terms}
      description="Regulamin korzystania z serwisu Pakownik."
      path={routes.terms}
    >
      <section>
        <h2 className="text-xl font-semibold text-navy">§1 Postanowienia ogólne</h2>
        <p>
          Niniejszy regulamin określa zasady korzystania z aplikacji internetowej Pakownik
          (dalej: „Serwis”), służącej do tworzenia i zarządzania listami pakowania.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">§2 Konto użytkownika</h2>
        <p>
          Rejestracja w Serwisie wymaga podania adresu e-mail oraz hasła. Użytkownik zobowiązany
          jest do podania prawdziwych danych i zachowania poufności hasła. Konto jest
          przypisane do jednego użytkownika i nie może być udostępniane osobom trzecim.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">§3 Udostępnianie list</h2>
        <p>
          Użytkownik może udostępniać swoje listy pakowania innym osobom poprzez wskazanie
          adresu e-mail odbiorcy. Odbiorca uzyskuje dostęp po zalogowaniu lub rejestracji na
          wskazany adres e-mail, zgodnie z nadanymi uprawnieniami.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">§4 Odpowiedzialność</h2>
        <p>
          Serwis udostępniany jest „tak jak jest”. Administrator dokłada starań, aby Serwis
          działał prawidłowo, jednak nie ponosi odpowiedzialności za utratę danych spowodowaną
          siłą wyższą lub działaniem użytkownika.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">§5 Postanowienia końcowe</h2>
        <p>
          Administrator zastrzega sobie prawo do zmiany regulaminu. O istotnych zmianach
          użytkownicy zostaną poinformowani w Serwisie. Korzystanie z Serwisu po zmianach
          oznacza akceptację nowego regulaminu.
        </p>
      </section>
    </LegalPageLayout>
  );
}
