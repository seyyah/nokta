import struct, json

glb_path = r'C:\Users\ASUS\OneDrive\Desktop\submissions\231118056-sibel-yeter\app\assets\avatar.glb'
with open(glb_path, 'rb') as f:
    magic = f.read(4)
    version = struct.unpack('<I', f.read(4))[0]
    length = struct.unpack('<I', f.read(4))[0]
    chunk_length = struct.unpack('<I', f.read(4))[0]
    chunk_type = struct.unpack('<I', f.read(4))[0]
    json_data = f.read(chunk_length)

gltf = json.loads(json_data)

# Print all bone/joint names from the skin
nodes = gltf.get('nodes', [])
skins = gltf.get('skins', [])
for skin in skins:
    joints = skin.get('joints', [])
    print(f'Skin: {skin.get("name","?")} - {len(joints)} joints:')
    for j in joints:
        node = nodes[j]
        print(f'  [{j}] {node.get("name","?")}')

# Print animation channels and what nodes they target
print('\n=== ANIMATION CHANNELS ===')
for ai, anim in enumerate(gltf.get('animations', [])):
    aname = anim.get('name', '?')
    channels = anim.get('channels', [])
    samplers = anim.get('samplers', [])
    print(f'Animation: {aname}')
    for ch in channels:
        target = ch.get('target', {})
        node_idx = target.get('node', -1)
        path = target.get('path', '?')
        node_name = nodes[node_idx].get('name', '?') if node_idx >= 0 else '?'
        print(f'  {path} -> node {node_idx} ({node_name})')
