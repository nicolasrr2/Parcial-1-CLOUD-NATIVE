package cl.duoc.dsy1107.pedidos360.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

class CognitoAudienceValidatorTest {

    private final CognitoAudienceValidator validator = new CognitoAudienceValidator("spa-client");

    @Test
    void aceptaClienteEnAudience() {
        Jwt jwt = jwt(Map.of("aud", List.of("spa-client")));
        assertThat(validator.validate(jwt).hasErrors()).isFalse();
    }

    @Test
    void aceptaClientIdCuandoAudienceNoExiste() {
        Jwt jwt = jwt(Map.of("client_id", "spa-client"));
        assertThat(validator.validate(jwt).hasErrors()).isFalse();
    }

    @Test
    void rechazaClienteDiferente() {
        Jwt jwt = jwt(Map.of("client_id", "otro-client"));
        assertThat(validator.validate(jwt).hasErrors()).isTrue();
    }

    private Jwt jwt(Map<String, Object> claims) {
        return new Jwt("token", Instant.now(), Instant.now().plusSeconds(300),
                Map.of("alg", "RS256"), claims);
    }
}
