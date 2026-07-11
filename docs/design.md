# Add marketplace to Claude Code
/plugin marketplace add freshtechbro/claudedesignskills

# Install individual plugins
/plugin install threejs-webgl
/plugin install gsap-scrolltrigger
/plugin install react-three-fiber

# Or install complete bundles
/plugin install core-3d-animation        # 5 skills: Three.js, GSAP, R3F, Motion, Babylon
/plugin install extended-3d-scroll       # 6 skills: A-Frame, Vanta, PlayCanvas, PixiJS, Locomotive, Barba
/plugin install animation-components     # 5 skills: React Spring, Magic UI, AOS, Anime.js, Lottie
/plugin install authoring-motion         # 4 skills: Blender, Spline, Rive, Substance 3D
/plugin install meta-skills             # 2 skills: Integration patterns, Modern design

# Clone into your skills folder
git clone https://github.com/199-biotechnologies/motion-dev-animations-skill.git ~/.claude/skills/motion-dev-animations

# Or add as a git submodule in your project
git submodule add https://github.com/199-biotechnologies/motion-dev-animations-skill.git .claude/skills/motion-dev-animations