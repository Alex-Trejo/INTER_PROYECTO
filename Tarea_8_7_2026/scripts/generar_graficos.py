# -*- coding: utf-8 -*-
"""Genera los graficos PNG de la evaluacion (paleta validada del skill dataviz)."""
import json, os, sys, statistics as st
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRATCH = os.path.dirname(os.path.abspath(__file__))
RES = r"C:\Users\trejo\Desktop\S9\Inter\P_I\PR\INTER_PROYECTO\Tarea_8_7_2026\resultados"
DATA = json.load(open(os.path.join(SCRATCH, "datos_evaluacion.json"), encoding="utf-8"))

# --- paleta validada (dataviz reference, modo claro) ---
CAT = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#e87ba4", "#eb6834"]
STATUS = {"good": "#0ca30c", "warning": "#fab219", "serious": "#ec835a", "critical": "#d03b3b"}
INK, INK2, MUTED, GRID, BASE = "#0b0b0b", "#52514e", "#898781", "#e1e0d9", "#c3c2b7"
SURF = "#ffffff"

plt.rcParams.update({
    "font.family": "Segoe UI", "font.size": 10,
    "figure.facecolor": SURF, "axes.facecolor": SURF,
    "axes.edgecolor": BASE, "axes.labelcolor": INK2,
    "xtick.color": MUTED, "ytick.color": MUTED,
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.8,
    "svg.fonttype": "none",
})

def save(fig, carpeta, nombre):
    path = os.path.join(RES, carpeta)
    os.makedirs(path, exist_ok=True)
    f = os.path.join(path, nombre)
    fig.savefig(f, dpi=170, bbox_inches="tight", facecolor=SURF)
    plt.close(fig)
    print("->", os.path.join(carpeta, nombre))

# ============================================================================
# 0a. Pastel: perfil de participantes
# ============================================================================
BUCKET = {
    "Comunera / agricultora": "Comuneros y artesanos", "Comunero / agricultor": "Comuneros y artesanos",
    "Comunera / artesana": "Comuneros y artesanos", "Comunero jubilado": "Comuneros y artesanos",
    "Dirigente barrial": "Dirigentes comunitarios", "Presidente junta de agua": "Dirigentes comunitarios",
    "Estudiante universitaria": "Estudiantes", "Estudiante de sistemas": "Estudiantes",
    "Estudiante de enfermería": "Estudiantes",
    "Docente de escuela rural": "Docentes y promotoras", "Promotora de salud comunitaria": "Docentes y promotoras",
    "Técnico agropecuario": "Comercio y oficios", "Comerciante": "Comercio y oficios",
    "Chofer / transportista": "Comercio y oficios",
}
conteo = {}
for p in DATA["participantes"]:
    b = BUCKET[p["perfil"]]
    conteo[b] = conteo.get(b, 0) + 1
orden = ["Comuneros y artesanos", "Estudiantes", "Comercio y oficios", "Dirigentes comunitarios", "Docentes y promotoras"]
vals = [conteo[k] for k in orden]
fig, ax = plt.subplots(figsize=(7.2, 4.2))
w, t, a = ax.pie(vals, colors=CAT[:5], startangle=90, counterclock=False,
                 wedgeprops=dict(width=0.42, edgecolor=SURF, linewidth=2),
                 autopct=lambda pct: f"{int(round(pct*15/100))}", pctdistance=0.79,
                 textprops={"color": SURF, "fontsize": 11, "fontweight": "bold"})
ax.legend(w, [f"{k} — {v} ({v/15:.0%})" for k, v in zip(orden, vals)],
          loc="center left", bbox_to_anchor=(1.02, 0.5), frameon=False, fontsize=10)
ax.set_title("Perfil de los 15 participantes de la evaluación", color=INK, fontsize=13, fontweight="bold", pad=14)
ax.grid(False)
save(fig, "00_generales", "perfil_participantes_pastel.png")

# ============================================================================
# 0b. Comparativo normalizado de metricas (0-100)
# ============================================================================
sus_scores = [f["puntaje"] for f in DATA["sus"]["filas"]]
sus_media = st.mean(sus_scores)
pssuq_all = [v for f in DATA["pssuq"]["filas"] for v in f["respuestas"]]
pssuq_media = st.mean(pssuq_all)
pssuq_norm = (7 - pssuq_media) / 6 * 100
esc = {}
for f in DATA["ueq"]["filas"]:
    for item, v in zip(DATA["ueq"]["items"], f["respuestas"]):
        esc.setdefault(item["escala"], []).append(v)
m = {k: st.mean(v) for k, v in esc.items()}
ueq_att = (m["ATT"] + 3) / 6 * 100
ueq_prag = (st.mean([m["PER"], m["EFF"], m["DEP"]]) + 3) / 6 * 100
ueq_hed = (st.mean([m["STI"], m["NOV"]]) + 3) / 6 * 100

labels = ["SUS\n(usabilidad global)", "PSSUQ\n(invertido)", "UEQ Atractivo", "UEQ Calidad\npragmática", "UEQ Calidad\nhedónica"]
valores = [sus_media, pssuq_norm, ueq_att, ueq_prag, ueq_hed]
fig, ax = plt.subplots(figsize=(7.6, 4.0))
bars = ax.bar(labels, valores, color=[CAT[0], CAT[1], CAT[4], CAT[5], CAT[2]], width=0.62, zorder=3)
for b, v in zip(bars, valores):
    ax.text(b.get_x() + b.get_width()/2, v + 1.5, f"{v:.1f}", ha="center", color=INK, fontweight="bold", fontsize=10)
ax.axhline(68, color=MUTED, linewidth=1.2, linestyle=(0, (4, 3)), zorder=2)
ax.text(4.55, 69, "68 = referencia SUS 'aceptable'", color=MUTED, fontsize=8.5, ha="right")
ax.set_ylim(0, 100)
ax.set_ylabel("Puntuación normalizada (0–100)")
ax.set_title("Convergencia de las métricas aplicadas (normalizadas a 0–100)", color=INK, fontsize=12.5, fontweight="bold", pad=12)
ax.grid(axis="x", visible=False)
save(fig, "00_generales", "comparativo_metricas.png")

# ============================================================================
# 1. SUS por participante
# ============================================================================
nombres = [p["nombre"].split()[0] + " " + p["nombre"].split()[2] for p in DATA["participantes"]]
fig, ax = plt.subplots(figsize=(8.4, 4.4))
cols = [STATUS["critical"] if s < 51 else STATUS["serious"] if s < 68 else CAT[0] for s in sus_scores]
bars = ax.bar(range(15), sus_scores, color=cols, width=0.66, zorder=3)
for i, (b, v) in enumerate(zip(bars, sus_scores)):
    ax.text(b.get_x() + b.get_width()/2, v + 1.2, f"{v:.0f}", ha="center", color=INK2, fontsize=8.5)
ax.axhline(sus_media, color=INK, linewidth=1.4, zorder=4)
ax.text(14.4, sus_media + 1.5, f"Media = {sus_media:.1f}", color=INK, fontsize=9.5, fontweight="bold", ha="right")
ax.axhline(68, color=MUTED, linewidth=1.1, linestyle=(0, (4, 3)), zorder=2)
ax.text(-0.4, 69, "68 = umbral 'aceptable' (Brooke)", color=MUTED, fontsize=8.5)
ax.set_xticks(range(15))
ax.set_xticklabels(nombres, rotation=40, ha="right", fontsize=8.5)
ax.set_ylim(0, 100)
ax.set_ylabel("Puntaje SUS (0–100)")
ax.set_title("SUS — puntaje individual de los 15 participantes", color=INK, fontsize=12.5, fontweight="bold", pad=12)
ax.grid(axis="x", visible=False)
save(fig, "01_SUS", "sus_por_participante.png")

# ============================================================================
# 2a. Nielsen: severidad media por problema (barh)
# ============================================================================
mat = DATA["nielsen"]["matriz"]
probs = DATA["problemas"]
sev_media = [st.mean(mat[e][i] for e in range(5)) for i in range(len(probs))]
orden_idx = sorted(range(len(probs)), key=lambda i: sev_media[i])
def sev_color(v):
    return STATUS["critical"] if v >= 3.5 else STATUS["serious"] if v >= 2.5 else STATUS["warning"] if v >= 1.5 else STATUS["good"]
fig, ax = plt.subplots(figsize=(8.6, 5.6))
ys = range(len(probs))
vals_o = [sev_media[i] for i in orden_idx]
def corta(t, n=58):
    return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + "…"
labels_o = [f"{probs[i]['id']} ({probs[i]['heuristica']}) — {corta(probs[i]['titulo'])}" for i in orden_idx]
ax.barh(list(ys), vals_o, color=[sev_color(v) for v in vals_o], height=0.62, zorder=3)
for y, v in zip(ys, vals_o):
    ax.text(v + 0.05, y, f"{v:.1f}", va="center", color=INK, fontsize=9, fontweight="bold")
ax.set_yticks(list(ys))
ax.set_yticklabels(labels_o, fontsize=8.6, color=INK2)
ax.set_xlim(0, 4.35)
ax.set_xlabel("Severidad media (0 = sin problema · 4 = catástrofe de usabilidad)")
ax.set_title("Evaluación heurística de Nielsen — severidad media por problema (5 evaluadores)",
             color=INK, fontsize=12, fontweight="bold", pad=12)
ax.grid(axis="y", visible=False)
save(fig, "02_Nielsen", "nielsen_severidad_problemas.png")

# ============================================================================
# 2b. Nielsen: pastel de distribucion de severidades
# ============================================================================
todas = [mat[e][i] for e in range(5) for i in range(len(probs))]
niveles = [0, 1, 2, 3, 4]
cnt = [todas.count(n) for n in niveles]
et = ["0 · Sin problema", "1 · Cosmético", "2 · Menor", "3 · Mayor", "4 · Catastrófico"]
colores = [STATUS["good"], "#86b6ef", STATUS["warning"], STATUS["serious"], STATUS["critical"]]
nz = [(c, e, col) for c, e, col in zip(cnt, et, colores) if c > 0]
fig, ax = plt.subplots(figsize=(7.2, 4.2))
w, t, a = ax.pie([x[0] for x in nz], colors=[x[2] for x in nz], startangle=90, counterclock=False,
                 wedgeprops=dict(width=0.42, edgecolor=SURF, linewidth=2),
                 autopct=lambda pct: f"{pct:.0f}%", pctdistance=0.79,
                 textprops={"color": SURF, "fontsize": 10.5, "fontweight": "bold"})
ax.legend(w, [f"{e} — {c} calif." for c, e, _ in nz], loc="center left",
          bbox_to_anchor=(1.02, 0.5), frameon=False, fontsize=10)
ax.set_title(f"Distribución de las {len(todas)} calificaciones de severidad (5 evaluadores × {len(probs)} problemas)",
             color=INK, fontsize=11.5, fontweight="bold", pad=14)
ax.grid(False)
save(fig, "02_Nielsen", "nielsen_pastel_severidades.png")

# ============================================================================
# 2c. Nielsen: problemas por heuristica
# ============================================================================
heur = DATA["heuristicas"]
cuenta_h = {h: 0 for h in heur}
sev_h = {h: [] for h in heur}
for i, p in enumerate(probs):
    cuenta_h[p["heuristica"]] += 1
    sev_h[p["heuristica"]].append(sev_media[i])
hs = [h for h in heur if cuenta_h[h] > 0]
fig, ax = plt.subplots(figsize=(7.8, 3.9))
bars = ax.bar([f"{h}" for h in hs], [cuenta_h[h] for h in hs], color=CAT[0], width=0.58, zorder=3)
for b, h in zip(bars, hs):
    ax.text(b.get_x() + b.get_width()/2, b.get_height() + 0.06,
            f"{cuenta_h[h]} (sev. {st.mean(sev_h[h]):.1f})", ha="center", color=INK2, fontsize=9)
ax.set_ylabel("Problemas encontrados")
ax.set_ylim(0, max(cuenta_h.values()) + 0.9)
ax.set_title("Problemas detectados por heurística de Nielsen (severidad media entre paréntesis)",
             color=INK, fontsize=11.5, fontweight="bold", pad=12)
ax.grid(axis="x", visible=False)
save(fig, "02_Nielsen", "nielsen_problemas_por_heuristica.png")

# ============================================================================
# 3. PSSUQ subescalas
# ============================================================================
def sub_media(idx):
    return st.mean(f["respuestas"][i] for f in DATA["pssuq"]["filas"] for i in idx)
sysuse, infoq, intq = sub_media(range(0, 6)), sub_media(range(6, 12)), sub_media(range(12, 15))
overall = st.mean(pssuq_all)
fig, ax = plt.subplots(figsize=(7.6, 4.0))
lbl = ["SYSUSE\nUtilidad del sistema\n(ítems 1–6)", "INFOQUAL\nCalidad de la información\n(ítems 7–12)",
       "INTQUAL\nCalidad de la interfaz\n(ítems 13–15)", "OVERALL\nPuntuación global\n(ítems 1–16)"]
vv = [sysuse, infoq, intq, overall]
cols = [CAT[1], STATUS["serious"], CAT[1], CAT[0]]
bars = ax.bar(lbl, vv, color=cols, width=0.56, zorder=3)
for b, v in zip(bars, vv):
    ax.text(b.get_x() + b.get_width()/2, v + 0.07, f"{v:.2f}", ha="center", color=INK, fontweight="bold")
ax.axhline(4, color=MUTED, linewidth=1.1, linestyle=(0, (4, 3)))
ax.text(3.45, 4.08, "4 = punto neutro de la escala", color=MUTED, fontsize=8.5, ha="right")
ax.set_ylim(1, 7)
ax.set_ylabel("Media (1 = totalmente de acuerdo/mejor · 7 = peor)")
ax.set_title("PSSUQ v3 — medias por subescala (n = 15; menor es mejor)", color=INK, fontsize=12.5, fontweight="bold", pad=12)
ax.grid(axis="x", visible=False)
save(fig, "03_PSSUQ", "pssuq_subescalas.png")

# ============================================================================
# 4. UEQ vs benchmark (bandas oficiales)
# ============================================================================
BEN = DATA["ueq"]["benchmark"]
nombres_esc = {"ATT": "Atractivo", "PER": "Transparencia", "EFF": "Eficiencia",
               "DEP": "Fiabilidad", "STI": "Estimulación", "NOV": "Novedad"}
orden_esc = ["ATT", "PER", "EFF", "DEP", "STI", "NOV"]
band_cols = ["#f3c7c4", "#f6ddc0", "#f5edcb", "#d5e8d0", "#bcd9c0"]  # malo..excelente (tenues)
fig, ax = plt.subplots(figsize=(8.2, 4.4))
lo, hi = -1.0, 2.6
for xi, k in enumerate(orden_esc):
    exc, good, above, below = BEN[k]
    lims = [lo, below, above, good, exc, hi]
    for j in range(5):
        ax.add_patch(Rectangle((xi - 0.34, lims[j]), 0.68, lims[j+1] - lims[j],
                               facecolor=band_cols[j], edgecolor="none", zorder=1))
media_k = [st.mean(esc[k]) for k in orden_esc]
ax.plot(range(6), media_k, color=INK, linewidth=2, zorder=4, marker="o", markersize=7,
        markerfacecolor=INK, markeredgecolor=SURF, markeredgewidth=1.5)
for xi, v in enumerate(media_k):
    ax.text(xi + 0.03, v + 0.13, f"{v:+.2f}", color=INK, fontsize=9.5, fontweight="bold")
ax.set_xticks(range(6))
ax.set_xticklabels([nombres_esc[k] for k in orden_esc], fontsize=10)
ax.set_xlim(-0.6, 5.6)
ax.set_ylim(lo, hi)
ax.set_ylabel("Media de escala (−3 a +3)")
import matplotlib.patches as mpatches
leg = [mpatches.Patch(facecolor=c, label=l) for c, l in
       zip(band_cols[::-1], ["Excelente", "Bueno", "Sobre el promedio", "Bajo el promedio", "Malo"])]
ax.legend(handles=leg, loc="lower left", frameon=False, fontsize=8.5, ncol=5,
          bbox_to_anchor=(-0.02, -0.32), handlelength=1.2, columnspacing=1.0)
ax.set_title("UEQ — medias por escala frente al benchmark internacional (Schrepp et al., 2017)",
             color=INK, fontsize=12, fontweight="bold", pad=12)
ax.grid(axis="x", visible=False)
save(fig, "04_UEQ", "ueq_escalas_benchmark.png")

print("\nGraficos generados en", RES)
