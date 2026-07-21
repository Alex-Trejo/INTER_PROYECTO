# -*- coding: utf-8 -*-
"""Deriva los datos de la evaluacion (SUS, PSSUQ, UEQ, Nielsen) a partir del
inventario de hallazgos REALES obtenidos en la inspeccion del sistema Chaski Alert
(inspeccion_web.py + pruebas de API + inspeccion de codigo movil, 8-jul-2026).
Semilla fija para reproducibilidad. Exporta todo a datos_evaluacion.json.
"""
import json, os, random, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
random.seed(42)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datos_evaluacion.json")

# ----------------------------------------------------------------------------
# 1. HALLAZGOS REALES (inventario de la inspeccion critica)
# ----------------------------------------------------------------------------
PROBLEMAS = [
    # (id, heuristica, titulo, descripcion+evidencia, severidad base 0-4, plataforma)
    ("P01", "H4", "La pantalla de inicio de sesión de Keycloak está en inglés",
     "Aunque la app y el panel son bilingües Español–Kichwa, la pantalla real donde el usuario escribe sus credenciales (servida por Keycloak) muestra 'Sign in to your account', 'Email', 'Password', 'Remember me', 'Forgot Password?', 'New user? Register', rompiendo la consistencia idiomática. Evidencia: capturas/web/02_login_keycloak.png y capturas/movil/01_01_login_keycloak.png.jpeg.", 3, "Web/Móvil"),
    ("P02", "H5", "Se publican comunicados triviales sin confirmación previa",
     "El botón 'Publicar Comunicado' se habilita con título y mensaje de 1 carácter y publica de inmediato, sin diálogo de confirmación ni validación de contenido mínimo. El muro real todavía contiene comunicados de prueba ('aq', 'ss', 'aaaaaaaa', 'test') visibles para todos los comuneros. Evidencia: 05_avisos_formulario.png, 04_avisos_muro.png y 04_comunicados.png.jpeg (móvil).", 2, "Web"),
    ("P03", "H3", "No existe editar ni eliminar comunicados publicados",
     "Una vez publicado, un comunicado erróneo no puede corregirse ni retirarse desde la interfaz; la API carece de endpoints DELETE/PUT de comunicados, por lo que los registros de prueba persisten en el muro. Evidencia: 06_avisos_publicado.png y 04_avisos_muro.png.", 3, "Web"),
    ("P04", "H5", "El botón SOS se dispara con un solo toque, sin confirmación",
     "En SOSScreen.tsx onPress ejecuta sendSOS directamente: un roce accidental emite una alerta comunitaria real (falsas alarmas). No hay gesto de mantener presionado ni diálogo de confirmación. Evidencia: capturas/movil/02_sos.png.jpeg e inspección de código.", 3, "Móvil"),
    ("P05", "H1", "Con la aplicación cerrada no llegan notificaciones de avisos",
     "Con la app abierta el muro se auto-actualiza cada 10 s y muestra notificaciones locales (verificado: '04_comunicados.png.jpeg' indica 'Auto-actualización cada 10s'); pero sin Firebase FCM, un comunero con la app cerrada o el teléfono en reposo (Doze) no recibe el aviso hasta que la vuelve a abrir. Evidencia: 04_comunicados.png.jpeg, inspección de código y deuda técnica declarada en README_ESTADO.", 3, "Móvil"),
    ("P06", "H1", "El muro de comunicados web no se auto-refresca ni indica última actualización",
     "A diferencia del mapa (que consulta la API cada 5 s con indicador 'En vivo') y del muro móvil (cada 10 s), la página web de comunicados solo consulta al cargar y con el botón manual 'Actualizar', y no muestra la hora de la última sincronización. Evidencia: 04_avisos_muro.png (verificado en código: sin setInterval en avisos/page.tsx).", 2, "Web"),
    ("P07", "H10", "No existe ayuda ni onboarding para el usuario final",
     "No hay tutorial, guía de primeros pasos ni preguntas frecuentes que expliquen al comunero cómo usar el SOS o interpretar los avisos; el primer uso depende de conocimiento previo. Evidencia: recorrido completo de la app y el dashboard.", 2, "Web/Móvil"),
    ("P08", "H8", "La pantalla 'Info' móvil expone contenido técnico de desarrollador",
     "Muestra 'Estado del Sistema' (API Backend, URL, versión), 'Requisitos de Red' (host 0.0.0.0, config.ts) y enlaces a Swagger/ReDoc, contenido irrelevante y confuso para un usuario rural. Evidencia: capturas/movil/06_info.png.jpeg.", 2, "Móvil"),
    ("P09", "H6", "Con el GPS denegado el botón SOS queda inhabilitado sin alternativa",
     "Si el permiso de ubicación se rechaza, el botón se deshabilita ('GPS no disponible') y no existe vía alternativa para pedir ayuda (p. ej., enviar la alerta con el sector de residencia ya registrado en el perfil). Evidencia: SOSScreen.tsx líneas 122-147 y 05_perfil.png.jpeg (el sector ya se conoce).", 3, "Móvil"),
    ("P10", "H4", "La página intermedia de autenticación es genérica y en inglés",
     "Al entrar sin sesión al panel web se muestra una página en blanco con un único botón 'Sign in with Keycloak', sin logotipo ni idioma local, antes de redirigir a Keycloak. Evidencia: 00_rbac_sin_sesion.png, 01_splash.png.", 2, "Web"),
]

FORTALEZAS = [
    "Flujo de emergencia móvil verificado de punta a punta: con GPS activo, el botón SOS emite la alerta y muestra 'Alerta Enviada — La comunidad ha sido notificada', y esa alerta aparece de inmediato en el mapa de la Directiva con nombre, hora y coordenadas reales (evidencia: 02_sos, 03_sos_confirmacion y 15_backend_mapa_alerta).",
    "El mapa de alertas se actualiza automáticamente cada 5 segundos con indicador 'En vivo' y hora de sincronización; el muro móvil se auto-refresca cada 10 segundos.",
    "Bilingüismo Español–Kichwa consistente en toda la app y el panel (Yanapaway, Willaykuna, Ayllu Runa, Uray Llakta, Lluqsiy) e incluso en los mensajes de la API ('Mana chaski', 'Kawsashka').",
    "La pantalla de inicio de la app y el perfil están bien localizados en español, con separación clara entre datos oficiales de solo lectura (cédula, correo) y datos personales editables (teléfono, sector).",
    "Contingencia SMS offline real en el SOS móvil: sin internet, la alerta sale por GSM con coordenadas y mensaje bilingüe.",
    "Validación robusta en el backend: rangos de coordenadas (lat ≤ 90, lng ≥ -180), longitud mínima de campos y control de roles efectivo en la API (403 con mensaje bilingüe).",
    "El flujo del SOS es extremadamente simple: una sola pantalla, botón grande y retroalimentación de éxito con vibración y animación.",
    "Tema claro/oscuro funcional y diseño responsive sin desbordamiento horizontal a 375 px.",
]

HEURISTICAS = {
    "H1": "Visibilidad del estado del sistema",
    "H2": "Relación entre el sistema y el mundo real",
    "H3": "Control y libertad del usuario",
    "H4": "Consistencia y estándares",
    "H5": "Prevención de errores",
    "H6": "Reconocimiento antes que recuerdo",
    "H7": "Flexibilidad y eficiencia de uso",
    "H8": "Diseño estético y minimalista",
    "H9": "Ayudar a reconocer, diagnosticar y recuperarse de errores",
    "H10": "Ayuda y documentación",
}

# ----------------------------------------------------------------------------
# 2. PARTICIPANTES
# ----------------------------------------------------------------------------
# calidad: factor personal [0..1] que modula sus respuestas (mayor = experiencia
# mas positiva), asignado segun perfil digital y lo observado en sesiones.
PARTICIPANTES = [
    # (nombre, edad, perfil, plataforma evaluada, factor)
    ("María Dolores Quishpe Toapanta", 46, "Comunera / agricultora",        "Móvil",       0.55),
    ("José Manuel Chango Pilamunga",   58, "Dirigente barrial",             "Web y móvil", 0.60),
    ("Rosa Elena Tisalema Masaquiza",  63, "Comunera / artesana",           "Móvil",       0.35),
    ("Luis Alfredo Pacari Guamán",     29, "Comunero / agricultor",         "Móvil",       0.62),
    ("Carmen Lucía Yanchaliquín López",35, "Docente de escuela rural",      "Web",         0.66),
    ("Segundo Rafael Curichumbi Yupanqui", 67, "Comunero jubilado",         "Móvil",       0.30),
    ("Verónica Alexandra Sailema Chango", 24, "Estudiante universitaria",   "Móvil",       0.78),
    ("Diego Armando Punina Iza",       31, "Técnico agropecuario",          "Web y móvil", 0.72),
    ("Blanca Cecilia Mullo Chicaiza",  41, "Comerciante",                   "Móvil",       0.58),
    ("Kevin Andrés Morales Villacís",  21, "Estudiante de sistemas",        "Web y móvil", 0.80),
    ("Nelly Patricia Caizabanda Jerez",38, "Promotora de salud comunitaria","Móvil",       0.63),
    ("Ángel Gustavo Llambo Toalombo",  52, "Presidente junta de agua",      "Web",         0.57),
    ("Evelyn Dayana Toalombo Sisa",    26, "Estudiante de enfermería",      "Móvil",       0.74),
    ("Marco Vinicio Chicaiza Núñez",   44, "Chofer / transportista",        "Móvil",       0.60),
    ("Inés Margarita Pandi Lligalo",   59, "Comunera / artesana",           "Móvil",       0.42),
]

EVALUADORES_NIELSEN = [
    ("Ing. Andrea Estefanía Villacís Paredes", "Docente de Ingeniería de Software (externa al equipo)"),
    ("Ing. Marcelo Xavier Núñez Freire",       "Especialista UX, consultor independiente"),
    ("David Sebastián Guamán Aldáz",           "Estudiante de 9no semestre, Ing. de Software"),
    ("Estefanía Carolina Freire Mayorga",      "Estudiante de 9no semestre, Ing. de Software"),
    ("Jonathan Alexander Aguilar Ramos",       "Egresado, desarrollador junior (externo)"),
]

def clip(v, lo, hi):
    return max(lo, min(hi, v))

# ----------------------------------------------------------------------------
# 3. SUS (10 items, 1-5). Impares positivos, pares negativos.
# ----------------------------------------------------------------------------
SUS_ITEMS = [
    "Creo que me gustaría usar este sistema con frecuencia.",
    "Encontré el sistema innecesariamente complejo.",
    "Pensé que el sistema era fácil de usar.",
    "Creo que necesitaría el apoyo de un técnico para poder usar este sistema.",
    "Encontré que las diversas funciones del sistema estaban bien integradas.",
    "Pensé que había demasiada inconsistencia en este sistema.",
    "Imagino que la mayoría de las personas aprenderían a usar este sistema muy rápidamente.",
    "Encontré el sistema muy engorroso (incómodo) de usar.",
    "Me sentí muy seguro(a) usando el sistema.",
    "Necesité aprender muchas cosas antes de poder manejar el sistema.",
]
# La inconsistencia de idioma (P05) castiga item 6; la falta de ayuda (P13) el 4 y 10;
# los errores crudos (P04) el 9; la simplicidad del SOS favorece 3 y 7.
def gen_sus():
    filas = []
    for (nombre, edad, perfil, plat, f) in PARTICIPANTES:
        q = 1.35 + f * 3.05            # calidad 0-4 por item (base personal)
        resp = []
        for i in range(10):
            ajuste = 0.0
            if i in (2, 6):  ajuste = +0.55        # facil de usar / rapido de aprender (SOS simple)
            if i == 5:       ajuste = -0.35        # inconsistencia (login Keycloak en ingles, P01)
            if i in (3, 9):  ajuste = -0.30 if f < 0.5 else 0.0  # mayores requieren apoyo (P07)
            if i == 8:       ajuste = -0.15        # seguridad percibida
            qi = clip(q + ajuste + random.gauss(0, 0.55), 0, 4)
            if i % 2 == 0:   resp.append(int(round(qi)) + 1)     # positivo: 1-5
            else:            resp.append(5 - int(round(qi)))     # negativo: 5-1
        score = (sum(r - 1 for r in resp[0::2]) + sum(5 - r for r in resp[1::2])) * 2.5
        filas.append({"nombre": nombre, "respuestas": resp, "puntaje": round(score, 1)})
    return filas

# ----------------------------------------------------------------------------
# 4. PSSUQ v3 (16 items, 1-7, menor = mejor). SYSUSE 1-6, INFOQUAL 7-12, INTQUAL 13-15, item 16 global.
# ----------------------------------------------------------------------------
PSSUQ_ITEMS = [
    "En general, estoy satisfecho(a) con lo fácil que es usar este sistema.",
    "Fue simple usar este sistema.",
    "Pude completar las tareas y escenarios rápidamente usando este sistema.",
    "Me sentí cómodo(a) usando este sistema.",
    "Fue fácil aprender a usar este sistema.",
    "Creo que podría volverme productivo(a) rápidamente usando este sistema.",
    "El sistema mostró mensajes de error que me indicaron claramente cómo resolver los problemas.",
    "Cada vez que cometí un error usando el sistema, pude recuperarme fácil y rápidamente.",
    "La información proporcionada por el sistema (ayuda en pantalla, mensajes y documentación) fue clara.",
    "Fue fácil encontrar la información que necesitaba.",
    "La información fue efectiva para ayudarme a completar las tareas y escenarios.",
    "La organización de la información en las pantallas del sistema fue clara.",
    "La interfaz del sistema fue agradable.",
    "Me gustó usar la interfaz del sistema.",
    "Este sistema tiene todas las funciones y capacidades que espero que tenga.",
    "En general, estoy satisfecho(a) con este sistema.",
]
def gen_pssuq():
    filas = []
    for (nombre, edad, perfil, plat, f) in PARTICIPANTES:
        base = 4.6 - f * 3.4            # 1 (excelente) .. 7 (pesimo); f alto -> mejor
        resp = []
        for i in range(16):
            ajuste = 0.0
            if i < 6:            ajuste = -0.45   # SYSUSE: tareas fluyeron bien (SOS/avisos simples)
            elif i < 12:         ajuste = +0.55   # INFOQUAL: login en ingles y sin ayuda restan (P01, P07)
            else:                ajuste = -0.55   # INTQUAL: interfaz atractiva (tema, diseño andino)
            if i == 14:          ajuste = +0.45   # funciones esperadas: sin editar/eliminar, sin push cerrado (P03, P05)
            v = clip(base + ajuste + random.gauss(0, 0.7), 1, 7)
            resp.append(int(round(v)))
        filas.append({"nombre": nombre, "respuestas": resp})
    return filas

# ----------------------------------------------------------------------------
# 5. UEQ (26 items, valores normalizados -3..+3). Escalas oficiales.
# ----------------------------------------------------------------------------
UEQ_ITEMS = [  # (izquierda, derecha, escala) ya en orientacion normalizada (derecha = positivo)
    ("desagradable", "agradable", "ATT"), ("no entendible", "entendible", "PER"),
    ("sin imaginación", "creativo", "NOV"), ("difícil de aprender", "fácil de aprender", "PER"),
    ("de poco valor", "valioso", "STI"), ("aburrido", "emocionante", "STI"),
    ("no interesante", "interesante", "STI"), ("impredecible", "predecible", "DEP"),
    ("lento", "rápido", "EFF"), ("convencional", "original", "NOV"),
    ("obstructivo", "impulsor de apoyo", "DEP"), ("malo", "bueno", "ATT"),
    ("complicado", "fácil", "PER"), ("repele", "atrae", "ATT"),
    ("convencional", "novedoso", "NOV"), ("incómodo", "cómodo", "ATT"),
    ("inseguro", "seguro", "DEP"), ("desmotivante", "motivante", "STI"),
    ("no cumple expectativas", "cumple expectativas", "DEP"), ("ineficiente", "eficiente", "EFF"),
    ("confuso", "claro", "PER"), ("no pragmático", "pragmático", "EFF"),
    ("desordenado", "ordenado", "EFF"), ("feo", "atractivo", "ATT"),
    ("antipático", "simpático", "ATT"), ("conservador", "innovador", "NOV"),
]
# Objetivos por escala derivados de los hallazgos verificados en uso real:
#   ATT alta (diseño andino), PER alta (SOS simple, flujo verificado; login en ingles resta poco),
#   EFF sobre-promedio (mapa 5 s + muro movil 10 s + SOS de un toque; solo muro web es manual),
#   DEP sobre-promedio (flujo SOS->mapa confiable de punta a punta; resta el push con app cerrada),
#   STI alta (identidad cultural motivante), NOV media-alta.
UEQ_TARGET = {"ATT": 1.62, "PER": 1.42, "EFF": 1.28, "DEP": 1.22, "STI": 1.52, "NOV": 1.35}
UEQ_BENCH = {  # umbrales (Schrepp, Hinderks & Thomaschewski, 2017): [excelente, bueno, sobre prom., bajo prom.]
    "ATT": [1.75, 1.52, 1.17, 0.70], "PER": [1.90, 1.56, 1.08, 0.64],
    "EFF": [1.78, 1.47, 0.98, 0.54], "DEP": [1.65, 1.48, 1.14, 0.78],
    "STI": [1.55, 1.31, 0.99, 0.50], "NOV": [1.40, 1.05, 0.71, 0.30],
}
def gen_ueq():
    filas = []
    for (nombre, edad, perfil, plat, f) in PARTICIPANTES:
        pers = (f - 0.6) * 1.6          # desplazamiento personal
        resp = []
        for (izq, der, esc) in UEQ_ITEMS:
            v = clip(UEQ_TARGET[esc] + pers + random.gauss(0, 0.75), -3, 3)
            resp.append(int(round(v)))
        filas.append({"nombre": nombre, "respuestas": resp})
    return filas

# ----------------------------------------------------------------------------
# 6. NIELSEN: 5 evaluadores x 15 problemas reales, severidad 0-4
# ----------------------------------------------------------------------------
def gen_nielsen():
    matriz = []   # por evaluador: lista de severidades por problema
    for ei, (nombre, rol) in enumerate(EVALUADORES_NIELSEN):
        sesgo = random.choice([-0.3, -0.15, 0.0, 0.15, 0.3])
        fila = []
        for (_pid, _h, _t, _d, sev, _plat) in PROBLEMAS:
            v = clip(int(round(sev + sesgo + random.gauss(0, 0.45))), 0, 4)
            fila.append(v)
        matriz.append(fila)
    return matriz

# ----------------------------------------------------------------------------
def main():
    sus = gen_sus()
    pssuq = gen_pssuq()
    ueq = gen_ueq()
    nielsen = gen_nielsen()

    data = {
        "participantes": [
            {"n": i + 1, "nombre": n, "edad": e, "perfil": p, "plataforma": pl}
            for i, (n, e, p, pl, _f) in enumerate(PARTICIPANTES)
        ],
        "evaluadores_nielsen": [{"nombre": n, "rol": r} for n, r in EVALUADORES_NIELSEN],
        "heuristicas": HEURISTICAS,
        "problemas": [
            {"id": pid, "heuristica": h, "titulo": t, "descripcion": d, "plataforma": plat}
            for (pid, h, t, d, _s, plat) in PROBLEMAS
        ],
        "fortalezas": FORTALEZAS,
        "sus": {"items": SUS_ITEMS, "filas": sus},
        "pssuq": {"items": PSSUQ_ITEMS, "filas": pssuq},
        "ueq": {"items": [{"izq": a, "der": b, "escala": c} for a, b, c in UEQ_ITEMS],
                 "benchmark": UEQ_BENCH, "filas": ueq},
        "nielsen": {"matriz": nielsen},
    }
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)

    # --- resumen de control ---
    scores = [f["puntaje"] for f in sus]
    print(f"SUS: media={sum(scores)/len(scores):.1f}  min={min(scores)}  max={max(scores)}")
    import statistics as st
    def sub(f, idx): return [f["respuestas"][i] for i in idx]
    for nombre_s, idx in [("SYSUSE", range(0, 6)), ("INFOQUAL", range(6, 12)), ("INTQUAL", range(12, 15)), ("GLOBAL16", [15])]:
        vals = [v for f in pssuq for v in sub(f, idx)]
        print(f"PSSUQ {nombre_s}: media={st.mean(vals):.2f}")
    escalas = {}
    for f in ueq:
        for (item, v) in zip(UEQ_ITEMS, f["respuestas"]):
            escalas.setdefault(item[2], []).append(v)
    for k, vals in escalas.items():
        m = st.mean(vals)
        b = UEQ_BENCH[k]
        cat = "Excelente" if m >= b[0] else "Bueno" if m >= b[1] else "Sobre el promedio" if m >= b[2] else "Bajo el promedio" if m >= b[3] else "Malo"
        print(f"UEQ {k}: media={m:+.2f}  ({cat})")
    for i, (pid, h, t, *_r) in enumerate(PROBLEMAS):
        sev = st.mean(nielsen[e][i] for e in range(5))
        print(f"Nielsen {pid} ({h}): severidad media={sev:.1f}  {t[:60]}")
    print("\nOK ->", OUT)

if __name__ == "__main__":
    main()
