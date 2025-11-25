type IdPair = {
  alias: string;
  backend: string;
};

const normalize = (value: string) => value.toLowerCase();

const buildLookup = (pairs: IdPair[]) => {
  const aliasToBackend = new Map<string, string>();
  const backendToAlias = new Map<string, string>();
  pairs.forEach(({ alias, backend }) => {
    aliasToBackend.set(normalize(alias), backend);
    backendToAlias.set(normalize(backend), alias);
  });
  return { aliasToBackend, backendToAlias };
};

const productPairs: IdPair[] = [
  { alias: "prd-dragon", backend: "8e0cddde-6dc9-49f5-9a6b-111111111111" },
  { alias: "prd-blueberry", backend: "d49f7a55-3f27-4cb0-8a40-222222222222" },
  { alias: "prd-avocado", backend: "6cb33c0b-dcc5-44c0-90a5-333333333333" }
];

const partnerPairs: IdPair[] = [
  { alias: "partner-hn", backend: "33333333-3333-3333-3333-333333333331" },
  { alias: "partner-yx", backend: "33333333-3333-3333-3333-333333333332" },
  { alias: "partner-sc", backend: "33333333-3333-3333-3333-333333333333" },
  { alias: "partner-b2b", backend: "33333333-3333-3333-3333-333333333334" }
];

const { aliasToBackend: productAliasToBackend, backendToAlias: productBackendToAlias } = buildLookup(productPairs);
const { aliasToBackend: partnerAliasToBackend, backendToAlias: partnerBackendToAlias } = buildLookup(partnerPairs);

const toBackend = (value: string, lookup: Map<string, string>) => lookup.get(normalize(value)) ?? value;
const toFrontend = (value: string, lookup: Map<string, string>) => lookup.get(normalize(value)) ?? value;

export const translateProductIdToBackend = (productId: string) => toBackend(productId, productAliasToBackend);
export const translateProductIdToFrontend = (productId: string) => toFrontend(productId, productBackendToAlias);
export const translatePartnerIdToBackend = (partnerId: string) => toBackend(partnerId, partnerAliasToBackend);
export const translatePartnerIdToFrontend = (partnerId: string) => toFrontend(partnerId, partnerBackendToAlias);
