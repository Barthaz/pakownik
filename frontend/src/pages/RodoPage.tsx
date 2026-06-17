import { LegalPageLayout } from '@/views/legal/LegalPageLayout';
import { routes } from '@/models/constants';
import { pl } from '@/models/pl';

export function RodoPage() {
  return (
    <LegalPageLayout
      title={pl.legal.rodo}
      description="Klauzula informacyjna RODO serwisu Pakownik."
      path={routes.rodo}
    >
      <section>
        <h2 className="text-xl font-semibold text-navy">Informacja o przetwarzaniu danych</h2>
        <p>
          Zgodnie z art. 13 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679
          (RODO) informujemy, że:
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">Administrator</h2>
        <p>Administratorem Pani/Pana danych osobowych jest operator Serwisu Pakownik.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">Podstawa prawna</h2>
        <p>
          Dane przetwarzane są na podstawie art. 6 ust. 1 lit. b RODO (wykonanie umowy o
          świadczenie usług drogą elektroniczną) oraz art. 6 ust. 1 lit. a RODO (zgoda —
          akceptacja regulaminu i polityki prywatności).
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">Okres przechowywania</h2>
        <p>
          Dane przechowywane są przez okres posiadania konta w Serwisie oraz przez czas
          wymagany przepisami prawa po jego usunięciu.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">Odbiorcy danych</h2>
        <p>
          Dane mogą być powierzane podmiotom świadczącym usługi hostingowe i
          infrastrukturalne niezbędne do działania Serwisu, na podstawie umów powierzenia
          przetwarzania danych.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-navy">Prawa osoby, której dane dotyczą</h2>
        <p>
          Przysługuje Pani/Panu prawo dostępu do danych, ich sprostowania, usunięcia,
          ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu oraz
          cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem
          przetwarzania przed cofnięciem).
        </p>
      </section>
    </LegalPageLayout>
  );
}
