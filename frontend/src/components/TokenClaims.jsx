export default function TokenClaims({ claims }) {
  if (!claims) return null;

  const relevantes = {
    "cognito:groups": claims["cognito:groups"] || [],
    scope: claims.scope || "",
    token_use: claims.token_use || "",
    client_id: claims.client_id || "",
    iss: claims.iss || "",
  };

  return (
    <details className="claims panel">
      <summary>Información de seguridad</summary>
      <div className="claims-grid">
        <div><span>cognito:groups</span><strong>{Array.isArray(relevantes["cognito:groups"]) ? relevantes["cognito:groups"].join(", ") || "Sin grupos" : relevantes["cognito:groups"]}</strong></div>
        <div><span>scope</span><strong>{relevantes.scope || "Sin scopes"}</strong></div>
        <div><span>token_use</span><strong>{relevantes.token_use || "No informado"}</strong></div>
        <div><span>client_id</span><strong>{relevantes.client_id || "No informado"}</strong></div>
        <div className="campo-ancho"><span>issuer</span><strong>{relevantes.iss || "No informado"}</strong></div>
      </div>
    </details>
  );
}
