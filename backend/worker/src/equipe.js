/* Quem é da equipe, com acesso total. Mesma lista da função equipe() em firestore.rules —
   mudar nos dois lugares e publicar de novo (npm run deploy:worker e deploy:regras). */
const EQUIPE = ["ikkysousa5@gmail.com"];

function ehEquipe(token) {
  return !!token && token.email_verified === true && EQUIPE.includes(String(token.email || "").toLowerCase());
}

export { EQUIPE, ehEquipe };
