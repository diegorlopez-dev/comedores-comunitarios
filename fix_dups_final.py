def fix_dups(filepath):
    with open(filepath, 'rb') as f:
        text = f.read().decode('utf-8')
    
    bad_lines = """      const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';
      let latitud = parseFloat(geoData[0].lat);
      let longitud = parseFloat(geoData[0].lon);"""
    
    bad_lines2 = """      const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';
        let latitud = parseFloat(geoData[0].lat);
        let longitud = parseFloat(geoData[0].lon);"""
        
    bad_lines3 = """        const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';
        let latitud = parseFloat(geoData[0].lat);
        let longitud = parseFloat(geoData[0].lon);"""
    
    text = text.replace(bad_lines, "").replace(bad_lines2, "").replace(bad_lines3, "")
    
    # Check if there are still addr references
    if "addr." in text:
        # replace any remaining manually using regex
        import re
        text = re.sub(r'\s*const barrioDetectado = addr\.suburb.*?;', '', text)
        text = re.sub(r'\s*let latitud = parseFloat\(geoData\[0\]\.lat\);', '', text)
        text = re.sub(r'\s*let longitud = parseFloat\(geoData\[0\]\.lon\);', '', text)

    with open(filepath, 'wb') as f:
        f.write(text.encode('utf-8'))

fix_dups('src/pages/GestionComedor.tsx')
fix_dups('src/pages/EditarComedor.tsx')
print("Fix applied")
