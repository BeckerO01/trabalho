<?php
// Contador de visitas do site de demonstração (Radar de Leads).
// O site chama ?e=v ao abrir e ?e=w ao clicar no WhatsApp. O programa do PC lê com ?ler=<chave>.
header('Cache-Control: no-store');
$CHAVE = '__CHAVE__';
$arq = __DIR__ . '/dados-visitas.php'; // .php com exit no topo: ninguém lê pelo navegador
$ler = function () use ($arq) {
  if (!is_file($arq)) return ['v' => 0, 'w' => 0];
  $t = file_get_contents($arq);
  $j = json_decode(substr($t, strpos($t, "\n") + 1), true);
  return is_array($j) ? $j : ['v' => 0, 'w' => 0];
};
if (isset($_GET['ler'])) {
  if (!hash_equals($CHAVE, (string)$_GET['ler'])) { http_response_code(403); exit; }
  header('Content-Type: application/json');
  echo json_encode($ler());
  exit;
}
$e = $_GET['e'] ?? '';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
if (($e !== 'v' && $e !== 'w') || preg_match('/bot|crawl|spider|preview|facebookexternalhit|whatsapp|slack|telegram|curl|wget|python|headless/i', $ua)) { http_response_code(204); exit; }
$f = fopen($arq, 'c+');
if ($f && flock($f, LOCK_EX)) {
  $t = stream_get_contents($f);
  $d = $t ? json_decode(substr($t, strpos($t, "\n") + 1), true) : [];
  if (!is_array($d)) $d = [];
  $d['v'] = ($d['v'] ?? 0) + ($e === 'v' ? 1 : 0);
  $d['w'] = ($d['w'] ?? 0) + ($e === 'w' ? 1 : 0);
  $hoje = date('Y-m-d');
  $d['dias'][$hoje] = ($d['dias'][$hoje] ?? 0) + 1;
  if (empty($d['primeira'])) $d['primeira'] = date('c');
  $d['ultima'] = date('c');
  ftruncate($f, 0); rewind($f);
  fwrite($f, "<?php exit; ?>\n" . json_encode($d));
  fflush($f); flock($f, LOCK_UN);
}
if ($f) fclose($f);
http_response_code(204);
