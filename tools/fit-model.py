"""
Meshy'den gelen (Mixamo iskeletli, A duruşlu) GLB'yi sitenin insan iskeletine uydurur:

  blender -b --python tools/fit-model.py -- models/<ad>.glb src/models/<ad>.glb

Yaptıkları:
  1. Modeli omuz yüksekliği human.ts'teki SHOULDER_Y olacak biçimde ölçekler, ortalar.
  2. Baş modelde kalır ve "head" kemiğine bağlanır (neck=1.53 verilirse boyundan kesilir).
  3. Üçgen sayısını düşürür.
  4. Kolları A duruşundan Human'ın duruşuna (yana sarkık) indirir.
  5. Mixamo ağırlıklarını Human'ın kemiklerine toplar (root, armL/R, elbowL/R, legL/R, kneeL/R, head).
  6. Dokuyu "bölge haritası"na çevirir: R = bölge (kaftan, şerit, ten, saç, şalvar, çizme, kemer, maden, yüz çizgileri, ak, taş),
     G = açıklık. Renkler çalışma anında paletten verilir (src/procedural/model.ts).
"""
import bpy, bmesh, sys, json, os
import numpy as np
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = argv[0], argv[1]
OPT = dict(a.split('=') for a in argv[2:])
TARGET_TRIS = int(OPT.get('tris', 9000))
NECK_CUT = float(OPT.get('neck', 0))   # > 0 ise baş bu yükseklikten kesilir (baş kodla kurulacaksa)
TEX = int(OPT.get('tex', 1024))
# Yüz kutusu, "headfront" kemiğine göre: [yarı genişlik, aşağı, yukarı, geriye]
INK_MAX = int(OPT.get('ink', 200))   # yüzde bundan küçük koyu lekeler göz/kaş sayılır (1024 dokuda piksel)
FACE = [float(x) for x in OPT.get('face', '0.11,0,0.26,0.10').split(',')]

# human.ts ile aynı ölçüler
SHOULDER_Y, ARM_TILT = 1.43, 0.14
HIP, THIGH, LEG_X, UPPER = 0.92, 0.46, 0.085, 0.3

to_g = lambda v: np.array([v[0], v[2], -v[1]])      # Blender (z yukarı) -> glTF/three (y yukarı, +z ön)
to_b = lambda g: Vector((g[0], -g[2], g[1]))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
# İçe aktarıcı kemik gösterimi için küçük bir ağ da ekler; asıl ağ, köşesi en çok olandır.
ob = max((o for o in bpy.data.objects if o.type == 'MESH'), key=lambda o: len(o.data.vertices))
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
bpy.context.view_layer.update()
J = {b.name.split(':')[-1]: to_g(arm.matrix_world @ b.head_local) for b in arm.data.bones}

# Ağı iskeletten ayır, dünya uzayına al.
mw = ob.matrix_world.copy()
for m in list(ob.modifiers): ob.modifiers.remove(m)
ob.parent = None
ob.data.transform(mw)
ob.matrix_world = Matrix.Identity(4)
# Renk dokusu: Principled BSDF'in "Base Color" girişine bağlı resim.
src_img = next(l.from_node.image for m in bpy.data.materials if m.node_tree for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'
               for l in n.inputs['Base Color'].links if getattr(l.from_node, 'image', None))

# 1. Ölçek ve ortalama
s = SHOULDER_Y / ((J['LeftArm'][1] + J['RightArm'][1]) / 2)
shift = np.array([(J['LeftArm'][0] + J['RightArm'][0]) / 2, 0, J['Hips'][2]])
fitp = lambda p: (np.asarray(p) - shift) * s
J = {k: fitp(v) for k, v in J.items()}
bm = bmesh.new(); bm.from_mesh(ob.data)
for v in bm.verts: v.co = to_b(fitp(to_g(v.co)))

# 2. İstenirse başı kes, kesikleri kapat
r = {'geom_cut': []} if NECK_CUT <= 0 else bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=to_b((0, NECK_CUT, 0)), plane_no=(0, 0, 1), clear_outer=True)
cut = [e for e in r['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
caps = bmesh.ops.holes_fill(bm, edges=cut, sides=0)['faces'] if cut else []
caps = bmesh.ops.triangulate(bm, faces=caps)['faces'] if caps else []
uv = bm.loops.layers.uv.active
capset = set(caps)
for f in caps:
    for l in f.loops:
        src = next((o for o in l.vert.link_loops if o.face not in capset), None)
        if src: l[uv].uv = src[uv].uv
bmesh.ops.triangulate(bm, faces=bm.faces[:])
bm.to_mesh(ob.data); bm.free()
tris_cut = len(ob.data.polygons)

# 3. Sadeleştir
if tris_cut > TARGET_TRIS:
    # Baş (yüz) ayrıntısını koru: sadeleştirme ağırlığını gövdeye ver.
    hg = [g.index for g in ob.vertex_groups if g.name.split(':')[-1] in ('Head', 'HeadTop_End', 'headfront')]
    body = ob.vertex_groups.new(name='body')
    for v in ob.data.vertices:
        body.add([v.index], 1.0 - 0.75 * min(1.0, sum(g.weight for g in v.groups if g.group in hg)), 'REPLACE')
    mod = ob.modifiers.new('decimate', 'DECIMATE'); mod.ratio = TARGET_TRIS / tris_cut
    mod.vertex_group = 'body'; mod.vertex_group_factor = 2.0
    new = bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    ob.modifiers.remove(mod); ob.data = new; ob.vertex_groups.remove(ob.vertex_groups['body'])
bm = bmesh.new(); bm.from_mesh(ob.data); bmesh.ops.triangulate(bm, faces=bm.faces[:]); bm.to_mesh(ob.data); bm.free()
me = ob.data
nv, nf = len(me.vertices), len(me.polygons)
co = np.zeros(nv * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
P = np.stack([co[:, 0], co[:, 2], -co[:, 1]], 1)      # three uzayı
names = [g.name.split(':')[-1] for g in ob.vertex_groups]
W = np.zeros((nv, len(names)))
for v in me.vertices:
    for g in v.groups: W[v.index, g.group] = g.weight
W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
col = lambda n: W[:, names.index(n)] if n in names else np.zeros(nv)

# 4. Bölge haritası (kollar inmeden, A duruşundaki yüksekliklere göre)
px = np.zeros(src_img.size[0] * src_img.size[1] * 4, dtype=np.float32); src_img.pixels.foreach_get(px)
S = src_img.size[0]; k = S // TEX
full = px.reshape(S, S, 4)[:, :, :3] * 255
# Adaların dışı kapkaradır; kenar pikselleri karayla karışıktır. İkisini de dışarıda bırakıp küçült.
inked = full.max(-1) > 14
valid = inked.copy()
for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)): valid &= np.roll(inked, (dy, dx), (0, 1))
cnt = valid.reshape(TEX, k, TEX, k).sum((1, 3))
rgb = (full * valid[:, :, None]).reshape(TEX, k, TEX, k, 3).sum((1, 3)) / np.maximum(cnt, 1)[:, :, None]
covered = cnt > 0
REF = {'robe': (0x68, 0x29, 0x3a), 'dark': (0x34, 0x29, 0x27), 'brown': (0x62, 0x46, 0x3b), 'tan': (0xc2, 0xa1, 0x83), 'skin': (0xfb, 0xcd, 0xbd), 'grey': (0xbb, 0xba, 0xb8), 'white': (0xea, 0xe8, 0xe5),
       'black': (0x0c, 0x0a, 0x0a), 'gem': (0x20, 0xc8, 0xc8)}
keys = list(REF); refs = np.array([REF[n] for n in keys], dtype=np.float32)
cls = np.argmin(((rgb[:, :, None, :] - refs[None, None]) ** 2).sum(-1), -1)
lum = lambda c: c @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
shade = np.clip(lum(rgb) / lum(refs)[cls], 0.55, 1.3)

luv = np.zeros(len(me.loops) * 2); me.uv_layers.active.data.foreach_get('uv', luv); luv = luv.reshape(-1, 2)
lv = np.zeros(len(me.loops), dtype=np.int64); me.loops.foreach_get('vertex_index', lv)
fuv = luv.reshape(nf, 3, 2) * TEX; fcen = P[lv].reshape(nf, 3, 3).mean(1); fy = fcen[:, 1]
fc = np.clip(fuv.mean(1).astype(int), 0, TEX - 1); fcls = cls[fc[:, 1], fc[:, 0]]
belt_y = float(np.median(fy[(fcls == keys.index('brown')) & (fy > 0.8) & (fy < J['Neck'][1] - 0.1)]))
# Kuşaklar: 0 diz altı, 1 etek, 2 kemer üstü, 3 baş, 4 yüz (gözler ve kaşlar burada "mürekkep"tir, saç değil).
hf = J['headfront']
in_face = (np.abs(fcen[:, 0] - hf[0]) < FACE[0]) & (fcen[:, 1] > hf[1] - FACE[1]) & (fcen[:, 1] < hf[1] + FACE[2]) & (fcen[:, 2] > hf[2] - FACE[3])
zone_f = np.where(in_face, 4, np.where(fy > J['Neck'][1], 3, np.where(fy > belt_y + 0.05, 2, np.where(fy > 0.62, 1, 0)))).astype(np.uint8)
zone = np.full((TEX, TEX), 255, dtype=np.uint8)
for f in range(nf):
    t = fuv[f]; lo = np.maximum(np.floor(t.min(0) - 1).astype(int), 0); hi = np.minimum(np.ceil(t.max(0) + 1).astype(int), TEX - 1)
    if hi[0] < lo[0] or hi[1] < lo[1]: continue
    xs, ys = np.meshgrid(np.arange(lo[0], hi[0] + 1) + 0.5, np.arange(lo[1], hi[1] + 1) + 0.5)
    inside = np.ones(xs.shape, bool); area = (t[1, 0] - t[0, 0]) * (t[2, 1] - t[0, 1]) - (t[1, 1] - t[0, 1]) * (t[2, 0] - t[0, 0])
    sg = 1 if area >= 0 else -1
    for i in range(3):
        a, b = t[i], t[(i + 1) % 3]; L = max(np.hypot(*(b - a)), 1e-6)
        inside &= sg * ((b[0] - a[0]) * (ys - a[1]) - (b[1] - a[1]) * (xs - a[0])) / L >= -0.8
    sub = zone[lo[1]:hi[1] + 1, lo[0]:hi[0] + 1]; sub[inside] = zone_f[f]
for _ in range(6):   # yüzlerin kenarında boş kalan noktalar komşu yüzün kuşağını alır
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        nz = np.roll(zone, (dy, dx), (0, 1)); take = (zone == 255) & (nz != 255); zone[take] = nz[take]
# Gözler ve kaşlar da kapkaradır; yüz kuşağında kara pikseller boşluk değil, çizgidir. Renkleri buna göre yeniden küçült.
valid |= np.repeat(np.repeat(zone == 4, k, 0), k, 1) & ~inked
cnt = valid.reshape(TEX, k, TEX, k).sum((1, 3))
rgb = (full * valid[:, :, None]).reshape(TEX, k, TEX, k, 3).sum((1, 3)) / np.maximum(cnt, 1)[:, :, None]
covered = cnt > 0
cls = np.argmin(((rgb[:, :, None, :] - refs[None, None]) ** 2).sum(-1), -1)
shade = np.clip(lum(rgb) / np.maximum(lum(refs)[cls], 40), 0.55, 1.3)
ki = keys.index
# Bölgeler (model.ts ile aynı sıra): 1 kaftan, 2 şerit, 3 ten, 4 saç, 5 şalvar, 6 çizme, 7 kemer, 8 maden, 9 mürekkep, 10 ak, 11 taş
NSLOT, STEP = 11, 20
slot = np.zeros((TEX, TEX), dtype=np.uint8)
dark = (cls == ki('dark')) | (cls == ki('black')); pale = (cls == ki('grey')) | (cls == ki('white'))
slot[cls == ki('robe')] = 1; slot[cls == ki('tan')] = 2; slot[cls == ki('skin')] = 3
slot[dark] = 5; slot[dark & (zone >= 2)] = 4
slot[cls == ki('brown')] = 7; slot[(cls == ki('brown')) & (zone == 0)] = 6
# Yüzdeki koyu lekeler: küçük olanlar göz ve kaştır (mürekkep), büyük olanlar alna düşen saçtır.
fmask = dark & (zone == 4); lab = np.zeros(fmask.shape, np.int32); sizes = [0]
for y0, x0 in zip(*np.nonzero(fmask)):
    if lab[y0, x0]: continue
    n = len(sizes); stack = [(y0, x0)]; lab[y0, x0] = n; c = 0
    while stack:
        y, x = stack.pop(); c += 1
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < TEX and 0 <= xx < TEX and fmask[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; stack.append((yy, xx))
    sizes.append(c)
sizes = np.array(sizes); print('FACE_BLOBS', sorted(sizes[1:].tolist(), reverse=True)[:16])
slot[fmask & (sizes[lab] < INK_MAX * (TEX / 1024) ** 2)] = 9
slot[pale] = 8; slot[pale & (zone >= 3)] = 10
slot[cls == ki('gem')] = 11
# Yüzde çizgi kenarları (kara ile ten karışımı) şerit ya da maden sanılmasın: koyulaşmış ten olarak kalsın.
def thin(m, r=4):   # çevresinde azınlıkta kalan noktalar: ince çizgi ve kenarlar
    n = np.zeros(m.shape, np.int16)
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1): n += np.roll(m, (dy, dx), (0, 1))
    return m & (n < 0.4 * (2 * r + 1) ** 2)
edge = thin((zone == 4) & ((cls == ki('tan')) | (cls == ki('grey')) | (cls == ki('brown'))))
slot[edge] = 3; shade[edge] = np.clip(lum(rgb)[edge] / lum(refs)[ki('skin')], 0.55, 1.3)
slot[~covered] = 0
sh = (np.round(shade * 16) * 8).clip(0, 255).astype(np.uint8)   # 16 basamak: dosya küçülür
sh[np.abs(shade - 1) < 0.08] = 128
# Benekleri temizle: özgün dokudaki çizikler yanlış bölgeye düşer; çevresinde azınlıkta kalan nokta komşularına uyar.
R = 3
count = np.zeros((NSLOT + 1, TEX, TEX), dtype=np.int16)
for dy in range(-R, R + 1):
    for dx in range(-R, R + 1):
        sl = np.roll(slot, (dy, dx), (0, 1))
        for i in range(1, NSLOT + 1): count[i] += sl == i
own = np.take_along_axis(count, slot[None].astype(np.int64), 0)[0]
speck = (slot > 0) & (slot < 9) & (zone != 4) & (own < 0.3 * (2 * R + 1) ** 2)   # yüzün ince çizgilerine dokunma
slot[speck] = count.argmax(0)[speck]; sh[speck] = 128
sh[slot == 0] = 128
# Ada kenarlarını dışa doğru taşır: mipmap ve süzmede dikiş görünmesin.
for _ in range(12):
    empty = slot == 0
    if not empty.any(): break
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        ns, nh = np.roll(slot, (dy, dx), (0, 1)), np.roll(sh, (dy, dx), (0, 1))
        take = empty & (ns != 0) & (slot == 0)
        slot[take] = ns[take]; sh[take] = nh[take]
out_px = np.zeros((TEX, TEX, 4), dtype=np.float32)
out_px[:, :, 0] = slot * STEP / 255; out_px[:, :, 1] = sh / 255; out_px[:, :, 3] = 1
img = bpy.data.images.new('slots', TEX, TEX, alpha=False); img.colorspace_settings.name = 'Non-Color'
img.pixels.foreach_set(out_px.ravel()); img.file_format = 'PNG'
img.filepath_raw = OUT.replace('.glb', '.slots.png'); img.save(); img.pack()

# 5. Kolları indir: omuz, dirsek ve bilek çevresinde doğrusal karışımlı dönüş
def rot(u, d):
    u = u / np.linalg.norm(u); d = d / np.linalg.norm(d); v = np.cross(u, d); c = u @ d
    K = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + K + K @ K / (1 + c)
shoulder_x = (abs(J['LeftArm'][0]) + abs(J['RightArm'][0])) / 2
newP = P * (1 - sum(col(f'{sd}{b}') for sd in ('Left', 'Right') for b in ('Arm', 'ForeArm', 'Hand', 'HandMiddle4')))[:, None]
for sd, sign in (('Left', 1), ('Right', -1)):
    p0, p1, p2, p3 = J[sd + 'Arm'], J[sd + 'ForeArm'], J[sd + 'Hand'], J[sd + 'HandMiddle4']
    d = np.array([sign * np.sin(ARM_TILT), -np.cos(ARM_TILT), 0])
    T0 = np.array([sign * shoulder_x, SHOULDER_Y, 0]); T1 = T0 + np.linalg.norm(p1 - p0) * d; T2 = T1 + np.linalg.norm(p2 - p1) * d
    for bones, a, T, u in (((sd + 'Arm',), p0, T0, p1 - p0), ((sd + 'ForeArm',), p1, T1, p2 - p1), ((sd + 'Hand', sd + 'HandMiddle4'), p2, T2, p3 - p2)):
        w = sum(col(b) for b in bones)
        newP += w[:, None] * ((P - a) @ rot(u, d).T + T)
    J[sd + 'Elbow'] = T1; J[sd + 'Wrist'] = T2
P = newP

# 6. Ağırlıkları Human kemiklerine topla. Mixamo'nun "Left"i kişinin solu (+x); Human'da +x "R"dir.
BONES = ['root', 'armL', 'elbowL', 'armR', 'elbowR', 'legL', 'kneeL', 'legR', 'kneeR', 'head']
MAP = {'Arm': 'arm', 'ForeArm': 'elbow', 'Hand': 'elbow', 'HandMiddle4': 'elbow', 'UpLeg': 'leg', 'Leg': 'knee', 'Foot': 'knee', 'ToeBase': 'knee', 'Toe_End': 'knee'}
NW = np.zeros((nv, len(BONES)))
for i, n in enumerate(names):
    tgt = 'head' if n in ('Head', 'HeadTop_End', 'headfront') else 'root'
    for sd, hs in (('Left', 'R'), ('Right', 'L')):
        if n.startswith(sd) and n[len(sd):] in MAP: tgt = MAP[n[len(sd):]] + hs
    NW[:, BONES.index(tgt)] += W[:, i]
NW[NW < 0.02] = 0; NW /= NW.sum(1, keepdims=True)

me.vertices.foreach_set('co', np.stack([P[:, 0], -P[:, 2], P[:, 1]], 1).ravel()); me.update()
for p in me.polygons: p.use_smooth = True
for g in list(ob.vertex_groups): ob.vertex_groups.remove(g)
groups = [ob.vertex_groups.new(name=b) for b in BONES]
for vi in range(nv):
    for bi in np.nonzero(NW[vi])[0]: groups[bi].add([vi], float(NW[vi, bi]), 'REPLACE')

# Yeni iskelet: Human'ın eklem yerleri
bpy.data.objects.remove(arm)
ad = bpy.data.armatures.new('rig'); rig = bpy.data.objects.new('rig', ad); bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='EDIT')
JOINT = {'root': (0, 0, 0), 'head': (0, J['Neck'][1], 0)}   # baş boyun ekleminden döner
for hs, sign in (('L', -1), ('R', 1)):
    sh0 = np.array([sign * shoulder_x, SHOULDER_Y, 0]); d = np.array([sign * np.sin(ARM_TILT), -np.cos(ARM_TILT), 0])
    JOINT['arm' + hs] = sh0; JOINT['elbow' + hs] = sh0 + UPPER * d
    JOINT['leg' + hs] = (sign * LEG_X, HIP, 0); JOINT['knee' + hs] = (sign * LEG_X, HIP - THIGH, 0)
eb = {}
for b in BONES:
    e = ad.edit_bones.new(b); e.head = to_b(JOINT[b]); e.tail = e.head + Vector((0, 0, 0.1)); eb[b] = e
for b in BONES[1:]: eb[b].parent = eb[{'arm': 'root', 'leg': 'root', 'hea': 'root', 'elbow': 'arm' + b[-1], 'knee': 'leg' + b[-1]}[b[:-1]]]
bpy.ops.object.mode_set(mode='OBJECT')
ob.parent = rig; ob.modifiers.new('rig', 'ARMATURE').object = rig

# Malzeme: yalnızca bölge haritası
mat = bpy.data.materials.new('slots'); mat.use_nodes = True
nt = mat.node_tree; tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img
bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'); nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
bsdf.inputs['Metallic'].default_value = 0; bsdf.inputs['Roughness'].default_value = 1
me.materials.clear(); me.materials.append(mat)
for im in list(bpy.data.images):
    if im != img: bpy.data.images.remove(im)
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
ob.name = me.name = 'body'
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=False, export_tangents=False, export_skins=True, export_yup=True, export_image_format='AUTO')
os.remove(img.filepath_raw)   # harita GLB'nin içinde
print('FIT ' + json.dumps({'head_tris': int((fy > J['Neck'][1]).sum()), 'face_tris': int(in_face.sum()), 'scale': round(s, 4), 'shoulder_x': round(shoulder_x, 4), 'belt_y': round(belt_y, 3), 'tris_after_cut': tris_cut, 'tris': nf, 'verts': nv,
    'joints': {k: [round(float(x), 3) for x in v] for k, v in J.items() if k in ('headfront', 'Hips', 'LeftArm', 'LeftElbow', 'LeftWrist', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'Neck', 'Head', 'HeadTop_End')}}))
