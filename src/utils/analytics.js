// Analytics helpers (Umami). All no-op safely if the script didn't
// load (ad-blockers, offline) — analytics must never break the app.

// Record a virtual pageview for the current game. This is a single-page
// app, so without this Umami sees one page for the whole visit. Sending a
// /game/<id> pageview on each switch lets Umami report per-game time-on-page
// (it measures the gap between consecutive pageviews), and lets the Devices
// and Region reports be filtered per game. The callback form keeps Umami's
// real referrer/host props and only overrides url + title.
export function trackGameView(id, label) {
  try {
    window.umami?.track(props => ({ ...props, url: `/game/${id}`, title: label }));
  } catch {
    /* ignore */
  }
}

// Generic custom event, for optional richer metrics later
// (e.g. track('game_won', { game: 'numdet', stars: 3 })).
export function track(event, props) {
  try {
    window.umami?.track(event, props);
  } catch {
    /* ignore */
  }
}
