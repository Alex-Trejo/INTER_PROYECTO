# Pruebas unitarias — Chaski Alert

Evidencia de pruebas para el documento **IM-03 (Guía de Estándares y Buenas
Prácticas)**.

| Aplicación | Herramienta | Pruebas | Tiempo |
|---|---|---|---|
| Backend (FastAPI) | pytest 9.1 | **53** | 1.3 s |
| Panel web (Next.js) | Jest 30 + Testing Library | **22** | 1.3 s |
| App móvil (Expo) | jest-expo 54 | **29** | 21 s |
| **Total** | | **104** | |

Todas pasan sin necesidad de Docker, base de datos ni Keycloak: son pruebas
**unitarias reales**, no de integración.

---

## Cómo ejecutarlas

```powershell
# Backend
cd Backend
.\venv\Scripts\Activate.ps1
pytest

# Panel web
cd Frontend\cliente_web
npm test

# App móvil
cd Frontend\cliente_movil
npm test
```

---

## Qué se prueba y por qué

Las pruebas se eligieron para **cubrir las correcciones documentadas en la
evaluación de usabilidad**, de modo que cada una protege un problema real
detectado con usuarios.

### Backend — `Backend/tests/`

| Archivo | Cubre | Problema |
|---|---|---|
| `test_comunicados_validacion.py` | Rechaza títulos y mensajes triviales (`'aq'`, `'ss'`, `'test'`) que llegaron a contaminar el muro real | **P02** |
| `test_alertas_validacion.py` | Rangos geográficos válidos (lat −90..90, lng −180..180) y estados permitidos de una incidencia | CU-04/06 |
| `test_push_dispositivos.py` | Registro del token FCM y el registro seguro en consola | **P05** |

### Panel web — `Frontend/cliente_web/__tests__/`

| Archivo | Cubre | Problema |
|---|---|---|
| `tiempo.test.ts` | `timeSince()`: el "hace 5 min" de las tarjetas y el manejo de la zona horaria de Ecuador | — |
| `ComunicadoCard.test.tsx` | Botones de corregir y retirar, y que avisen con el comunicado correcto | **P03** |

### App móvil — `Frontend/cliente_movil/__tests__/`

| Archivo | Cubre | Problema |
|---|---|---|
| `push.test.ts` | Permisos de Android 13+, canal de máxima prioridad y registro del dispositivo | **P05** |
| `onboarding.test.ts` | Cuándo se muestra la guía y que su contenido cubra SOS, avisos y sector | **P07** |

---

## Un defecto encontrado por las pruebas

`timeSince()` decidía si una fecha ya traía zona horaria con:

```ts
dateStr.includes("+") || dateStr.includes("Z")
```

Esa comprobación **no detecta un desplazamiento negativo** como `-05:00`: se le
añadía un segundo offset y la tarjeta mostraba `hace NaNd`. Hoy el backend
devuelve las fechas sin zona horaria, así que no se manifestaba; pero habría
aparecido en cuanto se cambiara la columna a `TIMESTAMPTZ`.

Corregido comprobando el final de la cadena:

```ts
const yaTieneZonaHoraria = /(?:Z|[+-]\d{2}:?\d{2})$/.test(dateStr);
```

---

## Decisiones técnicas

**Scripts de depuración apartados.** `test_aprobar.py` y `test_http.py` estaban
en `Backend/` y empezaban por `test_`, así que pytest los habría ejecutado: el
primero **se conecta a la base de datos real y modifica un usuario**. Se movieron
a `Backend/scripts_debug/` y se excluyeron en `pytest.ini`.

**Sin dependencias externas.** Las pruebas del backend no levantan la API ni
consultan Keycloak; validan los esquemas Pydantic y la lógica de `core/push.py`
con dobles de prueba. Por eso corren en 1.3 segundos.

**Interfaz móvil sin renderizado.** `@testing-library/react-native` 14.0.1 no es
compatible con React 19.1 en este preset: su `render` devuelve un objeto vacío.
Las pruebas del móvil verifican la lógica y el contenido (exportando `PASOS`),
que es donde está el valor; el renderizado se cubre con las pruebas manuales en
dispositivo real documentadas en la evaluación.

**`babel.config.js` añadido.** Expo lo omite porque Metro aplica
`babel-preset-expo` implícitamente, pero Jest sí lo necesita. Declara el mismo
preset, así que no altera el build nativo.
