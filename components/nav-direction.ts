export interface DeckPosition {
  page: number;
  clicks: number;
}

// Reading the direction off the positions themselves keeps this independent of the
// order in which Slidev updates `navDirection` and `clicksDirection`, which it leaves
// untouched when a slide is jumped to from the overview or from the URL.
export function isBackwardMove(from: DeckPosition, to: DeckPosition): boolean {
  return to.page === from.page ? to.clicks < from.clicks : to.page < from.page;
}
