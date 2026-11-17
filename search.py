#!/usr/bin/env python3
"""Otsi Riigikogu alliktekstidest. Vajab ainult Python 3 standardteeki."""
import argparse
import json
from pathlib import Path
import re
import sqlite3

ROOT = Path(__file__).resolve().parent

def connect():
    db = sqlite3.connect(':memory:')
    db.execute('CREATE VIRTUAL TABLE documents USING fts5(id UNINDEXED, submitter, title, topics, text, tokenize="unicode61 remove_diacritics 0")')
    records = {}
    for path in sorted((ROOT / 'data').glob('*.jsonl')):
        for line in path.read_text(encoding='utf-8').splitlines():
            if not line.strip():
                continue
            record = json.loads(line)
            if record['id'] in records:
                raise ValueError('Korduv dokumendi ID: ' + record['id'])
            records[record['id']] = record
            db.execute('INSERT INTO documents VALUES (?, ?, ?, ?, ?)', (
                record['id'], record['submitter'], record['title'],
                ' '.join(record['topics']), record['text']))
    return db, records

def main():
    parser = argparse.ArgumentParser(description='Täistekstiotsing arvamustest; sõnad peavad kõik leiduma. Otsib ka sõna alguse järgi.')
    parser.add_argument('query', nargs='?', default='')
    parser.add_argument('--submitter', default='', help='Esitaja nime osa')
    parser.add_argument('--topic', default='', help='Teemasildi osa')
    parser.add_argument('--limit', type=int, default=10)
    parser.add_argument('--json', action='store_true', help='Väljund JSON-vormingus')
    args = parser.parse_args()
    if args.limit < 1:
        parser.error('--limit peab olema positiivne')
    db, records = connect()
    terms = re.findall(r'\w+', args.query, flags=re.UNICODE)
    if terms:
        match = ' AND '.join('"' + term + '"*' for term in terms)
        hits = db.execute('SELECT id, snippet(documents, 4, "[", "]", " … ", 40) FROM documents WHERE documents MATCH ? ORDER BY bm25(documents)', (match,)).fetchall()
    else:
        hits = [(r['id'], r['text'][:300]) for r in sorted(records.values(), key=lambda r: r['listed_date'], reverse=True)]
    output = []
    for doc_id, excerpt in hits:
        r = records[doc_id]
        if args.submitter.casefold() not in r['submitter'].casefold():
            continue
        if args.topic.casefold() not in ' '.join(r['topics']).casefold():
            continue
        output.append({k: r[k] for k in ['id', 'listed_date', 'submitter', 'title', 'document_type', 'topics', 'source_url']})
        output[-1]['excerpt'] = excerpt
        if len(output) >= args.limit:
            break
    if args.json:
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        for r in output:
            print(f"{r['listed_date']} | {r['submitter']} | {r['id']}")
            print(r['excerpt'])
            print(r['source_url'] + '\n')
        print(f'Tulemusi: {len(output)}')

if __name__ == '__main__':
    main()
