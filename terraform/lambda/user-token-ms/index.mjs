// Agrega scopes al Access Token segun los grupos funcionales de Cognito.
export const handler = async (event) => {
  const grupos = event.request?.groupConfiguration?.groupsToOverride ?? [];
  const scopesPorGrupo = {
    solicitantes: ["solicitudes/read", "solicitudes/write"],
    aprobadores: ["solicitudes/read", "solicitudes/approve"],
  };

  const scopes = new Set(
    event.response?.claimsAndScopeOverrideDetails?.accessTokenGeneration?.scopesToAdd ?? [],
  );

  for (const grupo of grupos) {
    for (const scope of scopesPorGrupo[grupo] ?? []) {
      scopes.add(scope);
    }
  }

  event.response = {
    ...event.response,
    claimsAndScopeOverrideDetails: {
      ...event.response?.claimsAndScopeOverrideDetails,
      accessTokenGeneration: {
        ...event.response?.claimsAndScopeOverrideDetails?.accessTokenGeneration,
        scopesToAdd: [...scopes],
      },
    },
  };

  return event;
};
