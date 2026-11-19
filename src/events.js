// Other juggling and circus happenings around Cyprus, shown in the "Around the
// island" section. Add new ones here, in all three languages. Each drops off
// the page by itself once `until` has passed: the build leaves it out, and the
// browser hides it if the page was built before then.
//
// `teaser` is the short line flagged at the top of the page in the fortnight
// before the event starts.
//
// `start` and `until` are Cyprus times with their UTC offset (+02:00 in
// winter, +03:00 in summer).
export const EVENTS = [
  {
    start: "2026-11-22T18:30:00+02:00",
    until: "2026-11-23T00:00:00+02:00",
    by: "Third Space Project",
    url: "https://www.thirdspacecyprus.com/the-performance",
    flyer: "https://www.instagram.com/p/DfzSrfdKkks/",
    en: {
      title: "Homeland",
      teaser: "Homeland: circus in Nicosia",
      time: "6:30pm · doors 6pm",
      place: "Rüstem Kitabevi, Girne Caddesi, Nicosia",
      body: "Contemporary circus, mask theatre and drum ritual drawn from Cypriot myths, made by artists from across the island with friends from Greece, Turkey and Chile. A short documentary and an open conversation follow.",
      note: "Free · reservations are full",
    },
    el: {
      title: "Homeland",
      teaser: "Homeland: τσίρκο στη Λευκωσία",
      time: "18:30 · άνοιγμα θυρών 18:00",
      place: "Rüstem Kitabevi, οδός Κερύνειας, Λευκωσία",
      body: "Σύγχρονο τσίρκο, θέατρο μάσκας και τελετουργία με τύμπανα, εμπνευσμένα από κυπριακούς μύθους. Το δημιούργησαν καλλιτέχνες από όλο το νησί μαζί με φίλους από Ελλάδα, Τουρκία και Χιλή. Ακολουθούν ένα σύντομο ντοκιμαντέρ και ανοιχτή συζήτηση.",
      note: "Δωρεάν · οι κρατήσεις έχουν κλείσει",
    },
    tr: {
      title: "Homeland",
      teaser: "Homeland: Lefkoşa’da sirk",
      time: "18:30 · kapılar 18:00",
      place: "Rüstem Kitabevi, Girne Caddesi, Lefkoşa",
      body: "Kıbrıs mitlerinden beslenen çağdaş sirk, maske tiyatrosu ve davul ritüeli. Adanın her yerinden sanatçılar, Yunanistan, Türkiye ve Şili’den dostlarıyla birlikte hazırladı. Ardından kısa bir belgesel ve açık bir sohbet var.",
      note: "Ücretsiz · rezervasyonlar doldu",
    },
  },
];

export const upcoming = (now = Date.now()) => EVENTS.filter((e) => Date.parse(e.until) > now).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

// The next event starting within `days`, for the flag at the top of the page.
export const soon = (days = 14, now = Date.now()) => upcoming(now).find((e) => Date.parse(e.start) - now < days * 864e5);
