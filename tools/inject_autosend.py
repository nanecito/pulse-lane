"""Insert tools/autosend.snippet.html before the last </body> of every game that
has a Save path. Idempotent: an existing AUTOSEND block is replaced."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
snip = (root/'tools/autosend.snippet.html').read_text()
done = []
for f in sorted(root.glob('*.html')):
    s = f.read_text()
    if not re.search(r"\.ndjson", s):
        continue
    s = re.sub(r"<script>\n/\* AUTOSEND.*?</script>\n", "", s, flags=re.S)
    i = s.rfind('</body>')
    s = (s[:i] + snip + s[i:]) if i >= 0 else (s + '\n' + snip)
    f.write_text(s); done.append(f.name)
print(len(done), ' '.join(done))
