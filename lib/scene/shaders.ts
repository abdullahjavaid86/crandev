/**
 * The whole scene, as two shader strings.
 *
 * There is one draw call on this page: a fullscreen quad whose fragment shader
 * paints a domain-warped noise gradient in three themed colours and three
 * rotated glass panes as signed-distance fields. No lights, no transmission
 * pass, no meshes beyond the quad — that is what keeps it affordable on a
 * mid-range GPU, and it is why `three` is here at all: a refracting pane over a
 * living gradient is not something `motion`, CSS or SVG can produce.
 *
 * Strings rather than files so the bundler needs no GLSL loader, and separate
 * from `createScene.ts` so the graphics wiring and the picture stay readable
 * on their own.
 */

/**
 * The quad is already in clip space, so the camera never transforms it. The
 * orthographic camera exists only because `renderer.render` needs one.
 */
export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Colours arrive as uniforms from the `--scene-*` tokens, so the shader never
 * names a colour and the light and dark themes are the same picture.
 */
export const fragmentShader = /* glsl */ `
varying vec2 vUv;

uniform float uTime;
uniform float uScroll;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec4 uPane;

// Value noise, not simplex or a texture lookup: three octaves of this is a
// handful of sin() calls per pixel, and the gradient is so soft that the
// difference is invisible.
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    sum += amp * valueNoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

/**
 * The gradient, sampled at an arbitrary point so a pane can re-sample it a
 * little way off its own position and read as refraction.
 *
 * Everything here is mix(), never addition: the output can only ever be a
 * blend of the three token colours, so the background cannot brighten past the
 * value the tokens were contrast-checked at.
 */
vec3 gradientAt(vec2 p) {
  vec2 q = p + 0.35 * vec2(
    fbm(p * 1.4 + uTime * 0.02),
    fbm(p * 1.4 - uTime * 0.017 + 3.1)
  );
  float n = fbm(q * 1.1 + vec2(0.0, uScroll * 0.9));
  vec3 base = mix(uColorB, uColorA, smoothstep(0.25, 0.75, n));
  return mix(base, uColorC, smoothstep(0.55, 0.95, fbm(q * 0.7 + uScroll)));
}

float sdRoundBox(vec2 p, vec2 halfSize, float radius) {
  vec2 d = abs(p) - halfSize + radius;
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
}

vec2 rotate(vec2 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

/**
 * One pane over whatever is already painted.
 *
 * Panes are composited in sequence rather than by max() of their masks. They
 * are placed so they do not overlap, which makes the two identical — and the
 * sequential form is what lets each pane keep its own refraction sample
 * instead of averaging three of them.
 */
vec3 pane(vec3 col, vec2 p, vec2 centre, float rot, vec2 halfSize) {
  float d = sdRoundBox(rotate(p - centre, -rot), halfSize, 0.06);

  // One pixel, at any resolution. A fixed constant is a fraction of the
  // viewport HEIGHT, so it draws a 17px band on a tall display and a 10px one
  // on a short one; the screen-space derivative of the distance field is the
  // same hairline everywhere. Taken before the branch below, because
  // derivatives are undefined inside non-uniform control flow.
  float aa = fwidth(d);

  float inside = 1.0 - smoothstep(0.0, aa, d);

  // Four gradient evaluations per pixel is the whole frame budget spent on
  // pixels that are not in a pane. The branch is coherent across large regions
  // of the screen, so the GPU skips it wholesale rather than per lane.
  if (inside > 0.0) {
    // Guarded at the pane's exact centre, where the direction is undefined and
    // normalize() would return NaN for that one pixel.
    vec2 toCentre = p - centre;
    vec3 refracted =
      gradientAt(p + 0.03 * toCentre / max(length(toCentre), 1e-5));
    col = mix(col, mix(refracted, uPane.rgb, uPane.a), inside);
  }

  // The only additive term in the shader, and it is a hairline: the light
  // catching the edge of the glass.
  float rim = 1.0 - smoothstep(0.0, aa, abs(d));
  return col + rim * 0.18 * uPane.rgb;
}

void main() {
  // Aspect-corrected so the panes stay rectangles rather than stretching with
  // the window.
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  vec3 col = gradientAt(p);

  // Scroll moves the panes apart and counter-rotates the middle one, so the
  // composition changes down the page without the background becoming a
  // different background. The half sizes are deliberately small: the scene is
  // ambient, and a pane you read as a rectangle is a pane competing with the
  // copy.
  float s = uScroll - 0.5;
  col = pane(
    col,
    p,
    vec2(-0.55, 0.35) + vec2(0.0, s * -0.7) + 0.02 * sin(uTime * 0.25),
    0.18 * -1.0 + s * 0.35,
    vec2(0.294, 0.182)
  );
  col = pane(
    col,
    p,
    vec2(0.6, 0.05) + vec2(0.0, s * 0.5) + 0.02 * sin(uTime * 0.25 + 1.0),
    s * -0.35,
    vec2(0.238, 0.336)
  );
  col = pane(
    col,
    p,
    vec2(-0.15, -0.55) + vec2(0.0, s * -0.4) + 0.02 * sin(uTime * 0.25 + 2.0),
    0.18 + s * 0.35,
    vec2(0.35, 0.154)
  );

  gl_FragColor = vec4(col, 1.0);

  // Colour management is on, so every uniform arriving from Color.set() is
  // linear-sRGB while the framebuffer is read as sRGB. A built-in material
  // calls this chunk for us; a raw ShaderMaterial gets linearToOutputTexel()
  // defined in its prefix and never called, which renders --scene-a as #ced6ff
  // instead of #e8ecff and drops --muted on it from 5.2:1 to 4.3:1.
  #include <colorspace_fragment>
}
`;
