# Print.Balls — sitio de prueba

Sitio estático preparado para GitHub Pages.

## Archivos

- `index.html`: estructura del sitio.
- `styles.css`: diseño responsive.
- `script.js`: catálogo, filtros, ficha y carrito.
- `assets/`: fotografías y favicon.

## Probar en el computador

Puedes abrir `index.html` directamente en el navegador. Para una prueba más fiel, usa un servidor local:

```bash
python3 -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Subir a GitHub Pages

1. Sube todos los archivos respetando la misma estructura.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`.

## Antes de recibir pedidos reales

En `script.js`, reemplaza el valor vacío de `WHATSAPP_NUMBER` por el número del negocio con código de país y sin símbolos. Ejemplo: `56912345678`.

El pago con tarjeta, el cálculo automático de despacho, los precios de packs y las políticas finales deben conectarse o confirmarse antes del lanzamiento comercial.
