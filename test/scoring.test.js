import { test } from "node:test";
import assert from "node:assert/strict";
import { tipoDeSite, ehCelular, normalizarTelefone, pontuar, extrairContatos } from "../src/scoring.js";

test("classifica site", () => {
  assert.equal(tipoDeSite(""), "nenhum");
  assert.equal(tipoDeSite("https://www.instagram.com/barbeariadoze/"), "rede_social");
  assert.equal(tipoDeSite("https://linktr.ee/ze"), "rede_social");
  assert.equal(tipoDeSite("https://wa.me/5541999999999"), "rede_social");
  assert.equal(tipoDeSite("https://barbeariadoze.com.br/"), "proprio");
});

test("telefone e celular", () => {
  assert.equal(normalizarTelefone("+55 41 99812-4471"), "5541998124471");
  assert.equal(normalizarTelefone("(41) 3333-4444"), "554133334444");
  assert.ok(ehCelular("+55 41 99812-4471"));
  assert.ok(!ehCelular("(41) 3333-4444"));
});

test("sem site pontua mais que com site", () => {
  const base = { telefone: "5541998124471", whatsapp: "5541998124471", avaliacoes: 120, nota: 4.8 };
  const sem = pontuar({ ...base, siteTipo: "nenhum" }).score;
  const com = pontuar({ ...base, siteTipo: "proprio" }).score;
  assert.ok(sem >= 60 && com < 60, `${sem} / ${com}`);
});

test("extrai contatos do HTML", () => {
  const html = `<a href="https://api.whatsapp.com/send?phone=5541998124471&text=oi">Zap</a>
    <a href="mailto:contato@clinica.com.br">email</a> <img src="logo@2x.png">
    <a href="https://www.instagram.com/clinicaxyz/">ig</a> <a href="https://facebook.com/sharer/x">s</a> <a href="https://www.facebook.com/clinicaxyz">fb</a>`;
  const c = extrairContatos(html);
  assert.equal(c.whatsapp, "5541998124471");
  assert.deepEqual(c.emails, ["contato@clinica.com.br"]);
  assert.equal(c.instagram, "@clinicaxyz");
  assert.equal(c.facebook, "facebook.com/clinicaxyz");
  assert.equal(extrairContatos('<a href="https://wa.me/554198124471">').whatsapp, "554198124471");
});
