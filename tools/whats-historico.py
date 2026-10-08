"""Lê o histórico completo do WhatsApp Business da loja a partir do backup do celular, sem abrir o
WhatsApp Web. O backup (msgstore.db.crypt15) é aberto com a chave de 64 dígitos em
C:\\WhatsAppBackup\\chave.txt e vira C:\\WhatsAppBackup\\msgstore.db (fica só neste PC).

Uso:
  python tools/whats-historico.py 99540665                  conversa inteira com esse número (8 últimos dígitos)
  python tools/whats-historico.py 99540665 --desde 2026-09-01
  python tools/whats-historico.py --buscar "pix"  [--desde 2026-09-01]   mensagens com o texto, em todas as conversas
  python tools/whats-historico.py --abrir                    (re)abre o backup depois de copiar um novo do celular

Mídia: mostra o caminho da foto/PDF/áudio em C:\\WhatsAppBackup\\WhatsApp Business\\Media quando foi copiada;
"(não copiada)" quando o celular não tinha mais ou a pasta não veio."""
import argparse, datetime, os, re, sqlite3, subprocess, sys

PASTA = r"C:\WhatsAppBackup"
BANCO = os.path.join(PASTA, "msgstore.db")
CRIPT = os.path.join(PASTA, "WhatsApp Business", "Databases", "msgstore.db.crypt15")
WADECRYPT = os.path.expandvars(r"%APPDATA%\Python\Python314\Scripts\wadecrypt.exe")
TIPOS = {1: "foto", 2: "áudio", 3: "vídeo", 9: "documento", 13: "gif", 20: "figurinha", 42: "foto única", 43: "vídeo único"}


def abrir():
    chave = re.sub(r"[^0-9a-fA-F]", "", open(os.path.join(PASTA, "chave.txt"), encoding="utf8").read())
    if len(chave) != 64:
        sys.exit("chave.txt precisa ter os 64 dígitos")
    r = subprocess.run([WADECRYPT, chave, CRIPT, BANCO], capture_output=True, text=True)
    if r.returncode or not os.path.exists(BANCO):
        sys.exit("Não abriu o backup:\n" + r.stderr[-500:])
    print("Backup aberto em", BANCO)


def conectar():
    if not os.path.exists(BANCO):
        abrir()
    return sqlite3.connect(f"file:{BANCO}?mode=ro", uri=True)


def chats_do_numero(c, digitos):
    """Chats do número: o JID com telefone e os @lid ligados a ele (contas novas)."""
    jids = [r[0] for r in c.execute("select _id from jid where server='s.whatsapp.net' and user like ?", (f"%{digitos}",))]
    if not jids:
        return []
    marcas = ",".join("?" * len(jids))
    lids = [r[0] for r in c.execute(f"select lid_row_id from jid_map where jid_row_id in ({marcas})", jids)]
    todos = jids + lids
    marcas = ",".join("?" * len(todos))
    return [r[0] for r in c.execute(f"select _id from chat where jid_row_id in ({marcas})", todos)]


def numero_do_chat(c, chat_id):
    r = c.execute("""select coalesce(pj.user, j.user) from chat ch join jid j on j._id = ch.jid_row_id
                     left join jid_map m on m.lid_row_id = j._id left join jid pj on pj._id = m.jid_row_id
                     where ch._id = ?""", (chat_id,)).fetchone()
    return r[0] if r else "?"


def linhas(c, onde, params):
    q = f"""select m.timestamp, m.from_me, m.message_type, m.text_data, mm.file_path, mm.media_caption, mm.media_name, m.chat_row_id
            from message m left join message_media mm on mm.message_row_id = m._id
            where {onde} and m.message_type not in (7, 15, 64) order by m.timestamp"""
    for ts, eu, tipo, texto, arq, legenda, nome, chat in c.execute(q, params):
        quando = datetime.datetime.fromtimestamp(ts / 1000).strftime("%d/%m/%Y %H:%M")
        partes = []
        if tipo in TIPOS:
            caminho = os.path.join(PASTA, "WhatsApp Business", arq.replace("/", os.sep)) if arq else None
            onde_esta = caminho if caminho and os.path.exists(caminho) else "não copiada"
            partes.append(f"[{TIPOS[tipo]}{(' ' + nome) if nome else ''}: {onde_esta}]")
        t = texto or legenda
        if t:
            partes.append(t.replace("\n", " ⏎ "))
        if not partes:
            continue
        yield chat, f"[{quando}] {'Loja' if eu else 'Cliente'}: {' '.join(partes)}"


def main():
    a = argparse.ArgumentParser()
    a.add_argument("numero", nargs="?")
    a.add_argument("--desde")
    a.add_argument("--buscar")
    a.add_argument("--abrir", action="store_true")
    o = a.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    if o.abrir:
        return abrir()
    c = conectar()
    desde = int(datetime.datetime.fromisoformat(o.desde).timestamp() * 1000) if o.desde else 0
    if o.buscar:
        atual = None
        for chat, l in linhas(c, "m.timestamp >= ? and (m.text_data like ? or exists (select 1 from message_media x where x.message_row_id = m._id and x.media_caption like ?))",
                              (desde, f"%{o.buscar}%", f"%{o.buscar}%")):
            if chat != atual:
                atual = chat
                print(f"\n== {numero_do_chat(c, chat)} ==")
            print(l)
        return
    if not o.numero:
        a.error("informe o número (8 últimos dígitos) ou --buscar")
    digitos = re.sub(r"\D", "", o.numero)[-8:]
    chats = chats_do_numero(c, digitos)
    if not chats:
        sys.exit(f"Nenhuma conversa com ...{digitos}")
    marcas = ",".join("?" * len(chats))
    print(f"== {numero_do_chat(c, chats[0])} ==")
    for _, l in linhas(c, f"m.chat_row_id in ({marcas}) and m.timestamp >= ?", (*chats, desde)):
        print(l)


if __name__ == "__main__":
    main()
