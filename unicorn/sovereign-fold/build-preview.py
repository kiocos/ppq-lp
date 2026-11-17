import json
from pathlib import Path

root = Path(__file__).parent
effect = json.loads((root / "art-source.json").read_text())
vertex = effect["vertex"]
fragment = effect["fragment"]
fragment = fragment.replace("out vec4 fragColor;", "uniform vec2 uResolution;\nuniform float uAmount;\nuniform float uQuietCenter;\nout vec4 fragColor;")
fragment = fragment.replace("fragColor = vec4(color, 1.0);", """
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 copyPoint = (uv - vec2(0.5, 0.62)) / vec2(0.46, 0.42);
  float quiet = mix(1.0, smoothstep(0.45, 1.7, dot(copyPoint, copyPoint)), uQuietCenter);
  float fade = smoothstep(0.0, 0.07, uv.y) * (1.0 - smoothstep(0.91, 1.0, uv.y));
  float alpha = uAmount * quiet * fade;
  fragColor = vec4(color, alpha);
""")
data = json.dumps({"vertex": vertex, "fragment": fragment, "properties": effect["properties"]}, ensure_ascii=False)
template = (root / "preview-template.html").read_text()
(root / "preview.html").write_text(template.replace("__SCENE_DATA__", data))
