[Imagen del documento original omitida para legibilidad]

__Universidad de las Fuerzas Armadas ESPE__

Departamento de Ciencias de la Computación

Carrera de Ingeniería de Software

Desarrollo de Software Aplicado al Dominio de la Interculturalidad \- NRC 30745

__CHASKI ALERT__

Sistema de Alerta Comunitaria Intercultural

*Plataforma bilingüe Español–Kichwa de seguridad comunitaria para zonas rurales: una aplicación móvil con botón SOS georreferenciado y contingencia por SMS sin internet, un panel web de monitoreo en tiempo real para la directiva comunal \(mapa de alertas, comunicados, membresías\) y un backend con autenticación por roles\.*

__INFORME TÉCNICO — EVALUACIÓN DE CASOS__

*Aplicación de métricas de evaluación de usabilidad \(PSSUQ\) y experiencia de usuario \(UEQ\), con contraste frente a SUS y la evaluación heurística de Jakob Nielsen*

Alejandro Andrade

Alex Trejo

Allan Panchi

Milena Maldonado

8 de julio de 2026

# 1\. Introducción

El presente informe técnico documenta la evaluación de la calidad en uso del sistema Chaski Alert, un sistema de alerta comunitaria con identidad intercultural Kichwa orientado a comunidades rurales de la sierra ecuatoriana\. El sistema está compuesto por tres piezas: \(a\) una aplicación móvil \(Expo/React Native\) orientada al comunero, cuyo flujo central es un botón SOS georreferenciado con contingencia por SMS cuando no existe conexión a internet; \(b\) un panel web de monitoreo \(Next\.js 16\) reservado a la Directiva comunal, con mapa de alertas en Leaflet, muro de comunicados, historial de incidencias y gestión de membresías; y \(c\) un backend FastAPI con base de datos PostGIS y autenticación federada mediante Keycloak con dos roles: Directiva y Comunero\. Toda la interfaz incorpora bilingüismo Español–Kichwa \(Yanapaway, Willaykuna, Ayllu, Lluqsiy\) e iconografía andina como eje de pertinencia cultural\.

En evaluaciones anteriores el sistema ya había sido revisado con la escala SUS y con las diez heurísticas de Jakob Nielsen\. Para el presente informe se investigaron métricas alternativas reconocidas en la literatura y se seleccionaron dos instrumentos distintos: PSSUQ v3 \(Post\-Study System Usability Questionnaire\) como métrica de usabilidad y UEQ \(User Experience Questionnaire\) como métrica de experiencia de usuario\. Ambos se aplicaron a 15 participantes externos al equipo de desarrollo sobre el sistema en ejecución, y —para disponer de una base de comparación homogénea— en la misma sesión se aplicó también la escala SUS y una evaluación heurística de Nielsen con cinco evaluadores\. Los hallazgos que sustentan las calificaciones provienen de una inspección crítica real del sistema en vivo realizada el 5 de julio de 2026 \(recorrido completo del panel web de la Directiva, emisión de una alerta SOS real desde el cliente móvil físico con verificación de su llegada al mapa, y revisión de cada pantalla de la app\), cuyas evidencias se conservan en la carpeta de capturas adjunta\.

# 2\. Fundamentación teórica

## 2\.1\. Investigación de métricas de evaluación \(Paso 1\)

Se revisaron los instrumentos de evaluación de usabilidad y experiencia de usuario más citados en la literatura, resumidos en la Tabla 1, valorando su enfoque, extensión y pertinencia para un sistema de emergencias comunitario e intercultural\.

*Tabla 1\. Métricas investigadas y valoración de pertinencia para Chaski Alert\.*

__Métrica__

__Qué mide__

__Ítems__

__Tipo__

__Pertinencia para el proyecto__

UEQ \(Laugwitz et al\., 2008\)

UX integral: escalas pragmáticas y hedónicas

26

Cuestionario post\-uso

Alta: separa lo funcional de lo emocional\-cultural; benchmark internacional

AttrakDiff \(Hassenzahl, 2003\)

Cualidad pragmática vs\. hedónica

28

Diferencial semántico

Media: solapa con UEQ, sin benchmark abierto

UMUX \(Finstad, 2010\)

Usabilidad percibida \(proxy de SUS\)

4

Cuestionario post\-uso

Media: demasiado corto para diagnosticar

PSSUQ v3 \(Lewis, 2002\)

Usabilidad post\-estudio con 3 subescalas

16

Cuestionario post\-estudio

Alta: la subescala INFOQUAL diagnostica mensajes de error y ayuda

CSUQ \(Lewis, 1995\)

Versión de campo del PSSUQ

19

Cuestionario

Media: equivalente al PSSUQ elegido

NASA\-TLX \(Hart & Staveland, 1988\)

Carga cognitiva de la tarea

6

Escala de carga de trabajo

Baja: las tareas del sistema son deliberadamente simples

SEQ \(Sauro & Dumas, 2009\)

Dificultad percibida por tarea

1

Post\-tarea

Complementaria: no cubre el sistema completo

SUPR\-Q \(Sauro, 2015\)

Calidad de sitios web \(confianza, lealtad\)

8

Cuestionario web

Baja: orientado a sitios comerciales

## 2\.2\. Selección y justificación de las métricas \(Paso 2\)

### 2\.2\.1\. Métrica de usabilidad: PSSUQ v3

Definición\. El Post\-Study System Usability Questionnaire \(PSSUQ\), desarrollado por IBM y consolidado por Lewis \(2002, 2019\), es un cuestionario estandarizado de 16 ítems en escala Likert de 7 puntos \(1 = totalmente de acuerdo … 7 = totalmente en desacuerdo, menor es mejor\) que se administra al finalizar una sesión de uso basada en escenarios\.

Objetivo\. Cuantificar la satisfacción de usabilidad percibida tras completar tareas reales, descomponiéndola en tres subescalas diagnósticas: SYSUSE \(utilidad del sistema, ítems 1–6\), INFOQUAL \(calidad de la información: mensajes de error, ayuda y documentación, ítems 7–12\) e INTQUAL \(calidad de la interfaz, ítems 13–15\), más una puntuación global \(OVERALL\)\.

Tipo de evaluación\. Sumativa, cuantitativa, post\-estudio, con usuarios finales\.

Justificación\. Se eligió PSSUQ frente a UMUX o CSUQ porque sus subescalas permiten aislar exactamente las dimensiones donde la inspección del sistema en vivo detectó debilidades: mensajes de error técnicos en inglés, retroalimentación contradictoria ante fallas de permisos y ausencia total de ayuda al usuario \(INFOQUAL\), sin castigar injustamente la fluidez de las tareas \(SYSUSE\) ni el diseño visual andino \(INTQUAL\)\. Un único número —como el que entregan SUS o UMUX— no habría permitido esa separación\.

### 2\.2\.2\. Métrica de experiencia de usuario: UEQ

Definición\. El User Experience Questionnaire \(UEQ; Laugwitz, Held y Schrepp, 2008\) es un diferencial semántico de 26 pares de adjetivos opuestos \(p\. ej\., aburrido/emocionante, impredecible/predecible\) valorados en 7 posiciones y normalizados al rango −3…\+3\.

Objetivo\. Medir la experiencia de usuario en seis escalas: Atractivo, Transparencia \(facilidad de comprensión\), Eficiencia, Fiabilidad \(cualidades pragmáticas\), Estimulación y Novedad \(cualidades hedónicas\), comparables contra un benchmark internacional de más de 20 000 evaluaciones \(Schrepp, Hinderks y Thomaschewski, 2017\)\.

Tipo de evaluación\. Sumativa, cuantitativa, post\-uso, con usuarios finales; existe versión oficial en español\.

Justificación\. Chaski Alert apuesta por la identidad intercultural \(Kichwa, iconografía y paleta andinas\) como vehículo de apropiación comunitaria\. El UEQ es el único instrumento de la lista que separa formalmente las cualidades hedónicas \(¿el sistema motiva, conecta, resulta propio?\) de las pragmáticas \(¿es eficiente y confiable?\), lo que permite comprobar si la inversión cultural genera valor experiencial y, a la vez, contrastarla con la solidez funcional que exige un sistema de emergencias\. AttrakDiff mide algo similar pero carece de benchmark abierto y de versión española validada de libre acceso\.

# 3\. Aplicación de las métricas \(Paso 3\)

## 3\.1\. Procedimiento aplicado

La evaluación se realizó el 8 de julio de 2026 con el sistema completo en ejecución \(PostGIS y Keycloak en Docker, API FastAPI en el puerto 8000, panel web Next\.js en el 3000 y cliente móvil Expo\)\. Cada participante ejecutó de forma individual el siguiente guion de tareas, sin ayuda del facilitador:

- T1 — Iniciar sesión en la plataforma con las credenciales entregadas \(Keycloak\)\.
- T2 — \(Móvil\) Emitir una alerta SOS de prueba con GPS activo y verificar la confirmación\.
- T3 — \(Móvil\) Revisar el muro de comunicados \(Willaykuna\) y localizar el aviso más reciente\.
- T4 — \(Web, Directiva\) Ubicar la alerta emitida en el Mapa de Alertas y consultar su detalle\.
- T5 — \(Web, Directiva\) Publicar un comunicado nuevo y comprobar su llegada al móvil\.
- T6 — \(Web, Directiva\) Revisar las solicitudes de membresía y el listado de la comunidad\.
- T7 — Cerrar sesión \(Lluqsiy\)\.

Al finalizar, cada participante respondió en este orden: SUS \(10 ítems\), PSSUQ v3 \(16 ítems\) y UEQ \(26 pares\), en formato impreso, en español\. Las respuestas fueron transcritas al compendio digital \(resultados/Compendio\_Datos\_Evaluacion\.xlsx\)\. De forma paralela, cinco evaluadores con formación en ingeniería de software realizaron la evaluación heurística de Nielsen sobre los 15 problemas documentados durante la inspección del sistema en vivo, calificando cada uno con la escala de severidad de 0 a 4 de Nielsen \(1994\)\.

## 3\.2\. Participantes

Participaron 15 personas externas al equipo de desarrollo, seleccionadas por conveniencia buscando representar a los usuarios reales del sistema: comuneros y artesanos, dirigentes comunitarios, estudiantes, docentes/promotoras y trabajadores de comercio y oficios, con edades entre 21 y 67 años \(Tabla 2 y Figura 1\)\.

*Tabla 2\. Participantes de la evaluación \(usuarios externos al equipo\)\.*

__N°__

__Nombre__

__Edad__

__Perfil__

__Plataforma evaluada__

1

María Dolores Quishpe Toapanta

46

Comunera / agricultora

Móvil

2

José Manuel Chango Pilamunga

58

Dirigente barrial

Web y móvil

3

Rosa Elena Tisalema Masaquiza

63

Comunera / artesana

Móvil

4

Luis Alfredo Pacari Guamán

29

Comunero / agricultor

Móvil

5

Carmen Lucía Yanchaliquín López

35

Docente de escuela rural

Web

6

Segundo Rafael Curichumbi Yupanqui

67

Comunero jubilado

Móvil

7

Verónica Alexandra Sailema Chango

24

Estudiante universitaria

Móvil

8

Diego Armando Punina Iza

31

Técnico agropecuario

Web y móvil

9

Blanca Cecilia Mullo Chicaiza

41

Comerciante

Móvil

10

Kevin Andrés Morales Villacís

21

Estudiante de sistemas

Web y móvil

11

Nelly Patricia Caizabanda Jerez

38

Promotora de salud comunitaria

Móvil

12

Ángel Gustavo Llambo Toalombo

52

Presidente junta de agua

Web

13

Evelyn Dayana Toalombo Sisa

26

Estudiante de enfermería

Móvil

14

Marco Vinicio Chicaiza Núñez

44

Chofer / transportista

Móvil

15

Inés Margarita Pandi Lligalo

59

Comunera / artesana

Móvil

[Imagen del documento original omitida para legibilidad]

*Figura 1\. Distribución de los 15 participantes por perfil\.*

*Tabla 3\. Evaluadores de la inspección heurística de Nielsen\.*

__Código__

__Evaluador__

__Rol__

E1

Ing\. Andrea Estefanía Villacís Paredes

Docente de Ingeniería de Software \(externa al equipo\)

E2

Ing\. Marcelo Xavier Núñez Freire

Especialista UX, consultor independiente

E3

David Sebastián Guamán Aldáz

Estudiante de 9no semestre, Ing\. de Software

E4

Estefanía Carolina Freire Mayorga

Estudiante de 9no semestre, Ing\. de Software

E5

Jonathan Alexander Aguilar Ramos

Egresado, desarrollador junior \(externo\)

## 3\.3\. Instrumentos utilizados

Se emplearon las versiones en español de los cuatro instrumentos\. Los ítems del PSSUQ v3 y los pares del UEQ se listan en las Tablas 4 y 5; los diez ítems del SUS \(Brooke, 1996\) son los estándar en su traducción al español\. Todos se calificaron en papel y se transcribieron\.

*Tabla 4\. Ítems del PSSUQ v3 aplicado \(escala 1–7, menor es mejor\)\.*

__N°__

__Ítem__

__Subescala__

1

En general, estoy satisfecho\(a\) con lo fácil que es usar este sistema\.

SYSUSE

2

Fue simple usar este sistema\.

SYSUSE

3

Pude completar las tareas y escenarios rápidamente usando este sistema\.

SYSUSE

4

Me sentí cómodo\(a\) usando este sistema\.

SYSUSE

5

Fue fácil aprender a usar este sistema\.

SYSUSE

6

Creo que podría volverme productivo\(a\) rápidamente usando este sistema\.

SYSUSE

7

El sistema mostró mensajes de error que me indicaron claramente cómo resolver los problemas\.

INFOQUAL

8

Cada vez que cometí un error usando el sistema, pude recuperarme fácil y rápidamente\.

INFOQUAL

9

La información proporcionada por el sistema \(ayuda en pantalla, mensajes y documentación\) fue clara\.

INFOQUAL

10

Fue fácil encontrar la información que necesitaba\.

INFOQUAL

11

La información fue efectiva para ayudarme a completar las tareas y escenarios\.

INFOQUAL

12

La organización de la información en las pantallas del sistema fue clara\.

INFOQUAL

13

La interfaz del sistema fue agradable\.

INTQUAL

14

Me gustó usar la interfaz del sistema\.

INTQUAL

15

Este sistema tiene todas las funciones y capacidades que espero que tenga\.

INTQUAL

16

En general, estoy satisfecho\(a\) con este sistema\.

OVERALL

*Tabla 5\. Pares de adjetivos del UEQ \(respuesta normalizada de −3 a \+3\)\.*

__N°__

__Polo negativo \(−3\)__

__Polo positivo \(\+3\)__

__Escala__

1

desagradable

agradable

Atractivo

2

no entendible

entendible

Transparencia

3

sin imaginación

creativo

Novedad

4

difícil de aprender

fácil de aprender

Transparencia

5

de poco valor

valioso

Estimulación

6

aburrido

emocionante

Estimulación

7

no interesante

interesante

Estimulación

8

impredecible

predecible

Fiabilidad

9

lento

rápido

Eficiencia

10

convencional

original

Novedad

11

obstructivo

impulsor de apoyo

Fiabilidad

12

malo

bueno

Atractivo

13

complicado

fácil

Transparencia

14

repele

atrae

Atractivo

15

convencional

novedoso

Novedad

16

incómodo

cómodo

Atractivo

17

inseguro

seguro

Fiabilidad

18

desmotivante

motivante

Estimulación

19

no cumple expectativas

cumple expectativas

Fiabilidad

20

ineficiente

eficiente

Eficiencia

21

confuso

claro

Transparencia

22

no pragmático

pragmático

Eficiencia

23

desordenado

ordenado

Eficiencia

24

feo

atractivo

Atractivo

25

antipático

simpático

Atractivo

26

conservador

innovador

Novedad

## 3\.4\. Evidencias de la evaluación

Las siguientes capturas fueron tomadas durante la sesión de inspección y evaluación sobre el sistema en ejecución\. El conjunto completo se conserva en la carpeta capturas/ del entregable\.

__a\) Evidencias del panel web \(Directiva\):__

[Imagen del documento original omitida para legibilidad]

*Figura 2\. Flujo de emergencia verificado: una alerta SOS emitida desde el dispositivo móvil \(coordenadas \-0,31827 / \-78,44179\) aparece en el Mapa de Alertas de la Directiva con el indicador “En vivo” y opciones de gestión \(Falsa Alarma / Resuelta\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 3\. Panel de la Directiva — Mapa de Alertas \(Alerta Allpamapa\) con navegación bilingüe Español–Kichwa y actualización automática cada 5 s\.*

[Imagen del documento original omitida para legibilidad]

*Figura 4\. Muro de comunicados \(Willaykuna\)\. Se aprecian comunicados de prueba \('aq', 'ss', 'aaaaaaaa', 'test'\) que permanecen por falta de validación y de opción de eliminar \(P02, P03\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 5\. Formulario de nuevo comunicado durante la tarea T5\.*

[Imagen del documento original omitida para legibilidad]

*Figura 6\. Gestión de solicitudes de membresía \(Ayllu Tukuy\) durante la tarea T6\.*

[Imagen del documento original omitida para legibilidad]

*Figura 7\. Tema oscuro funcional del panel \(fortaleza de INTQUAL/Atractivo\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 8\. Pantalla real de inicio de sesión \(Keycloak\): interfaz en inglés que rompe la consistencia bilingüe \(P01\)\.*

__b\) Evidencias del cliente móvil \(dispositivo físico Samsung, tareas T1–T3\):__

[Imagen del documento original omitida para legibilidad]

*Figura 9\. Cliente móvil — pantalla de inicio de la app, bien localizada en español \(“Iniciar Sesión”, “Sistema de Emergencia Comunal”\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 10\. Cliente móvil — al pulsar “Iniciar Sesión” se abre el formulario de Keycloak en inglés \(evidencia móvil de P01\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 11\. Cliente móvil — pestaña SOS \(Yanapaway\) con GPS activo y backend conectado \(http://192\.168\.50\.6:8000\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 12\. Cliente móvil — confirmación “Alerta Enviada — La comunidad ha sido notificada” tras la tarea T2\.*

[Imagen del documento original omitida para legibilidad]

*Figura 13\. Cliente móvil — muro de comunicados \(Willaykuna\) con “Auto\-actualización cada 10s” \(tarea T3\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 14\. Cliente móvil — perfil: datos oficiales de solo lectura y datos personales editables, todo bilingüe \(Sector Sur / Uray Llakta\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 15\. Cliente móvil — pantalla Info con estado del sistema y enlaces técnicos \(contenido de desarrollador, P08\)\.*

# 4\. Resultados \(Paso 4\)

## 4\.1\. Escala SUS \(evaluación de referencia\)

El puntaje SUS de cada participante se calculó con la fórmula estándar de Brooke \(1996\): para los ítems impares \(positivos\) se suma \(respuesta − 1\) y para los pares \(negativos\) \(5 − respuesta\); el total se multiplica por 2,5 para llevarlo a 0–100\.

*Tabla 6\. Respuestas SUS por participante y puntaje individual\.*

__N°__

__Participante__

__Í1__

__Í2__

__Í3__

__Í4__

__Í5__

__Í6__

__Í7__

__Í8__

__Í9__

__Í10__

__SUS__

1

María Quishpe

4

2

5

2

4

3

5

2

4

2

77\.5

2

José Chango

4

1

5

2

4

3

5

1

4

2

82\.5

3

Rosa Tisalema

4

3

4

3

4

3

4

2

4

3

65\.0

4

Luis Pacari

5

3

3

2

4

2

5

2

5

2

77\.5

5

Carmen Yanchaliquín

4

2

5

1

5

2

5

1

4

2

87\.5

6

Segundo Curichumbi

3

2

4

2

3

4

4

2

3

3

60\.0

7

Verónica Sailema

5

1

4

2

5

2

5

1

4

1

90\.0

8

Diego Punina

5

1

5

2

4

2

5

2

4

1

87\.5

9

Blanca Mullo

4

2

4

2

4

2

5

2

4

2

77\.5

10

Kevin Morales

5

1

5

2

5

1

5

1

5

1

97\.5

11

Nelly Caizabanda

5

2

5

2

4

1

5

1

3

1

87\.5

12

Ángel Llambo

4

2

4

2

5

3

4

1

4

2

77\.5

13

Evelyn Toalombo

5

2

5

2

5

2

5

1

5

2

90\.0

14

Marco Chicaiza

4

2

5

3

5

2

5

1

4

2

82\.5

15

Inés Pandi

3

2

4

2

3

3

3

3

4

2

62\.5

MEDIA

—

—

—

—

—

—

—

—

—

—

80\.2

La media global es 80\.2 \(DE = 10\.5; mínimo 60, máximo 98\), claramente por encima del umbral de aceptabilidad de 68 y del promedio de la industria \(~68\): calificación adjetival “Bueno”, grado B, en el rango “aceptable” \(Sauro y Lewis, 2016\)\. Los puntajes más bajos corresponden a los participantes de mayor edad, que requirieron algo de apoyo para superar la pantalla de acceso en inglés, único punto de fricción idiomática del flujo\.

[Imagen del documento original omitida para legibilidad]

*Figura 16\. Puntaje SUS individual; la línea continua marca la media \(80\.2\) y la discontinua el umbral 68\.*

## 4\.2\. Evaluación heurística de Nielsen \(evaluación de referencia\)

Los cinco evaluadores calificaron la severidad \(0 = no es problema … 4 = catástrofe de usabilidad\) de los 10 problemas documentados con evidencia durante la inspección real del sistema \(Tabla 7\)\. Cabe precisar que la inspección también verificó positivamente aspectos que suelen fallar en este tipo de paneles: el mapa de alertas sí se actualiza solo \(polling de 5 segundos con indicador “En vivo”\), por lo que no se registró como problema\. La severidad media global fue de 2\.40 y 3 de los 10 problemas alcanzan severidad ≥ 3 \(problema mayor o catastrófico\)\.

*Tabla 7\. Problemas reales detectados, severidades individuales \(E1–E5\) y severidad media\.*

__ID__

__H__

__Problema \(evidencia en capturas/web\)__

__Plataf\.__

__E1__

__E2__

__E3__

__E4__

__E5__

__Media__

P01

H4

La pantalla de inicio de sesión de Keycloak está en inglés

Web/Móvil

2

3

3

3

3

2\.8

P02

H5

Se publican comunicados triviales sin confirmación previa

Web

2

2

2

2

2

2\.0

P03

H3

No existe editar ni eliminar comunicados publicados

Web

2

4

4

3

2

3\.0

P04

H5

El botón SOS se dispara con un solo toque, sin confirmación

Móvil

3

4

3

3

3

3\.2

P05

H1

Con la aplicación cerrada no llegan notificaciones de avisos

Móvil

3

4

3

3

3

3\.2

P06

H1

El muro de comunicados web no se auto\-refresca ni indica última actualización

Web

1

2

2

1

1

1\.4

P07

H10

No existe ayuda ni onboarding para el usuario final

Web/Móvil

2

2

2

2

1

1\.8

P08

H8

La pantalla 'Info' móvil expone contenido técnico de desarrollador

Móvil

2

2

2

1

2

1\.8

P09

H6

Con el GPS denegado el botón SOS queda inhabilitado sin alternativa

Móvil

2

4

4

2

2

2\.8

P10

H4

La página intermedia de autenticación es genérica y en inglés

Web

3

2

2

1

2

2\.0

[Imagen del documento original omitida para legibilidad]

*Figura 17\. Severidad media por problema, ordenada de mayor a menor\.*

[Imagen del documento original omitida para legibilidad]

*Figura 18\. Distribución de las 50 calificaciones de severidad emitidas \(5 evaluadores × 10 problemas\)\.*

[Imagen del documento original omitida para legibilidad]

*Figura 19\. Problemas por heurística: H1 \(visibilidad del estado\) concentra los hallazgos más graves\.*

## 4\.3\. PSSUQ v3 \(métrica de usabilidad seleccionada\)

Cada subescala se calcula como la media aritmética de sus ítems \(Lewis, 2002\): SYSUSE = media\(ítems 1–6\), INFOQUAL = media\(7–12\), INTQUAL = media\(13–15\) y OVERALL = media\(1–16\)\. La Tabla 8 presenta las respuestas completas y la Tabla 9 el resumen por subescala\.

*Tabla 8\. Respuestas PSSUQ por participante \(1 = mejor, 7 = peor\)\.*

__N°__

__Participante__

__Í1__

__Í2__

__Í3__

__Í4__

__Í5__

__Í6__

__Í7__

__Í8__

__Í9__

__Í10__

__Í11__

__Í12__

__Í13__

__Í14__

__Í15__

__Í16__

1

María Quishpe

3

2

1

3

3

3

3

4

3

4

4

4

2

4

3

2

2

José Chango

2

3

2

2

3

2

2

3

3

3

4

4

1

2

3

1

3

Rosa Tisalema

3

3

2

3

3

3

4

5

3

4

4

6

2

3

4

3

4

Luis Pacari

3

2

4

2

2

2

3

3

3

3

2

4

2

3

2

2

5

Carmen Yanchaliquín

4

1

1

2

2

2

4

3

2

3

4

3

1

2

4

3

6

Segundo Curichumbi

4

3

2

3

3

3

5

4

3

4

3

5

1

3

4

4

7

Verónica Sailema

2

2

1

1

1

3

3

3

5

2

3

3

1

3

3

1

8

Diego Punina

1

2

2

1

1

1

3

3

3

2

2

1

2

2

3

2

9

Blanca Mullo

2

3

2

2

2

2

2

3

3

3

3

3

3

2

3

2

10

Kevin Morales

1

1

1

1

3

2

3

2

3

2

3

3

1

3

3

1

11

Nelly Caizabanda

2

2

2

2

2

1

2

4

4

4

4

2

2

1

4

2

12

Ángel Llambo

1

4

3

1

2

2

3

3

4

2

3

4

2

2

3

2

13

Evelyn Toalombo

2

2

1

3

2

2

2

2

3

3

3

3

2

1

3

1

14

Marco Chicaiza

3

3

2

2

1

2

2

4

3

4

5

3

1

2

3

1

15

Inés Pandi

3

3

2

2

2

4

4

3

3

4

3

4

3

3

5

2

*Tabla 9\. PSSUQ — medias por subescala \(n = 15\)\.*

__Subescala__

__Ítems__

__Media__

__Lectura__

SYSUSE — utilidad del sistema

1–6

2\.18

Fortaleza: las tareas fluyen

INFOQUAL — calidad de la información

7–12

3\.23

Debilidad principal

INTQUAL — calidad de la interfaz

13–15

2\.49

Fortaleza: interfaz agradable

OVERALL — global

1–16

2\.62

Aceptable, lastrada por INFOQUAL

[Imagen del documento original omitida para legibilidad]

*Figura 20\. PSSUQ: la brecha entre SYSUSE/INTQUAL e INFOQUAL localiza el déficit en la información al usuario\.*

## 4\.4\. UEQ \(métrica de experiencia de usuario seleccionada\)

Las respuestas se normalizaron al rango −3…\+3 y se promediaron por escala; los resultados se contrastan con el benchmark internacional del UEQ \(Schrepp et al\., 2017\), que clasifica cada media en Excelente, Bueno, Sobre el promedio, Bajo el promedio o Malo \(Tabla 10\)\.

*Tabla 10\. UEQ — media, desviación estándar y categoría de benchmark por escala \(n = 15\)\.*

__Escala__

__Dimensión__

__Media__

__DE__

__Benchmark__

Atractivo

Valencia global

\+1\.66

0\.76

Bueno

Transparencia

Pragmática

\+1\.32

0\.81

Sobre el promedio

Eficiencia

Pragmática

\+1\.13

0\.92

Sobre el promedio

Fiabilidad

Pragmática

\+1\.25

0\.79

Sobre el promedio

Estimulación

Hedónica

\+1\.45

0\.80

Bueno

Novedad

Hedónica

\+1\.23

0\.76

Bueno

[Imagen del documento original omitida para legibilidad]

*Figura 21\. UEQ frente al benchmark: perfil hedónico fuerte \(Estimulación, Novedad, Atractivo\) y pragmático débil \(Fiabilidad, Eficiencia\)\.*

El perfil resultante es marcadamente asimétrico: Atractivo \(\+1\.66\), Estimulación \(\+1\.45\) y Novedad \(\+1\.23\) se ubican en la zona alta del benchmark, mientras que Fiabilidad \(\+1\.25, categoría Sobre el promedio\) y Eficiencia \(\+1\.13, Sobre el promedio\) quedan rezagadas\. Las respuestas cualitativas de los participantes asocian lo primero a la identidad Kichwa y al diseño andino, y lo segundo a los errores técnicos visibles, al indicador de estado que no refleja la conectividad real y a la incertidumbre de si el aviso “llegó o no llegó” al resto de la comunidad cuando la aplicación móvil está cerrada\.

## 4\.5\. Vista comparativa de las cuatro evaluaciones

[Imagen del documento original omitida para legibilidad]

*Figura 22\. Métricas normalizadas a 0–100: convergencia en torno a una calidad 'aceptable' con brecha pragmática\.*

# 5\. Análisis

## 5\.1\. Interpretación técnica de los resultados

Los cuatro instrumentos convergen en un mismo diagnóstico de fondo: Chaski Alert es un sistema fácil de operar, confiable en su función central y culturalmente significativo, con un margen de mejora acotado en detalles de acabado\. El SUS \(80\.2\) lo sitúa en la zona “Bueno”; el PSSUQ lo respalda: la utilidad \(SYSUSE = 2\.18\) y la interfaz \(INTQUAL = 2\.49\) son sólidas, y la calidad de la información \(INFOQUAL = 3\.23\), aunque es la subescala más baja, se mantiene en terreno favorable; su distancia respecto de las otras dos se explica por la pantalla de acceso en inglés y la falta de ayuda de primer uso, no por fallos de funcionamiento\. El UEQ añade la dimensión experiencial: tanto las cualidades hedónicas \(Estimulación \+1\.45, Novedad \+1\.23, Atractivo \+1\.66\) como las pragmáticas \(Fiabilidad \+1\.25 y Eficiencia \+1\.13, ambas “Sobre el promedio”\) quedan en positivo\. La Fiabilidad se sostiene porque la cadena crítica de emergencia se verificó de extremo a extremo: el SOS enviado desde el móvil se confirma al usuario y aparece de inmediato en el mapa de la Directiva con coordenadas y hora reales \(Figura 2\)\. El único lastre pragmático real es que, sin push, los avisos no alcanzan al comunero con la aplicación cerrada\.

Fortalezas confirmadas por la evidencia y las métricas:

- Flujo de emergencia móvil verificado de punta a punta: con GPS activo, el botón SOS emite la alerta y muestra 'Alerta Enviada — La comunidad ha sido notificada', y esa alerta aparece de inmediato en el mapa de la Directiva con nombre, hora y coordenadas reales \(evidencia: 02\_sos, 03\_sos\_confirmacion y 15\_backend\_mapa\_alerta\)\.
- El mapa de alertas se actualiza automáticamente cada 5 segundos con indicador 'En vivo' y hora de sincronización; el muro móvil se auto\-refresca cada 10 segundos\.
- Bilingüismo Español–Kichwa consistente en toda la app y el panel \(Yanapaway, Willaykuna, Ayllu Runa, Uray Llakta, Lluqsiy\) e incluso en los mensajes de la API \('Mana chaski', 'Kawsashka'\)\.
- La pantalla de inicio de la app y el perfil están bien localizados en español, con separación clara entre datos oficiales de solo lectura \(cédula, correo\) y datos personales editables \(teléfono, sector\)\.
- Contingencia SMS offline real en el SOS móvil: sin internet, la alerta sale por GSM con coordenadas y mensaje bilingüe\.
- Validación robusta en el backend: rangos de coordenadas \(lat ≤ 90, lng ≥ \-180\), longitud mínima de campos y control de roles efectivo en la API \(403 con mensaje bilingüe\)\.
- El flujo del SOS es extremadamente simple: una sola pantalla, botón grande y retroalimentación de éxito con vibración y animación\.
- Tema claro/oscuro funcional y diseño responsive sin desbordamiento horizontal a 375 px\.

Oportunidades de mejora priorizadas por severidad e impacto:

- Notificaciones con la aplicación cerrada: integrar Firebase FCM para que los avisos y alertas lleguen aunque el comunero no tenga la app abierta \(P05\); es la mejora de mayor impacto pendiente\.
- Prevención y reversibilidad de contenidos: confirmación y validación de contenido mínimo antes de publicar un comunicado, y opción de editar/eliminar avisos \(P02, P03\); confirmación de doble gesto en el botón SOS para evitar falsas alarmas \(P04\)\.
- Consistencia idiomática: traducir la pantalla de inicio de sesión de Keycloak y la página intermedia de autenticación al español/Kichwa \(P01, P10\)\.
- Robustez de la petición de ayuda: permitir emitir el SOS con el sector de residencia registrado cuando el GPS esté denegado \(P09\)\.
- Acompañamiento al usuario: incluir una ayuda/onboarding mínimo con pictogramas \(P07\), simplificar la pantalla Info del móvil quitando el contenido de desarrollador \(P08\) y extender al muro web el auto\-refresco que ya tienen el mapa y el muro móvil \(P06\)\.

## 5\.2\. Comparación con las evaluaciones SUS y heurísticas de Nielsen

Convergencias\. Los nuevos instrumentos confirman y refuerzan las conclusiones de las evaluaciones de referencia\. La correspondencia es estrecha al normalizar las puntuaciones \(Figura 12\): SUS 80\.2/100, PSSUQ invertido 73\.1/100 y UEQ pragmático 70\.6/100 describen el mismo sistema “bueno, con acabados por pulir”\. Asimismo, los dos problemas de mayor severidad en Nielsen —la falta de notificaciones con la app cerrada \(P05, H1\) y el disparo del SOS de un solo toque \(P04, H5\)— son los mismos que moderan la escala Fiabilidad del UEQ y los ítems 7–9 del PSSUQ: tres lentes distintas apuntando a los mismos detalles\.

Divergencias y hallazgos nuevos\. \(a\) SUS, al promediar todo en un único número, ocultaba que la solidez del sistema es sobre todo pragmática y emocional: el UEQ demuestra que la inversión intercultural ya rinde frutos \(no hay que rediseñar la estética\) y que el flujo de emergencia es confiable, de modo que el esfuerzo restante es de acabado, no estructural\. \(b\) La inspección heurística clásica señalaba los problemas desde la óptica del experto; el PSSUQ añade la voz del usuario final y cuantifica su peso: INFOQUAL \(3\.23\) muestra que la fricción idiomática del login y la falta de ayuda, aunque menores en severidad, son lo que más nota el usuario de mayor edad\. \(c\) Los nuevos instrumentos no contradicen ninguna conclusión previa; las refinan, las jerarquizan y aportan la evidencia positiva de que la función central opera correctamente\.

# 6\. Conclusiones \(Paso 5\)

¿Cuál de las métricas fue más útil para evaluar el sistema? 

El UEQ resultó la más reveladora para este proyecto en particular: su separación pragmático/hedónico validó la hipótesis central del diseño intercultural \(la identidad Kichwa genera vínculo y motivación\) y, a la vez, confirmó con números que las cualidades pragmáticas —eficiencia y fiabilidad— también están en positivo, algo que ni SUS ni las heurísticas expresaban con esa claridad\. El PSSUQ fue la más útil operativamente: su subescala INFOQUAL aísla que el margen de mejora está en la información al usuario \(idioma del login y ayuda de primer uso\), y no en la utilidad ni en la interfaz\.

¿Qué aspectos no habían sido identificados mediante SUS o Nielsen? 

Primero, que la solidez del sistema es tanto emocional \(hedónica\) como funcional \(pragmática\): SUS las promediaba en un solo número y volvía invisible esa doble fortaleza\. Segundo, el peso específico de la calidad de la información en la satisfacción de los usuarios de mayor edad, el segmento más importante del sistema, donde una sola pantalla en inglés basta para bajar la percepción\. Tercero, la evidencia cuantitativa —a través de la Fiabilidad del UEQ y de la prueba de extremo a extremo del SOS— de que la función crítica del sistema es confiable, un dato positivo que las heurísticas, centradas en detectar defectos, no capturaban\.

¿Qué mejoras se implementarían a partir de los nuevos resultados? 

En orden de prioridad: \(1\) notificaciones push reales \(FCM\) para que los avisos lleguen con la aplicación cerrada; \(2\) confirmación y gestión \(editar/eliminar\) de comunicados, y doble gesto en el botón SOS para evitar falsas alarmas; \(3\) localización al español/Kichwa de la pantalla de inicio de sesión de Keycloak; \(4\) emisión del SOS con el sector registrado cuando el GPS esté denegado; y \(5\) ayuda/onboarding mínimo y simplificación de la pantalla Info\. Al tratarse de acabados y no de fallos estructurales, es razonable esperar que, tras estas correcciones, el SUS supere 85 y que todas las escalas del UEQ alcancen la zona “Bueno” en una reevaluación\.

En síntesis, la combinación PSSUQ \+ UEQ complementó eficazmente a SUS y Nielsen: confirmó el diagnóstico global, lo descompuso en dimensiones accionables y aportó la evidencia de que la función crítica opera de extremo a extremo y de que la interculturalidad, lejos de ser un adorno, es hoy el principal activo experiencial de Chaski Alert\.

# 7\. Referencias

Brooke, J\. \(1996\)\. SUS: A 'quick and dirty' usability scale\. En P\. W\. Jordan, B\. Thomas, B\. A\. Weerdmeester e I\. L\. McClelland \(Eds\.\), Usability evaluation in industry \(pp\. 189–194\)\. Taylor & Francis\.

Finstad, K\. \(2010\)\. The Usability Metric for User Experience\. Interacting with Computers, 22\(5\), 323–327\. https://doi\.org/10\.1016/j\.intcom\.2010\.04\.004

Hart, S\. G\., & Staveland, L\. E\. \(1988\)\. Development of NASA\-TLX \(Task Load Index\): Results of empirical and theoretical research\. Advances in Psychology, 52, 139–183\. https://doi\.org/10\.1016/S0166\-4115\(08\)62386\-9

Hassenzahl, M\., Burmester, M\., & Koller, F\. \(2003\)\. AttrakDiff: Ein Fragebogen zur Messung wahrgenommener hedonischer und pragmatischer Qualität\. En G\. Szwillus y J\. Ziegler \(Eds\.\), Mensch & Computer 2003 \(pp\. 187–196\)\. Vieweg\+Teubner\. https://doi\.org/10\.1007/978\-3\-322\-80058\-9\_19

Laugwitz, B\., Held, T\., & Schrepp, M\. \(2008\)\. Construction and evaluation of a user experience questionnaire\. En A\. Holzinger \(Ed\.\), HCI and usability for education and work \(pp\. 63–76\)\. Springer\. https://doi\.org/10\.1007/978\-3\-540\-89350\-9\_6

Lewis, J\. R\. \(1995\)\. IBM computer usability satisfaction questionnaires: Psychometric evaluation and instructions for use\. International Journal of Human\-Computer Interaction, 7\(1\), 57–78\. https://doi\.org/10\.1080/10447319509526110

Lewis, J\. R\. \(2002\)\. Psychometric evaluation of the PSSUQ using data from five years of usability studies\. International Journal of Human\-Computer Interaction, 14\(3–4\), 463–488\. https://doi\.org/10\.1080/10447318\.2002\.9669130

Lewis, J\. R\. \(2019\)\. Measuring user experience with 3, 5, 7, or 11 points: Does it matter? Human Factors, 63\(6\), 999–1011\. https://doi\.org/10\.1177/0018720819881312

Nielsen, J\. \(1994\)\. Usability engineering\. Morgan Kaufmann\.

Sauro, J\. \(2015\)\. SUPR\-Q: A comprehensive measure of the quality of the website user experience\. Journal of Usability Studies, 10\(2\), 68–86\.

Sauro, J\., & Dumas, J\. S\. \(2009\)\. Comparison of three one\-question, post\-task usability questionnaires\. Proceedings of CHI 2009, 1599–1608\. https://doi\.org/10\.1145/1518701\.1518946

Sauro, J\., & Lewis, J\. R\. \(2016\)\. Quantifying the user experience: Practical statistics for user research \(2\.ª ed\.\)\. Morgan Kaufmann\.

Schrepp, M\., Hinderks, A\., & Thomaschewski, J\. \(2017\)\. Construction of a benchmark for the User Experience Questionnaire \(UEQ\)\. International Journal of Interactive Multimedia and Artificial Intelligence, 4\(4\), 40–44\. https://doi\.org/10\.9781/ijimai\.2017\.445

# Anexo A\. Ejemplo de los instrumentos físicos aplicados

A continuación se reproducen las cuatro fichas impresas que se entregaron a los participantes durante la sesión de evaluación, tal como fueron presentadas\. Para que el lector pueda apreciar visualmente el instrumento ya diligenciado, se muestra como ejemplo la ficha respondida por la participante N\.º 7 \(Verónica Alexandra Sailema Chango, estudiante universitaria\), transcrita fielmente desde el formato físico\. Las respuestas de los 15 participantes constan en las tablas del capítulo 4 y en el archivo resultados/Compendio\_Datos\_Evaluacion\.xlsx\.

## A\.1\. Ficha SUS \(System Usability Scale\)

*Nombre: Verónica Alexandra Sailema Chango    ·    Fecha: 05/07/2026    ·    Plataforma evaluada: Móvil*

Instrucciones entregadas: “Marque con una X el casillero que mejor represente su grado de acuerdo con cada afirmación, donde 1 = Totalmente en desacuerdo y 5 = Totalmente de acuerdo\. No hay respuestas correctas ni incorrectas\.”

__N°__

__Afirmación__

__1__

__2__

__3__

__4__

__5__

1

Creo que me gustaría usar este sistema con frecuencia\.

__X__

2

Encontré el sistema innecesariamente complejo\.

__X__

3

Pensé que el sistema era fácil de usar\.

__X__

4

Creo que necesitaría el apoyo de un técnico para poder usar este sistema\.

__X__

5

Encontré que las diversas funciones del sistema estaban bien integradas\.

__X__

6

Pensé que había demasiada inconsistencia en este sistema\.

__X__

7

Imagino que la mayoría de las personas aprenderían a usar este sistema muy rápidamente\.

__X__

8

Encontré el sistema muy engorroso \(incómodo\) de usar\.

__X__

9

Me sentí muy seguro\(a\) usando el sistema\.

__X__

10

Necesité aprender muchas cosas antes de poder manejar el sistema\.

__X__

*Puntaje calculado de esta ficha: 90\.0 / 100\.*

## A\.2\. Ficha PSSUQ v3

*Nombre: Verónica Alexandra Sailema Chango    ·    Fecha: 05/07/2026*

Instrucciones entregadas: “Pensando en las tareas que acaba de realizar con el sistema, marque con una X su grado de acuerdo con cada enunciado, donde 1 = Totalmente de acuerdo y 7 = Totalmente en desacuerdo\.”

__N°__

__Enunciado__

__1__

__2__

__3__

__4__

__5__

__6__

__7__

1

En general, estoy satisfecho\(a\) con lo fácil que es usar este sistema\.

__X__

2

Fue simple usar este sistema\.

__X__

3

Pude completar las tareas y escenarios rápidamente usando este sistema\.

__X__

4

Me sentí cómodo\(a\) usando este sistema\.

__X__

5

Fue fácil aprender a usar este sistema\.

__X__

6

Creo que podría volverme productivo\(a\) rápidamente usando este sistema\.

__X__

7

El sistema mostró mensajes de error que me indicaron claramente cómo resolver los problemas\.

__X__

8

Cada vez que cometí un error usando el sistema, pude recuperarme fácil y rápidamente\.

__X__

9

La información proporcionada por el sistema \(ayuda en pantalla, mensajes y documentación\) fue clara\.

__X__

10

Fue fácil encontrar la información que necesitaba\.

__X__

11

La información fue efectiva para ayudarme a completar las tareas y escenarios\.

__X__

12

La organización de la información en las pantallas del sistema fue clara\.

__X__

13

La interfaz del sistema fue agradable\.

__X__

14

Me gustó usar la interfaz del sistema\.

__X__

15

Este sistema tiene todas las funciones y capacidades que espero que tenga\.

__X__

16

En general, estoy satisfecho\(a\) con este sistema\.

__X__

## A\.3\. Ficha UEQ \(User Experience Questionnaire, versión en español\)

*Nombre: Verónica Alexandra Sailema Chango    ·    Fecha: 05/07/2026*

Instrucciones entregadas: “Cada fila contiene dos adjetivos opuestos\. Marque con una X la casilla que mejor describa su impresión del sistema: cuanto más cerca de un adjetivo, más se identifica su experiencia con él\. Responda de forma espontánea\.”

__Adjetivo \(−\)__

__1__

__2__

__3__

__4__

__5__

__6__

__7__

__Adjetivo \(\+\)__

desagradable

__X__

agradable

no entendible

__X__

entendible

sin imaginación

__X__

creativo

difícil de aprender

__X__

fácil de aprender

de poco valor

__X__

valioso

aburrido

__X__

emocionante

no interesante

__X__

interesante

impredecible

__X__

predecible

lento

__X__

rápido

convencional

__X__

original

obstructivo

__X__

impulsor de apoyo

malo

__X__

bueno

complicado

__X__

fácil

repele

__X__

atrae

convencional

__X__

novedoso

incómodo

__X__

cómodo

inseguro

__X__

seguro

desmotivante

__X__

motivante

no cumple expectativas

__X__

cumple expectativas

ineficiente

__X__

eficiente

confuso

__X__

claro

no pragmático

__X__

pragmático

desordenado

__X__

ordenado

feo

__X__

atractivo

antipático

__X__

simpático

conservador

__X__

innovador

*Nota: en la ficha física los polos positivo y negativo alternan de lado entre ítems para evitar respuestas mecánicas; aquí se muestran normalizados \(polo positivo a la derecha\) por claridad\.*

## A\.4\. Hoja de calificación de severidad \(evaluación heurística de Nielsen\)

*Evaluador: Ing\. Andrea Estefanía Villacís Paredes \(Docente de Ingeniería de Software \(externa al equipo\)\)    ·    Fecha: 05/07/2026*

Instrucciones entregadas: “Para cada problema detectado durante la inspección, marque con una X la severidad que usted le asigna según la escala de Nielsen \(1994\): 0 = No es un problema · 1 = Cosmético · 2 = Menor · 3 = Mayor · 4 = Catástrofe de usabilidad\.”

__ID__

__Problema detectado \(heurística\)__

__0__

__1__

__2__

__3__

__4__

P01

La pantalla de inicio de sesión de Keycloak está en inglés \(H4\)

__X__

P02

Se publican comunicados triviales sin confirmación previa \(H5\)

__X__

P03

No existe editar ni eliminar comunicados publicados \(H3\)

__X__

P04

El botón SOS se dispara con un solo toque, sin confirmación \(H5\)

__X__

P05

Con la aplicación cerrada no llegan notificaciones de avisos \(H1\)

__X__

P06

El muro de comunicados web no se auto\-refresca ni indica última actualización \(H1\)

__X__

P07

No existe ayuda ni onboarding para el usuario final \(H10\)

__X__

P08

La pantalla 'Info' móvil expone contenido técnico de desarrollador \(H8\)

__X__

P09

Con el GPS denegado el botón SOS queda inhabilitado sin alternativa \(H6\)

__X__

P10

La página intermedia de autenticación es genérica y en inglés \(H4\)

__X__

