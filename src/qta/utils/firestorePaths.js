/** Caminhos comuns do Firestore para evitar repetição. */

export function userEventsPath(appId, userId) {
  return ['artifacts', appId, 'users', userId, 'events'];
}

export function userCollectionPath(appId, userId, collectionName) {
  return ['artifacts', appId, 'users', userId, collectionName];
}
