const {setGlobalOptions} = require("firebase-functions/v2");
const {
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");

setGlobalOptions({maxInstances: 10});

const ALLOWED_EMAILS = new Set([
  "giannydornelas@gmail.com",
  "laisamgb@gmail.com",
]);

exports.allowOnlyApprovedUsers = beforeUserSignedIn((event) => {
  const authData = event && event.data ? event.data : {};
  const email = String(authData.email || "").trim().toLowerCase();

  if (!ALLOWED_EMAILS.has(email)) {
    throw new HttpsError(
        "permission-denied",
        "Este email não tem permissão para acessar esta biblioteca.",
    );
  }
});
