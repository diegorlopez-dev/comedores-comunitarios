import re

def fix_gestion():
    with open('src/pages/GestionComedor.tsx', 'rb') as f:
        text = f.read().decode('utf-8')
    
    # 1. Definir direccionOficial
    insert_pos = text.find("const barrioDetectado")
    if insert_pos != -1:
        new_code = """const numeroIngresado = direccion.match(/\\d+/)?.[0] || '';
      const direccionOficial = `${addr.road} ${addr.house_number || numeroIngresado}`.trim();
      """
        text = text[:insert_pos] + new_code + text[insert_pos:]

    # 2. Reemplazar direccion por direccionOficial en el insert
    text = text.replace(
        "{ nombre, barrio: barrioDetectado, direccion,",
        "{ nombre, barrio: barrioDetectado, direccion: direccionOficial,"
    )

    # 3. Cambiar mensaje de éxito y timeout
    text = text.replace(
        "setSuccessMsg('¡Comedor guardado con éxito! Redirigiendo...');",
        "setSuccessMsg(`¡Comedor guardado con éxito! Se registró la dirección: \"${direccionOficial}\". Si no es correcta, podés corregirla desde Editar.`);"
    )
    text = text.replace(
        "setTimeout(() => navigate('/perfil'), 2000);",
        "setTimeout(() => navigate('/perfil'), 5000);"
    )

    with open('src/pages/GestionComedor.tsx', 'wb') as f:
        f.write(text.encode('utf-8'))


def fix_editar():
    with open('src/pages/EditarComedor.tsx', 'rb') as f:
        text = f.read().decode('utf-8')
    
    # 1. Definir direccionOficial
    insert_pos = text.find("const barrioDetectado")
    if insert_pos != -1:
        new_code = """const numeroIngresado = direccion.match(/\\d+/)?.[0] || '';
      const direccionOficial = `${addr.road} ${addr.house_number || numeroIngresado}`.trim();
      """
        text = text[:insert_pos] + new_code + text[insert_pos:]

    # 2. Reemplazar direccion por direccionOficial en el payload
    text = text.replace(
        "barrio: barrioDetectado,\n          direccion,",
        "barrio: barrioDetectado,\n          direccion: direccionOficial,"
    )

    # 3. Cambiar mensaje de éxito y timeout
    text = text.replace(
        "setSuccessMsg('¡Comedor actualizado con éxito!');",
        "setSuccessMsg(`¡Comedor actualizado con éxito! Se registró la dirección oficial: \"${direccionOficial}\".`);"
    )
    text = text.replace(
        "setTimeout(() => navigate('/perfil'), 1500);",
        "setTimeout(() => navigate('/perfil'), 4000);"
    )

    with open('src/pages/EditarComedor.tsx', 'wb') as f:
        f.write(text.encode('utf-8'))

fix_gestion()
fix_editar()
print("Terminado")
