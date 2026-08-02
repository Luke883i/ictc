# Protocollo Git: blob, tree, commit, ref e readback

## Blob

Per ogni contenuto UTF-8 o binario:

```text
blob_id = SHA1("blob " + byte_length + NUL + bytes)
```

La receipt pre-commit ricalcola l'ID e lo confronta con l'index Git. Su GitHub l'azione `create_blob` restituisce il blob SHA scritto.

## Tree

Un tree contiene mode, nome e object ID. Il tree candidato deve essere costruito sul tree del parent, modificando soltanto i path autorizzati. Il bundle calcola il tree SHA direttamente dall'index; il self-test lo confronta con `git write-tree`.

## Commit

Il commit lega:

- tree;
- parent esplicito;
- autore/committer;
- timestamp;
- messaggio.

Il parent e un vincolo di concorrenza: se il ref e avanzato, ricostruisci il tree sul nuovo parent invece di forzare.

## Ref

Aggiorna il branch solo in fast-forward. Con GitHub API usa `force=false`. Un fallimento di non-fast-forward e un segnale di drift, non un errore da aggirare.

## Readback obbligatorio

Dopo la scrittura verifica:

1. commit SHA e parent;
2. diff e file interessati;
3. branch HEAD;
4. PR head e mergeability, se applicabile;
5. status/check relativi al nuovo SHA.

## Receipt minima

```json
{
  "parent": "<sha>",
  "tree": "<sha>",
  "blobs": [{"path":"...","sha":"..."}],
  "tests": [{"command":["..."],"returncode":0}],
  "ref_update": {"force": false},
  "readback": {"commit_verified": true, "ci": "NOT_OBSERVED"}
}
```
