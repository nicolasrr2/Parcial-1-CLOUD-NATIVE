package cl.duoc.dsy1107.pedidos360.config;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.List;

public class CognitoAudienceValidator implements OAuth2TokenValidator<Jwt> {

    private final String expectedClientId;

    public CognitoAudienceValidator(String expectedClientId) {
        this.expectedClientId = expectedClientId;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        List<String> audience = token.getAudience();
        String clientId = token.getClaimAsString("client_id");

        // Cognito puede omitir aud en access tokens y usar client_id para identificar
        // la SPA.
        // Si aud existe, debe contener el cliente esperado; si no existe, se valida
        // client_id.
        boolean audienciaValida = audience != null && !audience.isEmpty()
                ? audience.contains(expectedClientId)
                : expectedClientId.equals(clientId);

        if (audienciaValida) {
            return OAuth2TokenValidatorResult.success();
        }
        OAuth2Error error = new OAuth2Error("invalid_token", "El token no pertenece al cliente esperado", null);
        return OAuth2TokenValidatorResult.failure(error);
    }
}
