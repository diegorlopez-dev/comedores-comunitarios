with open('src/pages/PanelVoluntario.tsx', 'rb') as f:
    raw = f.read()
text = raw.decode('utf-8')

# The first fix didn't catch it because it still has the same bad pattern
# Let's find and print exactly what's there
import re
matches = list(re.finditer(r'className=\{[\x00-\x1f\x08]', text))
for m in matches:
    start = m.start()
    end = text.find('}', start) + 1
    bad = text[start:end]
    print('BAD:', repr(bad))

# Do a blanket fix with regex
def fix_classnames(text):
    # Match className={<ctrl-char>text } patterns
    pattern = re.compile(r'className=\{([\x08\x14\x1b][^}]*)\}')
    def replacer(m):
        inner = m.group(1)
        # strip the control char prefix
        inner = re.sub(r'^[\x00-\x1f]', '', inner)
        return 'className={"' + inner + '"}'
    return pattern.sub(replacer, text)

text = fix_classnames(text)

with open('src/pages/PanelVoluntario.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
print('Done')
