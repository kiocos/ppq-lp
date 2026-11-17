// Bundles the 3D privacy scene into one classic script (pages are opened from file://, where ES modules are blocked).
// Usage: node build.mjs  →  ../assets/enclave3d.js
import * as esbuild from '/Users/kio/shorts-historicos/node_modules/esbuild/lib/main.js';
await esbuild.build({
  entryPoints: ['main.js'], bundle: true, format: 'iife', globalName: 'Enclave3D', minify: true, target: 'es2020',
  nodePaths: ['/Users/kio/shorts-historicos/node_modules'], outfile: '../assets/enclave3d.js', legalComments: 'eof',
});
console.log('built ../assets/enclave3d.js');
