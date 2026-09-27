import re

for filepath in ['src/pages/GestionComedor.tsx', 'src/pages/EditarComedor.tsx']:
    with open(filepath, 'rb') as f:
        text = f.read().decode('utf-8')
    
    # Remover 'building' de las clases válidas
    text = text.replace("['highway', 'place', 'building']", "['highway', 'place']")
    
    with open(filepath, 'wb') as f:
        f.write(text.encode('utf-8'))
        
print("Clase building eliminada.")
